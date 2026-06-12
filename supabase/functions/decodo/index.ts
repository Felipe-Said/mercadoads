import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type ProviderSettings = {
  active: boolean
  api_base_url: string
  products_path: string
  api_key: string | null
  username: string | null
  password: string | null
}

type ProxyOfferRow = {
  id: number
  name: string
  type: string
  country: string
  city: string | null
  protocol: string
  endpoint: string | null
  port: string | null
  price: string
  traffic: string
  stock: string
  status: string
  price_amount: number | null
  traffic_limit_gb: number
  service_type: string
  auto_disable: boolean
}

type CapacityResult = {
  configured: boolean
  success: boolean
  status: number
  data?: unknown
  totalLimit: number | null
  allocatedLimit: number
  availableLimit: number | null
}

type ProxyOffer = {
  id: string
  name: string
  type: string
  country: string
  city: string
  protocol: string
  endpoint: string
  port: string
  price: string
  priceAmount: number
  traffic: string
  trafficLimitGb: number
  stock: string
  status: string
}

type RequestUser = {
  id: string
  email?: string
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function asRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

function firstString(...values: unknown[]) {
  const found = values.find((value) => {
    if (typeof value === 'string') return value.trim().length > 0
    return value !== null && value !== undefined && String(value).trim().length > 0
  })

  return found === undefined || found === null ? '' : String(found).trim()
}

function toNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value.replace(',', '.').replace(/[^\d.]/g, ''))
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function findNumbersByKey(value: unknown, keyPattern: RegExp, numbers: number[] = []) {
  const record = asRecord(value)
  if (!record) {
    if (Array.isArray(value)) value.forEach((item) => findNumbersByKey(item, keyPattern, numbers))
    return numbers
  }

  for (const [key, item] of Object.entries(record)) {
    if (keyPattern.test(key)) {
      const parsed = toNumber(item)
      if (parsed !== null) numbers.push(parsed)
    }
    findNumbersByKey(item, keyPattern, numbers)
  }

  return numbers
}

function extractResidentialTrafficLimit(data: unknown) {
  const root = asRecord(data)
  const candidates: unknown[] = []
  if (Array.isArray(data)) candidates.push(...data)
  if (Array.isArray(root?.data)) candidates.push(...root.data)
  if (Array.isArray(root?.subscriptions)) candidates.push(...root.subscriptions)
  if (Array.isArray(root?.items)) candidates.push(...root.items)
  if (candidates.length === 0) candidates.push(data)

  const residential = candidates.filter((item) => {
    const text = JSON.stringify(item).toLowerCase()
    return text.includes('residential')
  })
  const sourceItems = residential.length > 0 ? residential : candidates

  const limits = sourceItems.flatMap((item) => findNumbersByKey(item, /(traffic.*limit|limit.*traffic|included.*traffic|total.*traffic|traffic)$/i))
  return limits.length > 0 ? Math.max(...limits) : null
}

function extractAllocatedTraffic(data: unknown) {
  const root = asRecord(data)
  const candidates: unknown[] = []
  if (Array.isArray(data)) candidates.push(...data)
  if (Array.isArray(root?.data)) candidates.push(...root.data)
  if (Array.isArray(root?.items)) candidates.push(...root.items)
  if (Array.isArray(root?.results)) candidates.push(...root.results)
  if (Array.isArray(root?.statistics)) candidates.push(...root.statistics)
  if (candidates.length === 0) candidates.push(data)

  const values = candidates.flatMap((item) => findNumbersByKey(item, /(traffic|traffic.*used|used.*traffic|consumed.*traffic|bytes|gb)$/i))
  if (values.length === 0) return 0

  const total = values.reduce((sum, value) => sum + value, 0)
  return total > 1024 ? total / 1024 / 1024 / 1024 : total
}

function makePassword() {
  const random = crypto.getRandomValues(new Uint32Array(3))
  return `Cm_9${random[0].toString(36)}A+z${random[1].toString(36)}`.slice(0, 20)
}

