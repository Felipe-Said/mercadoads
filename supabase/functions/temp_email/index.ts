import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type TempEmailSettings = {
  active: boolean
  api_base_url: string
  api_key: string | null
  default_markup_percent: number
}

type TempEmailOverride = {
  service_id: string
  custom_name: string | null
  custom_category: string | null
  price_amount: number | null
  markup_percent: number | null
  is_active: boolean
  sort_order: number
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function asRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  }
  return ''
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
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

function unwrapRows(data: unknown): unknown[] {
  if (Array.isArray(data)) return data
  const record = asRecord(data)
  if (!record) return []
  for (const key of ['services', 'data', 'items', 'result', 'results']) {
    const value = record[key]
    if (Array.isArray(value)) return value
    if (asRecord(value)) {
      const nested = unwrapRows(value)
      if (nested.length) return nested
    }
  }
  return []
}

async function loadSettings(supabaseAdmin: ReturnType<typeof createClient>) {
  const { data, error } = await supabaseAdmin
    .from('temp_email_settings')
    .select('active, api_base_url, api_key, default_markup_percent')
    .eq('id', 1)
    .maybeSingle()

  if (error) throw error
  return data as TempEmailSettings | null
}

async function loadOverrides(supabaseAdmin: ReturnType<typeof createClient>) {
  const { data, error } = await supabaseAdmin
    .from('temp_email_service_overrides')
    .select('service_id, custom_name, custom_category, price_amount, markup_percent, is_active, sort_order')

  if (error) throw error
  return (data ?? []) as TempEmailOverride[]
}

async function callTempMailProcedure(settings: TempEmailSettings, procedure: string, input: unknown = null, method: 'GET' | 'POST' = 'GET') {
  const base = (settings.api_base_url || 'https://app.numero-virtual.com').replace(/\/+$/, '')
  const url = new URL(`${base}/api/trpc/${procedure}`)
  url.searchParams.set('batch', '1')

  const headers = new Headers({ Accept: 'application/json' })
  if (settings.api_key?.trim()) headers.set('Authorization', `Bearer ${settings.api_key.trim()}`)

  const init: RequestInit = { method, headers }
  if (method === 'GET') {
    url.searchParams.set('input', JSON.stringify({ 0: { json: input } }))
  } else {
    headers.set('Content-Type', 'application/json')
    init.body = JSON.stringify({ 0: { json: input } })
  }

  const response = await fetch(url.toString(), init)
  const text = await response.text()
  let data: unknown = text
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  if (!response.ok) return { success: false as const, configured: true as const, status: response.status, data }

  const batch = Array.isArray(data) ? asRecord(data[0]) : null
  if (asRecord(batch?.error)) return { success: false as const, configured: true as const, status: 400, data: batch?.error }
  const result = asRecord(batch?.result)
  const payload = asRecord(result?.data)
  return { success: true as const, configured: true as const, status: response.status, data: payload?.json ?? data }
}

function mapServices(data: unknown, overrides: TempEmailOverride[], defaultMarkup: number) {
  const overrideById = new Map(overrides.map((item) => [String(item.service_id), item]))

  return unwrapRows(data)
    .map((row) => {
      const record = asRecord(row) ?? {}
      const id = firstString(record.id, record.code)
      if (!id) return null
      const override = overrideById.get(id)
      if (override && !override.is_active) return null

      const providerPrice = Number(record.price ?? 0) / 100
      const markup = override?.markup_percent ?? defaultMarkup
      const priceAmount = override?.price_amount ?? providerPrice * (1 + markup / 100)
      const name = override?.custom_name?.trim() || firstString(record.name, `Servico ${id}`)

      return {
        id,
        code: firstString(record.code, id),
        name,
        providerName: firstString(record.name, name),
        category: override?.custom_category?.trim() || 'Email temporario',
        domain: firstString(record.domain, 'gmail.com'),
        stock: firstString(record.available, 'Disponivel'),
        providerPrice,
        priceAmount,
        priceLabel: formatPrice(priceAmount),
        sortOrder: override?.sort_order ?? 999999,
      }
    })
    .filter(Boolean)
    .sort((a, b) => {
      const left = a as { sortOrder: number; name: string }
      const right = b as { sortOrder: number; name: string }
      return left.sortOrder - right.sortOrder || left.name.localeCompare(right.name)
    })
}

