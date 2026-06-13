import { supabase } from './supabase'

export type SmmService = {
  id: string
  name: string
  providerName: string
  type: string
  category: string
  providerCategory: string
  min: number
  max: number
  refill: boolean
  cancel: boolean
  providerRate: number
  pricePer1000: number
  priceLabel: string
}

type SmmInvokeResult = {
  configured?: boolean
  success?: boolean
  status?: number
  items?: SmmService[]
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

function friendlySmmMessage(message: string | null, status?: number) {
  const normalized = (message ?? '').toLowerCase()
  if (status === 401 || status === 403 || normalized.includes('invalid api key') || normalized.includes('incorrect key')) {
    return 'Chave da API SMM invalida. Confira a chave configurada no painel admin.'
  }
  if (normalized.includes('supabase') || normalized.includes('edge function') || normalized.includes('baratosociais') || normalized.includes('mitik')) {
    return 'Nao foi possivel consultar os servicos SMM agora.'
  }
  return message || 'Nao foi possivel consultar os servicos SMM agora.'
}

async function invokeSmmDirect(action: string, payload?: Record<string, unknown>) {
  if (!supabaseUrl) throw new Error('Plataforma nao configurada.')

  const { data: sessionData } = await supabase.auth.getSession()
  const directUrl = `${supabaseUrl.replace('.supabase.co', '.functions.supabase.co')}/smm`
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
    const result = data as SmmInvokeResult
    throw new Error(friendlySmmMessage(extractMessage(result?.data) || result?.error || null, response.status))
  }

  return data as SmmInvokeResult
}

export async function invokeSmm(action: 'services' | 'status' | 'balance' | 'add' | 'provision_sale', payload?: Record<string, unknown>) {
  try {
    const { data, error } = await supabase.functions.invoke('smm', {
      body: { action, ...(payload ?? {}) },
    })
    if (error) return invokeSmmDirect(action, payload)
    return data as SmmInvokeResult
  } catch {
    return invokeSmmDirect(action, payload)
  }
}

export async function getSmmServices() {
  const result = await invokeSmm('services')
  if (result.success === false) {
    throw new Error(friendlySmmMessage(extractMessage(result.data) || result.error || null, result.status))
  }
  return {
    configured: Boolean(result.configured),
    items: result.items ?? [],
  }
}

export async function getSmmBalance() {
  const result = await invokeSmm('balance')
  if (result.success === false) {
    throw new Error(friendlySmmMessage(extractMessage(result.data) || result.error || null, result.status))
  }
  return result
}

export async function provisionSmmSale(saleId: string) {
  const result = await invokeSmm('provision_sale', { saleId })
  if (result.success === false) {
    throw new Error(friendlySmmMessage(extractMessage(result.data) || result.error || null, result.status))
  }
  return result
}