function makeUsername(saleId: string, buyerId: string) {
  const compactSale = saleId.replace(/\D/g, '').slice(-8).padStart(6, '0')
  const compactBuyer = buyerId.replace(/-/g, '').slice(0, 8).toLowerCase()
  return `cm${compactSale}${compactBuyer}`.slice(0, 20)
}

async function parseRequestBody(req: Request) {
  const raw = await req.text()
  if (!raw) return {}
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return {}
  }
}

async function getRequestUser(req: Request, supabaseAdmin: ReturnType<typeof createClient>) {
  const authorization = req.headers.get('Authorization') || ''
  const token = authorization.replace(/^Bearer\s+/i, '').trim()
  if (!token) return null

  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data.user) return null
  return data.user as RequestUser
}

async function loadSettings(supabaseAdmin: ReturnType<typeof createClient>) {
  const { data, error } = await supabaseAdmin
    .from('decodo_settings')
    .select('active, api_base_url, products_path, api_key, username, password')
    .eq('id', 1)
    .maybeSingle()

  if (error) throw error
  return data as ProviderSettings | null
}

async function loadProxyOffers(supabaseAdmin: ReturnType<typeof createClient>) {
  const { data, error } = await supabaseAdmin
    .from('proxy_offers')
    .select('id, name, type, country, city, protocol, endpoint, port, price, traffic, stock, status, price_amount, traffic_limit_gb, service_type, auto_disable')
    .eq('is_active', true)
    .not('price_amount', 'is', null)
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })

  if (error) throw error
  return (data ?? []) as ProxyOfferRow[]
}

async function callProvider(settings: ProviderSettings, path: string, init: RequestInit = {}) {
  const apiKey = settings.api_key?.trim()
  if (!apiKey) {
    return { configured: false as const }
  }

  const base = (settings.api_base_url || 'https://api.decodo.com/v2').replace(/\/+$/, '')
  const targetUrl = /^https?:\/\//i.test(path)
    ? path
    : `${base}${path.startsWith('/') ? path : `/${path}`}`
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  headers.set('Authorization', apiKey)

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(targetUrl, { ...init, headers })
  const text = await response.text()
  let data: unknown = text

  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!response.ok) {
    return { configured: true as const, success: false as const, status: response.status, data }
  }

  return { configured: true as const, success: true as const, status: response.status, data }
}

function unwrapProviderRows(data: unknown) {
  const root = asRecord(data)
  if (Array.isArray(data)) return data
  if (Array.isArray(root?.data)) return root.data
  if (Array.isArray(root?.items)) return root.items
  if (Array.isArray(root?.results)) return root.results
  return root ? [root] : []
}

function getProviderSubUserId(value: unknown) {
  const record = asRecord(value)
  return firstString(record?.id, record?.sub_user_id, record?.subUserId)
}

async function resolveProviderSubUserId(settings: ProviderSettings, delivery: Record<string, unknown>) {
  const existing = firstString(delivery.provider_sub_user_id)
  if (existing && /^\d+$/.test(existing)) return existing

  const username = firstString(delivery.username)
  if (!username) return existing

  const users = await callProvider(settings, '/sub-users?service_type=residential_proxies')
  if (users.configured === false || users.success === false) return existing

  const matched = unwrapProviderRows(users.data).find((item) => firstString(asRecord(item)?.username) === username)
  return getProviderSubUserId(matched) || existing
}

