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
  traffic: string
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

async function invokeDecodoDirect(action: string) {
  if (!supabaseUrl) throw new Error('Supabase nao configurado.')

  const { data: sessionData } = await supabase.auth.getSession()
  const directUrl = `${supabaseUrl.replace('.supabase.co', '.functions.supabase.co')}/decodo`
  const response = await fetch(directUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(supabaseAnonKey ? { apikey: supabaseAnonKey } : {}),
      ...(sessionData.session?.access_token ? { Authorization: `Bearer ${sessionData.session.access_token}` } : {}),
    },
    body: JSON.stringify({ action }),
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
    throw new Error(extractMessage(result?.data) || result?.error || `Funcao Decodo retornou HTTP ${response.status}.`)
  }

  return data as DecodoInvokeResult
}

export async function invokeDecodo(action: 'catalog' | 'status') {
  try {
    const { data, error } = await supabase.functions.invoke('decodo', {
      body: { action },
    })

    if (error) return invokeDecodoDirect(action)
    return data as DecodoInvokeResult
  } catch {
    return invokeDecodoDirect(action)
  }
}

export async function getDecodoProxyCatalog() {
  const result = await invokeDecodo('catalog')
  if (result.success === false) {
    throw new Error(extractMessage(result.data) || result.error || 'Decodo recusou a requisicao.')
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
    throw new Error(extractMessage(result.data) || result.error || 'Nao foi possivel validar a Decodo.')
  }
  return result
}