async function provisionTempEmailSale(supabaseAdmin: ReturnType<typeof createClient>, saleId: string) {
  const { data: sale, error: saleError } = await supabaseAdmin
    .from('sales')
    .select('id, buyer_id, status, temp_email_service_id, temp_email_service_name, temp_email_service_code, temp_email_domain')
    .eq('id', saleId)
    .maybeSingle()

  if (saleError) throw saleError
  const saleRecord = asRecord(sale)
  if (!saleRecord?.temp_email_service_id || saleRecord.status !== 'paid') return { skipped: true }

  const existing = await supabaseAdmin
    .from('temp_email_deliveries')
    .select('id')
    .eq('sale_id', saleId)
    .maybeSingle()

  if (existing.data) return { skipped: true, existing: true }

  const settings = await loadSettings(supabaseAdmin)
  if (!settings || !settings.active) return { success: false, configured: false, error: 'Email temporario indisponivel.' }

  const providerResult = await callTempMailProcedure(settings, 'tempmail.purchaseEmail', {
    serviceId: Number(saleRecord.temp_email_service_id),
  }, 'POST')

  const providerData = asRecord(asRecord(providerResult.data)?.activation) ?? asRecord(providerResult.data) ?? {}
  const status = firstString(providerData.status, providerResult.success === false ? 'failed' : 'active')

  await supabaseAdmin.from('temp_email_deliveries').insert({
    sale_id: saleId,
    buyer_id: saleRecord.buyer_id,
    provider_activation_id: firstString(providerData.id) || null,
    service_id: firstString(saleRecord.temp_email_service_id),
    service_name: firstString(saleRecord.temp_email_service_name, 'Email temporario'),
    service_code: firstString(saleRecord.temp_email_service_code) || null,
    domain: firstString(saleRecord.temp_email_domain, providerData.domain) || null,
    email: firstString(providerData.email) || null,
    code: firstString(providerData.code) || null,
    status,
    expires_at: firstString(providerData.expiresAt, providerData.expires_at) || null,
    provider_payload: providerResult,
  })

  return providerResult
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRole) return json({ success: false, configured: false, error: 'Plataforma nao configurada.' }, 500)

  const supabaseAdmin = createClient(supabaseUrl, serviceRole)
  const settings = await loadSettings(supabaseAdmin)
  if (!settings || !settings.active) return json({ success: true, configured: false, items: [] })

  const url = new URL(req.url)
  const body = req.method === 'GET' ? {} : await parseRequestBody(req)
  const action = String(url.searchParams.get('action') || body.action || 'services').toLowerCase()

  if (action === 'status') {
    return json({ success: true, configured: Boolean(settings.api_base_url), active: settings.active })
  }

  if (action === 'services') {
    const [result, overrides] = await Promise.all([
      callTempMailProcedure(settings, 'tempmail.listServices'),
      loadOverrides(supabaseAdmin),
    ])
    if (result.configured === false || result.success === false) return json({ ...result, items: [] }, result.success === false ? 400 : 200)
    const items = mapServices(result.data, overrides, Number(settings.default_markup_percent ?? 0))
    return json({ success: true, configured: true, items, rawCount: items.length })
  }

  if (action === 'provision_sale') {
    const saleId = firstString(body.saleId, body.sale_id)
    if (!saleId) return json({ success: false, configured: true, error: 'Pedido invalido.' }, 400)
    const result = await provisionTempEmailSale(supabaseAdmin, saleId)
    return json(result, asRecord(result)?.success === false ? 400 : 200)
  }

  return json({ success: false, configured: true, error: 'Action not supported.' }, 400)
})