async function getProxyUsage(settings: ProviderSettings, delivery: Record<string, unknown>) {
  const subUserId = await resolveProviderSubUserId(settings, delivery)
  const fallbackLimit = toNumber(delivery.traffic_limit_gb) ?? 0

  if (!subUserId || !settings.api_key?.trim()) {
    return {
      providerSubUserId: subUserId,
      providerStatus: firstString(delivery.status, 'active'),
      trafficLimitGb: fallbackLimit,
      trafficUsedGb: null,
      trafficRemainingGb: null,
      providerError: settings.api_key?.trim() ? null : 'API publica nao configurada.',
    }
  }

  const [subUser, traffic] = await Promise.all([
    callProvider(settings, `/sub-users/${subUserId}`),
    callProvider(settings, `/sub-users/${subUserId}/traffic?type=custom&service_type=residential_proxies`),
  ])

  const subUserData = asRecord(subUser.success === false ? null : subUser.data)
  const trafficData = asRecord(traffic.success === false ? null : traffic.data)
  const limit = toNumber(subUserData?.traffic_limit) ?? fallbackLimit
  const used = toNumber(trafficData?.traffic) ?? toNumber(subUserData?.traffic) ?? null
  const remaining = used === null ? null : Math.max(limit - used, 0)

  return {
    providerSubUserId: subUserId,
    providerStatus: firstString(subUserData?.status, delivery.status, 'active'),
    trafficLimitGb: limit,
    trafficUsedGb: used,
    trafficRemainingGb: remaining,
    providerError: subUser.success === false || traffic.success === false ? 'Nao foi possivel atualizar todos os dados agora.' : null,
  }
}

async function getCapacity(settings: ProviderSettings) {
  const subscriptions = await callProvider(settings, settings.products_path || '/subscriptions')
  if (subscriptions.configured === false || subscriptions.success === false) return subscriptions

  const allocated = await callProvider(settings, 'https://api.decodo.com/api/v2/statistics/traffic', {
    method: 'POST',
    body: JSON.stringify({
      proxyType: 'residential_proxies',
      groupBy: 'proxy_user',
    }),
  })
  if (allocated.configured === false || allocated.success === false) return allocated

  const totalLimit = extractResidentialTrafficLimit(subscriptions.data)
  const allocatedLimit = extractAllocatedTraffic(allocated.data)

  if (totalLimit === null) {
    return {
      configured: true as const,
      success: false as const,
      status: 422,
      data: { message: 'Nao foi possivel confirmar o limite de trafego disponivel.' },
    }
  }

  return {
    configured: true as const,
    success: true as const,
    status: 200,
    data: subscriptions.data,
    totalLimit,
    allocatedLimit,
    availableLimit: Math.max(totalLimit - allocatedLimit, 0),
  }
}

async function loadBuyerProxyDeliveries(
  supabaseAdmin: ReturnType<typeof createClient>,
  settings: ProviderSettings,
  user: RequestUser,
) {
  const { data, error } = await supabaseAdmin
    .from('proxy_deliveries')
    .select('id, sale_id, buyer_id, proxy_offer_id, provider_sub_user_id, username, password, host, port, service_type, traffic_limit_gb, status, created_at, proxy_offers(name, traffic, protocol)')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error

  const rows = (data ?? []) as Array<Record<string, unknown>>
  return Promise.all(rows.map(async (delivery) => {
    const usage = await getProxyUsage(settings, delivery)
    return {
      id: String(delivery.id),
      saleId: String(delivery.sale_id ?? ''),
      proxyOfferId: delivery.proxy_offer_id ? String(delivery.proxy_offer_id) : null,
      providerSubUserId: usage.providerSubUserId,
      username: firstString(delivery.username),
      password: firstString(delivery.password),
      host: firstString(delivery.host, 'gate.decodo.com'),
      port: firstString(delivery.port, '7000'),
      serviceType: firstString(delivery.service_type, 'residential_proxies'),
      status: firstString(delivery.status, usage.providerStatus, 'active'),
      createdAt: firstString(delivery.created_at),
      offer: asRecord(delivery.proxy_offers),
      ...usage,
    }
  }))
}

