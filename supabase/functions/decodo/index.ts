import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type DecodoSettings = {
  active: boolean
  api_base_url: string
  products_path: string
  api_key: string | null
  username: string | null
  password: string | null
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
  traffic: string
  stock: string
  status: string
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function firstString(...values: unknown[]) {
  const found = values.find((value) => {
    if (typeof value === 'string') return value.trim().length > 0
    return value !== null && value !== undefined && String(value).trim().length > 0
  })

  return found === undefined || found === null ? '' : String(found).trim()
}

function asRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

function findFirstArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  const root = asRecord(value)
  if (!root) return []

  const directKeys = ['data', 'items', 'results', 'products', 'plans', 'proxies', 'countries', 'locations']
  for (const key of directKeys) {
    const found = root[key]
    if (Array.isArray(found)) return found
    const nested = findFirstArray(found)
    if (nested.length > 0) return nested
  }

  for (const nestedValue of Object.values(root)) {
    const nested = findFirstArray(nestedValue)
    if (nested.length > 0) return nested
  }

  return []
}

function normalizeOffer(item: unknown, index: number): ProxyOffer {
  if (typeof item === 'string') {
    return {
      id: item,
      name: item,
      type: 'Proxy premium',
      country: item,
      city: '',
      protocol: 'HTTP(S) / SOCKS5',
      endpoint: '',
      port: '',
      price: '',
      traffic: '',
      stock: '',
      status: 'Disponivel',
    }
  }

  const record = asRecord(item) ?? {}
  const location = asRecord(record.location) ?? {}
  const pricing = asRecord(record.pricing) ?? asRecord(record.price) ?? {}
  const limits = asRecord(record.limits) ?? {}

  const id = firstString(record.id, record.uuid, record.code, record.slug, record.country_code, record.countryCode, index + 1)
  const name = firstString(record.name, record.title, record.product, record.plan, record.country_name, record.countryName, record.country, `Proxy ${index + 1}`)
  const type = firstString(record.type, record.proxy_type, record.proxyType, record.category, 'Proxy premium')
  const country = firstString(record.country, record.country_name, record.countryName, location.country, location.country_name, location.countryCode)
  const city = firstString(record.city, location.city, location.city_name)
  const protocol = firstString(record.protocol, record.protocols, record.scheme, 'HTTP(S) / SOCKS5')
  const endpoint = firstString(record.endpoint, record.host, record.hostname, record.server, record.address, record.proxy, record.proxy_address)
  const port = firstString(record.port, record.http_port, record.socks5_port)
  const price = firstString(record.price, pricing.amount, pricing.value, record.price_per_gb, record.pricePerGb)
  const traffic = firstString(record.traffic, record.bandwidth, record.gb, limits.traffic, limits.bandwidth)
  const stock = firstString(record.stock, record.available, record.quantity, record.count, record.ip_count, record.ipCount)
  const status = firstString(record.status, record.state, record.available === false ? 'Indisponivel' : 'Disponivel')

  return { id, name, type, country, city, protocol, endpoint, port, price, traffic, stock, status }
}

function defaultProxyOffers(status = 'Disponivel'): ProxyOffer[] {
  return [
    {
      id: 'premium-pool',
      name: 'Proxy premium',
      type: 'Pool premium',
      country: 'Global',
      city: '',
      protocol: 'HTTP(S)',
      endpoint: '',
      port: '',
      price: 'Sob consulta',
      traffic: 'Conforme plano',
      stock: 'Ativo',
      status,
    },
  ]
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

async function loadSettings(supabaseAdmin: ReturnType<typeof createClient>) {
  const { data, error } = await supabaseAdmin
    .from('decodo_settings')
    .select('active, api_base_url, products_path, api_key, username, password')
    .eq('id', 1)
    .maybeSingle()

  if (error) throw error
  return data as DecodoSettings | null
}

async function callDecodo(settings: DecodoSettings) {
  const base = settings.api_base_url.replace(/\/+$/, '')
  const path = settings.products_path.trim()
  const targetUrl = /^https?:\/\//i.test(path)
    ? path
    : `${base}${path.startsWith('/') ? path : `/${path}`}`
  const headers = new Headers({ Accept: 'application/json' })

  if (settings.api_key?.trim()) {
    headers.set('Authorization', `Bearer ${settings.api_key.trim()}`)
    headers.set('X-API-Key', settings.api_key.trim())
  } else if (settings.username?.trim() && settings.password?.trim()) {
    headers.set('Authorization', `Basic ${btoa(`${settings.username.trim()}:${settings.password}`)}`)
  }

  const isScrapeEndpoint = /\/scrape\/?$/i.test(new URL(targetUrl).pathname)
  const init: RequestInit = { headers }

  if (isScrapeEndpoint) {
    headers.set('Content-Type', 'application/json')
    init.method = 'POST'
    init.body = JSON.stringify({
      url: 'https://ip.decodo.com',
      proxy_pool: 'premium',
      headless: 'html',
    })
  }

  const response = await fetch(targetUrl, init)
  const text = await response.text()
  let data: unknown = text

  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!response.ok) {
    return {
      success: false as const,
      status: response.status,
      error: response.status === 404
        ? 'Endpoint de catálogo não encontrado. Confira a Base URL e o endpoint configurado.'
        : 'Não foi possível consultar o catálogo de proxies agora.',
      data,
    }
  }

  const items = findFirstArray(data).map(normalizeOffer)
  if (items.length === 0 && isScrapeEndpoint) {
    return { success: true as const, status: response.status, data, items: defaultProxyOffers() }
  }

  return { success: true as const, status: response.status, data, items }
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
  const hasCredentials = Boolean(settings.api_key?.trim() || (settings.username?.trim() && settings.password?.trim()))

  if (action === 'status') {
    return json({
      success: true,
      configured: hasCredentials,
      active: settings.active,
      apiBaseUrl: settings.api_base_url,
      productsPath: settings.products_path,
    })
  }

  if (!hasCredentials) {
    return json({ success: true, configured: false, items: [] })
  }

  if (action === 'catalog') {
    const result = await callDecodo(settings)
    return json({ configured: true, ...result }, result.success ? 200 : 400)
  }

  return json({ success: false, configured: true, error: 'Action not supported.' }, 400)
})
