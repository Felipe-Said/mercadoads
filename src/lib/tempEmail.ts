import { supabase } from './supabase'

export type TempEmailService = {
  id: string
  code: string
  name: string
  providerName: string
  category: string
  domain: string
  stock: string
  providerPrice: number
  priceAmount: number
  priceLabel: string
}

type TempEmailInvokeResult = {
  configured?: boolean
  success?: boolean
  status?: number
  items?: TempEmailService[]
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

function friendlyTempEmailMessage(message: string | null, status?: number) {
  const normalized = (message ?? '').toLowerCase()
  if (status === 401 || status === 403 || normalized.includes('unauthorized') || normalized.includes('forbidden')) {
    return 'Credenciais recusadas. Confira a configuracao no painel admin.'
  }
  if (normalized.includes('edge function') || normalized.includes('supabase')) {
    return 'Nao foi possivel consultar os emails temporarios agora.'
  }
  return message || 'Nao foi possivel consultar os emails temporarios agora.'
}

async function invokeTempEmailDirect(action: string, payload?: Record<string, unknown>) {
  if (!supabaseUrl) throw new Error('Plataforma nao configurada.')

  const { data: sessionData } = await supabase.auth.getSession()
  const directUrl = `${supabaseUrl.replace('.supabase.co', '.functions.supabase.co')}/temp_email`
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
    const result = data as TempEmailInvokeResult
    throw new Error(friendlyTempEmailMessage(extractMessage(result?.data) || result?.error || null, response.status))
  }

  return data as TempEmailInvokeResult
}

export async function invokeTempEmail(action: 'services' | 'status' | 'provision_sale', payload?: Record<string, unknown>) {
  try {
    const { data, error } = await supabase.functions.invoke('temp_email', {
      body: { action, ...(payload ?? {}) },
    })
    if (error) return invokeTempEmailDirect(action, payload)
    return data as TempEmailInvokeResult
  } catch {
    return invokeTempEmailDirect(action, payload)
  }
}

export async function getTempEmailServices() {
  const result = await invokeTempEmail('services')
  if (result.success === false) {
    throw new Error(friendlyTempEmailMessage(extractMessage(result.data) || result.error || null, result.status))
  }
  return {
    configured: Boolean(result.configured),
    items: result.items ?? [],
  }
}

export async function provisionTempEmailSale(saleId: string) {
  const result = await invokeTempEmail('provision_sale', { saleId })
  if (result.success === false) {
    throw new Error(friendlyTempEmailMessage(extractMessage(result.data) || result.error || null, result.status))
  }
  return result
}