function mapOffer(row: ProxyOfferRow, availableLimit: number | null): ProxyOffer | null {
  const priceAmount = Number(row.price_amount ?? 0)
  const trafficLimitGb = Number(row.traffic_limit_gb ?? 0)
  if (!priceAmount || !trafficLimitGb) return null
  if (availableLimit !== null && availableLimit < trafficLimitGb) return null

  return {
    id: String(row.id),
    name: firstString(row.name, `Proxy ${trafficLimitGb}GB`),
    type: firstString(row.type, 'Proxy residencial'),
    country: firstString(row.country, 'Global'),
    city: firstString(row.city),
    protocol: firstString(row.protocol, 'HTTP(S) / SOCKS5'),
    endpoint: firstString(row.endpoint, 'gate.decodo.com'),
    port: firstString(row.port, '7000'),
    price: firstString(row.price, new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(priceAmount)),
    priceAmount,
    traffic: firstString(row.traffic, `${trafficLimitGb}GB`),
    trafficLimitGb,
    stock: availableLimit === null ? firstString(row.stock, 'Plano ativo') : `${Math.floor(availableLimit / trafficLimitGb)} disponivel`,
    status: firstString(row.status, 'Disponivel'),
  }
}

function hasProxyPoolAccess(settings: ProviderSettings) {
  return Boolean(settings.api_key?.trim() || (settings.username?.trim() && settings.password?.trim()))
}

