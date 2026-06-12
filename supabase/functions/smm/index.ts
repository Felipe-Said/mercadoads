import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type SmmSettings = {
  active: boolean
  api_base_url: string
  api_key: string | null
  default_markup_percent: number
}

type SmmOverride = {
  service_id: string
  custom_name: string | null
  custom_category: string | null
  price_per_1000: number | null
  markup_percent: number | null
  is_active: boolean
  sort_order: number
}

type ProviderService = {
  service: number | string
  name: string
  type: string
  category: string
  rate: string
  min: string
  max: string
  refill?: boolean
  cancel?: boolean
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function toNumber(value: unknown) {
  const parsed = Number(String(value ?? '').replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : 0
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
    .from('smm_settings')
    .select('active, api_base_url, api_key, default_markup_percent')
    .eq('id', 1)
    .maybeSingle()

  if (error) throw error
  return data as SmmSettings | null
}

async function loadOverrides(supabaseAdmin: ReturnType<typeof createClient>) {
  const { data, error } = await supabaseAdmin
    .from('smm_service_overrides')
    .select('service_id, custom_name, custom_category, price_per_1000, markup_percent, is_active, sort_order')

  if (error) throw error
  return (data ?? []) as SmmOverride[]
}

async function callProvider(settings: SmmSettings, payload: Record<string, unknown>) {
  if (!settings.api_key?.trim()) return { configured: false as const }

  const body = new URLSearchParams()
  body.set('key', settings.api_key.trim())
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined && value !== null && String(value).trim()) body.set(key, String(value))
  }

  const response = await fetch(settings.api_base_url || 'https://mitikboost.com/api/v2', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })
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

function mapServices(services: ProviderService[], overrides: SmmOverride[], defaultMarkup: number) {
  const overrideById = new Map(overrides.map((item) => [String(item.service_id), item]))

  return services
    .map((service) => {
      const serviceId = String(service.service)
      const override = overrideById.get(serviceId)
      if (override && !override.is_active) return null

      const providerRate = toNumber(service.rate)
      const markup = override?.markup_percent ?? defaultMarkup
      const pricePer1000 = override?.price_per_1000 ?? providerRate * (1 + markup / 100)

      return {
        id: serviceId,
        name: override?.custom_name?.trim() || service.name,
        providerName: service.name,
        type: service.type,
        category: override?.custom_category?.trim() || service.category,
        providerCategory: service.category,
        min: Number(service.min ?? 0),
        max: Number(service.max ?? 0),
        refill: Boolean(service.refill),
        cancel: Boolean(service.cancel),
        providerRate,
        pricePer1000,
        priceLabel: formatPrice(pricePer1000),
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
  if (!settings || !settings.active) return json({ success: true, configured: false, items: [] })

  const url = new URL(req.url)
  const body = req.method === 'GET' ? {} : await parseRequestBody(req)
  const action = String(url.searchParams.get('action') || body.action || 'services').toLowerCase()

  if (action === 'status') {
    return json({ success: true, configured: Boolean(settings.api_key?.trim()), active: settings.active })
  }

  if (action === 'balance') {
    const result = await callProvider(settings, { action: 'balance' })
    return json(result, result.success === false ? 400 : 200)
  }

  if (action === 'services') {
    const result = await callProvider(settings, { action: 'services' })
    if (result.configured === false || result.success === false) return json({ ...result, items: [] }, result.success === false ? 400 : 200)

    const overrides = await loadOverrides(supabaseAdmin)
    const providerServices = Array.isArray(result.data) ? result.data as ProviderService[] : []
    return json({
      success: true,
      configured: true,
      items: mapServices(providerServices, overrides, Number(settings.default_markup_percent ?? 0)),
    })
  }

  if (action === 'add') {
    const result = await callProvider(settings, {
      action: 'add',
      service: body.service,
      link: body.link,
      quantity: body.quantity,
      comments: body.comments,
      username: body.username,
      min: body.min,
      max: body.max,
      posts: body.posts,
      old_posts: body.old_posts,
      delay: body.delay,
      expiry: body.expiry,
      answer_number: body.answer_number,
    })
    return json(result, result.success === false ? 400 : 200)
  }

  return json({ success: false, configured: true, error: 'Action not supported.' }, 400)
})
