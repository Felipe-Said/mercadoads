import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type VirtualNumberSettings = {
  active: boolean
  api_base_url: string
  api_key: string | null
  auth_mode: 'bearer' | 'x-api-key' | 'query_key' | 'form_key'
  balance_path: string
  services_path: string
  countries_path: string
  order_path: string
  default_markup_percent: number
}

type VirtualNumberOverride = {
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

function toNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value.replace(',', '.').replace(/[^\d.-]/g, ''))
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
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

async function loadSettings(supabaseAdmin: ReturnType<typeof createClient>) {
  const { data, error } = await supabaseAdmin
    .from('virtual_number_settings')
    .select('active, api_base_url, api_key, auth_mode, balance_path, services_path, countries_path, order_path, default_markup_percent')
    .eq('id', 1)
    .maybeSingle()

  if (error) throw error
  return data as VirtualNumberSettings | null
}

async function loadOverrides(supabaseAdmin: ReturnType<typeof createClient>) {
  const { data, error } = await supabaseAdmin
    .from('virtual_number_service_overrides')
    .select('service_id, custom_name, custom_category, price_amount, markup_percent, is_active, sort_order')

  if (error) throw error
  return (data ?? []) as VirtualNumberOverride[]
}

function unwrapRows(data: unknown): unknown[] {
  if (Array.isArray(data)) return data
  const record = asRecord(data)
  if (!record) return []

  for (const key of ['data', 'items', 'services', 'products', 'countries', 'result', 'results']) {
    const value = record[key]
    if (Array.isArray(value)) return value
    if (asRecord(value)) {
      const nested = unwrapRows(value)
      if (nested.length) return nested
    }
  }

  return Object.values(record).every((value) => asRecord(value))
    ? Object.entries(record).map(([key, value]) => ({ id: key, ...(asRecord(value) ?? {}) }))
    : []
}

function buildUrl(settings: VirtualNumberSettings, path: string, query?: Record<string, unknown>) {
  const base = (settings.api_base_url || 'https://app.numero-virtual.com').replace(/\/+$/, '')
  const target = /^https?:\/\//i.test(path) ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`
  const url = new URL(target)

  if (settings.auth_mode === 'query_key' && settings.api_key?.trim()) {
    url.searchParams.set('key', settings.api_key.trim())
    url.searchParams.set('api_key', settings.api_key.trim())
  }

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && String(value).trim()) url.searchParams.set(key, String(value))
  }

  return url.toString()
}

async function callProvider(settings: VirtualNumberSettings, path: string, payload?: Record<string, unknown>, method: 'GET' | 'POST' = 'GET') {
  if (!settings.api_key?.trim()) return { configured: false as const }

  const headers = new Headers({ Accept: 'application/json' })
  if (settings.auth_mode === 'bearer') headers.set('Authorization', `Bearer ${settings.api_key.trim()}`)
  if (settings.auth_mode === 'x-api-key') {
    headers.set('X-API-Key', settings.api_key.trim())
    headers.set('apikey', settings.api_key.trim())
  }

  const init: RequestInit = { method, headers }
  let url = buildUrl(settings, path, method === 'GET' ? payload : undefined)

  if (method === 'POST') {
    if (settings.auth_mode === 'form_key') {
      const body = new URLSearchParams()
      body.set('key', settings.api_key.trim())
      body.set('api_key', settings.api_key.trim())
      for (const [key, value] of Object.entries(payload ?? {})) {
        if (value !== undefined && value !== null && String(value).trim()) body.set(key, String(value))
      }
      headers.set('Content-Type', 'application/x-www-form-urlencoded')
      init.body = body
    } else {
      headers.set('Content-Type', 'application/json')
      init.body = JSON.stringify(payload ?? {})
    }
  }

  const response = await fetch(url, init)
  const text = await response.text()
  let data: unknown = text
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!response.ok) return { configured: true as const, success: false as const, status: response.status, data }
  if (data && typeof data === 'object' && !Array.isArray(data) && 'error' in data) {
    return { configured: true as const, success: false as const, status: 400, data }
  }
  return { configured: true as const, success: true as const, status: response.status, data }
}

function mapServices(data: unknown, overrides: VirtualNumberOverride[], defaultMarkup: number) {
  const overrideById = new Map(overrides.map((item) => [String(item.service_id), item]))

  return unwrapRows(data)
    .map((row, index) => {
      const record = asRecord(row) ?? {}
      const id = firstString(record.id, record.service, record.service_id, record.product_id, record.code, record.slug, index + 1)
      const override = overrideById.get(id)
      if (override && !override.is_active) return null

      const providerPrice = toNumber(record.price ?? record.cost ?? record.rate ?? record.amount ?? record.value)
      const markup = override?.markup_percent ?? defaultMarkup
      const priceAmount = override?.price_amount ?? providerPrice * (1 + markup / 100)

      return {
        id,
        code: firstString(record.code, record.slug, record.short_name, id),
        name: override?.custom_name?.trim() || firstString(record.name, record.title, record.service_name, record.label, `Servico ${id}`),
        providerName: firstString(record.name, record.title, record.service_name, record.label, `Servico ${id}`),
        category: override?.custom_category?.trim() || firstString(record.category, record.type, record.network, 'Numero virtual'),
        operator: firstString(record.operator, record.carrier, record.provider, record.gateway, record.source, record.option_name),
        option: firstString(record.option, record.option_name, record.type, record.provider_type, record.function, record.function_name),
        country: firstString(record.country, record.country_name, record.location, record.iso, 'Global'),
        stock: firstString(record.stock, record.quantity, record.available, record.count, 'Disponivel'),
        providerPrice,
        priceAmount,
        priceLabel: formatPrice(priceAmount),
        sortOrder: override?.sort_order ?? 999999,
      }
    })
    .filter(Boolean)
    .sort((a, b) => {
      const left = a as { sortOrder: number; category: string; name: string }
      const right = b as { sortOrder: number; category: string; name: string }
      return left.sortOrder - right.sortOrder
        || left.category.localeCompare(right.category)
        || left.name.localeCompare(right.name)
    })
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
    return json({ success: true, configured: Boolean(settings.api_key?.trim()), active: settings.active })
  }

  if (action === 'balance') {
    const result = await callProvider(settings, settings.balance_path)
    return json(result, result.success === false ? 400 : 200)
  }

  if (action === 'countries') {
    const result = await callProvider(settings, settings.countries_path)
    return json({
      ...result,
      items: result.success === false ? [] : unwrapRows(result.data),
    }, result.success === false ? 400 : 200)
  }

  if (action === 'services') {
    const result = await callProvider(settings, settings.services_path, { country: 'BR' })
    if (result.configured === false || result.success === false) return json({ ...result, items: [] }, result.success === false ? 400 : 200)

    const overrides = await loadOverrides(supabaseAdmin)
    return json({
      success: true,
      configured: true,
      items: mapServices(result.data, overrides, Number(settings.default_markup_percent ?? 0)),
      rawCount: unwrapRows(result.data).length,
    })
  }

  if (action === 'order') {
    const result = await callProvider(settings, settings.order_path, {
      service: body.service,
      service_id: body.serviceId ?? body.service,
      serviceId: body.serviceId ?? body.service,
      country: body.country,
      country_id: body.countryId ?? body.country,
      ddd: body.ddd,
      operator: body.operator,
      max_price: body.maxPrice,
    }, 'POST')
    return json(result, result.success === false ? 400 : 200)
  }

  return json({ success: false, configured: true, error: 'Action not supported.' }, 400)
})