async function provisionProxySale(supabaseAdmin: ReturnType<typeof createClient>, settings: ProviderSettings, saleId: string) {
  const { data: sale, error: saleError } = await supabaseAdmin
    .from('sales')
    .select('id, buyer_id, proxy_offer_id, proxy_delivery_id, proxy_topup_gb, proxy_endpoint, proxy_port, status, proxy_offers(id, name, traffic_limit_gb, service_type, auto_disable)')
    .eq('id', saleId)
    .maybeSingle()

  if (saleError) throw saleError
  const saleRecord = asRecord(sale)
  if (!saleRecord?.proxy_offer_id || saleRecord.status !== 'paid') return { skipped: true }

  if (saleRecord.proxy_delivery_id) {
    const { data: delivery, error: deliveryError } = await supabaseAdmin
      .from('proxy_deliveries')
      .select('id, sale_id, buyer_id, proxy_offer_id, provider_sub_user_id, username, password, host, port, service_type, traffic_limit_gb, status')
      .eq('id', saleRecord.proxy_delivery_id)
      .eq('buyer_id', saleRecord.buyer_id)
      .maybeSingle()

    if (deliveryError) throw deliveryError
    const deliveryRecord = asRecord(delivery)
    if (!deliveryRecord) return { success: false, error: 'Proxy para recarga nao encontrada.' }

    const subUserId = await resolveProviderSubUserId(settings, deliveryRecord)
    const usage = await getProxyUsage(settings, deliveryRecord)
    const addedGb = Number(saleRecord.proxy_topup_gb ?? asRecord(saleRecord.proxy_offers)?.traffic_limit_gb ?? 0)
    const currentLimit = Number(usage.trafficLimitGb || deliveryRecord.traffic_limit_gb || 0)
    const nextLimit = currentLimit + addedGb

    const providerResult = subUserId
      ? await callProvider(settings, `/sub-users/${subUserId}`, {
        method: 'PUT',
        body: JSON.stringify({
          traffic_limit: nextLimit,
          auto_disable: asRecord(saleRecord.proxy_offers)?.auto_disable ?? true,
          status: 'active',
        }),
      })
      : { success: false as const, configured: true as const, data: { message: 'Subusuario do fornecedor nao encontrado.' } }

    await supabaseAdmin
      .from('proxy_deliveries')
      .update({
        provider_sub_user_id: subUserId || deliveryRecord.provider_sub_user_id,
        traffic_limit_gb: providerResult.success === false ? deliveryRecord.traffic_limit_gb : nextLimit,
        status: providerResult.success === false ? 'failed' : 'active',
        provider_payload: providerResult,
      })
      .eq('id', deliveryRecord.id)

    return providerResult.success === false
      ? providerResult
      : { success: true, topup: true, trafficLimitGb: nextLimit }
  }

  const existing = await supabaseAdmin
    .from('proxy_deliveries')
    .select('id')
    .eq('sale_id', saleId)
    .maybeSingle()

  if (existing.data) return { skipped: true, existing: true }

  const offer = asRecord(saleRecord.proxy_offers)
  const username = makeUsername(String(saleRecord.id), String(saleRecord.buyer_id))
  const password = makePassword()
  const trafficLimitGb = Number(offer?.traffic_limit_gb ?? 1)
  const serviceType = firstString(offer?.service_type, 'residential_proxies')
  const host = firstString(saleRecord.proxy_endpoint, 'gate.decodo.com')
  const port = firstString(saleRecord.proxy_port, '7000')

  const providerResult = await callProvider(settings, '/sub-users', {
    method: 'POST',
    body: JSON.stringify({
      username,
      password,
      service_type: serviceType,
      traffic_limit: trafficLimitGb,
      auto_disable: offer?.auto_disable ?? true,
    }),
  })

  if (providerResult.configured === false || providerResult.success === false) {
    await supabaseAdmin.from('proxy_deliveries').insert({
      sale_id: saleId,
      buyer_id: saleRecord.buyer_id,
      proxy_offer_id: saleRecord.proxy_offer_id,
      username,
      password,
      service_type: serviceType,
      traffic_limit_gb: trafficLimitGb,
      status: 'failed',
      provider_payload: providerResult,
    })
    return providerResult
  }

  const providerData = asRecord(providerResult.data)
  await supabaseAdmin.from('proxy_deliveries').insert({
    sale_id: saleId,
    buyer_id: saleRecord.buyer_id,
    proxy_offer_id: saleRecord.proxy_offer_id,
    provider_sub_user_id: firstString(providerData?.id, providerData?.username, username),
    username,
    password,
    host,
    port,
    service_type: serviceType,
    traffic_limit_gb: trafficLimitGb,
    status: 'active',
    provider_payload: providerResult.data,
  })

  return { success: true, username }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !serviceRole) {
    return json({ success: false, configured: false, error: 'Plataforma nao configurada.' }, 500)
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRole)
  const settings = await loadSettings(supabaseAdmin)

  if (!settings || !settings.active) {
    return json({ success: true, configured: false, items: [] })
  }

  const url = new URL(req.url)
  const body = req.method === 'GET' ? {} : await parseRequestBody(req)
  const action = String(url.searchParams.get('action') || body.action || 'catalog').toLowerCase()
  const hasCredentials = Boolean(settings.api_key?.trim())
  const hasPoolAccess = hasProxyPoolAccess(settings)

  if (action === 'status') {
    const capacity = hasCredentials ? await getCapacity(settings) : null
    return json({
      success: capacity ? capacity.success !== false : true,
      configured: hasPoolAccess,
      active: settings.active,
      availableLimit: capacity && 'availableLimit' in capacity ? capacity.availableLimit : null,
      totalLimit: capacity && 'totalLimit' in capacity ? capacity.totalLimit : null,
      allocatedLimit: capacity && 'allocatedLimit' in capacity ? capacity.allocatedLimit : null,
      status: capacity && 'status' in capacity ? capacity.status : 200,
      data: capacity && 'data' in capacity ? capacity.data : null,
    }, capacity?.success === false ? 400 : 200)
  }

  if (!hasPoolAccess) {
    return json({ success: true, configured: false, items: [] })
  }

  if (action === 'catalog') {
    const capacity = hasCredentials
      ? await getCapacity(settings)
      : { configured: true as const, success: false as const, status: 206, data: { message: 'Catalogo carregado pelos planos configurados.' } }
    const offers = await loadProxyOffers(supabaseAdmin)
    const capacityAvailable = capacity.configured !== false && capacity.success !== false
      ? (capacity as CapacityResult).availableLimit
      : null
    const items = offers
      .map((offer) => mapOffer(offer, capacityAvailable))
      .filter(Boolean) as ProxyOffer[]

    if ((capacity.configured === false || capacity.success === false) && !hasPoolAccess) {
      return json({ configured: true, ...capacity, items: [] }, capacity.success === false ? 400 : 200)
    }

    return json({
      success: true,
      configured: true,
      status: capacity.success === false ? 206 : 200,
      availableLimit: capacityAvailable,
      capacityWarning: capacity.success === false ? capacity.data : null,
      items,
    })
  }

  if (action === 'my_deliveries') {
    const user = await getRequestUser(req, supabaseAdmin)
    if (!user) return json({ success: false, configured: true, error: 'Login necessario.' }, 401)

    const items = await loadBuyerProxyDeliveries(supabaseAdmin, settings, user)
    return json({ success: true, configured: true, items })
  }

  if (action === 'create_topup_sale') {
    const user = await getRequestUser(req, supabaseAdmin)
    if (!user) return json({ success: false, configured: true, error: 'Login necessario.' }, 401)

    const deliveryId = firstString(body.deliveryId, url.searchParams.get('deliveryId'))
    const offerId = firstString(body.offerId, url.searchParams.get('offerId'))
    if (!deliveryId || !offerId) return json({ success: false, configured: true, error: 'Proxy ou pacote nao informado.' }, 400)

    const { data: delivery, error: deliveryError } = await supabaseAdmin
      .from('proxy_deliveries')
      .select('id, buyer_id, proxy_offer_id, provider_sub_user_id, username, host, port, service_type, traffic_limit_gb, status')
      .eq('id', deliveryId)
      .eq('buyer_id', user.id)
      .maybeSingle()

    if (deliveryError) throw deliveryError
    const deliveryRecord = asRecord(delivery)
    if (!deliveryRecord || firstString(deliveryRecord.status) !== 'active') {
      return json({ success: false, configured: true, error: 'Proxy ativa nao encontrada.' }, 404)
    }

    const { data: offer, error: offerError } = await supabaseAdmin
      .from('proxy_offers')
      .select('id, price_amount, traffic_limit_gb, is_active')
      .eq('id', offerId)
      .eq('is_active', true)
      .maybeSingle()

    if (offerError) throw offerError
    const offerRecord = asRecord(offer)
    const amount = Number(offerRecord?.price_amount ?? 0)
    const topupGb = Number(offerRecord?.traffic_limit_gb ?? 0)
    if (!offerRecord || !amount || !topupGb) {
      return json({ success: false, configured: true, error: 'Pacote de recarga indisponivel.' }, 400)
    }

    const { data: sale, error: saleError } = await supabaseAdmin
      .from('sales')
      .insert({
        product_id: null,
        proxy_offer_id: Number(offerId),
        proxy_delivery_id: Number(deliveryId),
        proxy_topup_gb: topupGb,
        buyer_id: user.id,
        seller_id: null,
        amount,
        status: 'pending',
        proxy_endpoint: firstString(deliveryRecord.host, 'gate.decodo.com'),
        proxy_port: firstString(deliveryRecord.port, '7000'),
      })
      .select('id, amount')
      .single()

    if (saleError) throw saleError
    return json({ success: true, configured: true, sale })
  }

  if (action === 'provision_sale') {
    const user = await getRequestUser(req, supabaseAdmin)
    if (!user) return json({ success: false, configured: true, error: 'Login necessario.' }, 401)

    const saleId = firstString(body.saleId, url.searchParams.get('saleId'))
    if (!saleId) return json({ success: false, configured: true, error: 'Pedido nao informado.' }, 400)

    const { data: sale, error: saleError } = await supabaseAdmin
      .from('sales')
      .select('buyer_id')
      .eq('id', saleId)
      .maybeSingle()

    if (saleError) throw saleError
    if (!sale || asRecord(sale)?.buyer_id !== user.id) {
      return json({ success: false, configured: true, error: 'Pedido nao encontrado.' }, 404)
    }

    const result = await provisionProxySale(supabaseAdmin, settings, saleId)
    return json({ configured: true, ...result }, (result as { success?: boolean }).success === false ? 400 : 200)
  }

  return json({ success: false, configured: true, error: 'Action not supported.' }, 400)
})
