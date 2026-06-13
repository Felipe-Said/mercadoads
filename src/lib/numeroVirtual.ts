import { supabase } from './supabase'

export type VirtualNumberService = {
  id: string
  code: string
  name: string
  providerName: string
  category: string
  functionName: string
  operatorName: string
  ddd: string
  option: string
  country: string
  stock: string
  providerPrice: number
  priceAmount: number
  priceLabel: string
}

type VirtualNumberInvokeResult = {
  configured?: boolean
  success?: boolean
  status?: number
  items?: VirtualNumberService[]
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
  return typeof direct === 'string' ? direct : JSON.stringify(record)
}

function friendlyVirtualNumberMessage(message: string | null, status?: number) {
  const normalized = (message ?? '').toLowerCase()
  if (status === 401 || status === 403 || normalized.includes('invalid') || normalized.includes('unauthorized') || normalized.includes('forbidden')) {
    return 'Credenciais recusadas. Confira a chave configurada no painel admin.'
  }
  if (normalized.includes('supabase') || normalized.includes('edge function') || normalized.includes('numero-virtual')) {
    return 'Nao foi possivel consultar os numeros virtuais agora.'
  }
  return message || 'Nao foi possivel consultar os numeros virtuais agora.'
}

async function invokeVirtualNumberDirect(action: string, payload?: Record<string, unknown>) {
  if (!supabaseUrl) throw new Error('Plataforma nao configurada.')

  const { data: sessionData } = await supabase.auth.getSession()
  const directUrl = `${supabaseUrl.replace('.supabase.co', '.functions.supabase.co')}/numero_virtual`
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
    const result = data as VirtualNumberInvokeResult
    throw new Error(friendlyVirtualNumberMessage(extractMessage(result?.data) || result?.error || null, response.status))
  }

  return data as VirtualNumberInvokeResult
}

export async function invokeVirtualNumber(action: 'services' | 'status' | 'balance' | 'countries' | 'order', payload?: Record<string, unknown>) {
  try {
    const { data, error } = await supabase.functions.invoke('numero_virtual', {
      body: { action, ...(payload ?? {}) },
    })
    if (error) return invokeVirtualNumberDirect(action, payload)
    return data as VirtualNumberInvokeResult
  } catch {
    return invokeVirtualNumberDirect(action, payload)
  }
}

export async function getVirtualNumberServices(country = 'BR') {
  const result = await invokeVirtualNumber('services', { country })
  if (result.success === false) {
    throw new Error(friendlyVirtualNumberMessage(extractMessage(result.data) || result.error || null, result.status))
  }
  return {
    configured: Boolean(result.configured),
    items: result.items ?? [],
  }
}

export async function getVirtualNumberBalance() {
  const result = await invokeVirtualNumber('balance')
  if (result.success === false) {
    throw new Error(friendlyVirtualNumberMessage(extractMessage(result.data) || result.error || null, result.status))
  }
  return result
}
