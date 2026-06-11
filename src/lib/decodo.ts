import { supabase } from './supabase'

export type DecodoProxyOffer = {
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

type DecodoInvokeResult = {
  configured?: boolean
  success?: boolean
  status?: number
  items?: DecodoProxyOffer[]
  data?: unknown
  error?: string
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

function extractMessage(value: unknown) {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value !== 'object') return null

  const record = value as Record<string, unknown>
  const direct = record.message || record.error || record.detail
  if (typeof direct === 'string') return direct

  return JSON.stringify(record)
}

function friendlyProviderMessage(message: string | null, status?: number) {
  const normalized = (message ?? '').toLowerCase()

  if (status === 404 || normalized.includes('route not found') || normalized.includes('not found')) {
    return 'Endpoint de catálogo não encontrado. Confira a Base URL e o endpoint configurado.'
  }

  if (status === 401 || status === 403 || normalized.includes('unauthorized') || normalized.includes('forbidden')) {
    return 'Credenciais recusadas. Confira a chave, usuário ou senha configurados.'
  }

  if (normalized.includes('invalid api key') || normalized.includes('api key')) {
    return 'Chave da API publica invalida. Use a chave criada na area de API publica do fornecedor, nao o usuario, senha ou Basic Auth Token do proxy.'
  }

  if (normalized.includes('can not process request') || normalized.includes('cannot process request')) {
    return 'A API aceitou a chamada, mas nao conseguiu processar a consulta de assinatura/trafego. Confirme se essa chave tem permissao da API publica e se existe assinatura residencial ativa.'
  }

  if (normalized.includes('supabase') || normalized.includes('edge function') || normalized.includes('decodo')) {
    return 'Não foi possível consultar o catálogo de proxies agora.'
  }

  return message || 'Não foi possível consultar o catálogo de proxies agora.'
}

async function invokeDecodoDirect(action: string, payload?: Record<string, unknown>) {
  if (!supabaseUrl) throw new Error('Plataforma nao configurada.')

  const { data: sessionData } = await supabase.auth.getSession()
  const directUrl = `${supabaseUrl.replace('.supabase.co', '.functions.supabase.co')}/decodo`
  const response = await fetch(directUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(supabaseAnonKey ? { apikey: supabaseAnonKey } : {}),
      ...(sessionData.session?.access_token ? { Authorization: `Bearer ${sessionData.session.access_token}` } : {}),
    },
    body: JSON.stringify({ action, ...(payload ?? {}) }),
  })

  const text = await response.text()
  let data: unknown = null

  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!response.ok) {
    const result = data as DecodoInvokeResult
    throw new Error(friendlyProviderMessage(extractMessage(result?.data) || result?.error || null, response.status))
  }

  return data as DecodoInvokeResult
}

export async function invokeDecodo(action: 'catalog' | 'status' | 'provision_sale', payload?: Record<string, unknown>) {
  try {
    const { data, error } = await supabase.functions.invoke('decodo', {
      body: { action, ...(payload ?? {}) },
    })

    if (error) return invokeDecodoDirect(action, payload)
    return data as DecodoInvokeResult
  } catch {
    return invokeDecodoDirect(action, payload)
  }
}

export async function getDecodoProxyCatalog() {
  const result = await invokeDecodo('catalog')
  if (result.success === false) {
    throw new Error(friendlyProviderMessage(extractMessage(result.data) || result.error || null, result.status))
  }
  return {
    configured: Boolean(result.configured),
    items: result.items ?? [],
    raw: result.data,
  }
}

export async function decodoStatus() {
  const result = await invokeDecodo('status')
  if (result.success === false) {
    throw new Error(friendlyProviderMessage(extractMessage(result.data) || result.error || null, result.status))
  }
  return result
}
