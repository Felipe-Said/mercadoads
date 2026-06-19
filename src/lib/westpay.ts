import { supabase } from './supabase'

type WestPayInvokeResult = {
  configured?: boolean
  success?: boolean
  data?: unknown
  error?: string
}

export type WestPayCustomer = {
  name: string
  email: string
  phone: string
  documentNumber: string
  documentType: 'cpf' | 'cnpj'
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

function extractGatewayMessage(value: unknown) {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value !== 'object') return null

  const data = value as Record<string, unknown>
  if (data.data && typeof data.data === 'object') {
    const nested = extractGatewayMessage(data.data)
    if (nested) return nested
  }

  const detailList = Array.isArray(data.details) ? data.details : Array.isArray(data.errors) ? data.errors : null
  if (detailList && detailList.length > 0) {
    const messages = detailList
      .map((item) => {
        if (typeof item === 'string') return item
        if (item && typeof item === 'object') {
          const record = item as Record<string, unknown>
          return typeof record.message === 'string' ? record.message : null
        }
        return null
      })
      .filter(Boolean)
      .join(', ')

    if (messages) return messages
  }

  const direct = data.message || data.error
  if (typeof direct === 'string') return direct

  return JSON.stringify(data)
}

function normalizeGatewayErrorMessage(message?: string | null) {
  const text = String(message ?? '').trim()
  const lower = text.toLowerCase()

  if (!text) return 'Nao foi possivel gerar o Pix agora. Tente novamente em instantes.'

  if (
    lower.includes('company account is not active') ||
    lower.includes('account is not active') ||
    lower.includes('company inactive')
  ) {
    return 'Pagamento via Pix temporariamente indisponivel. A conta de pagamentos da plataforma ainda nao esta ativa.'
  }

  if (lower.includes('http 403') || lower.includes('forbidden')) {
    return 'Pagamento via Pix temporariamente indisponivel. Tente novamente mais tarde.'
  }

  return text
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, '')
}

export function detectDocumentType(value: string): 'cpf' | 'cnpj' | null {
  const digits = onlyDigits(value)
  if (digits.length === 11) return 'cpf'
  if (digits.length === 14) return 'cnpj'
  return null
}

export function validateWestPayCustomer(customer: {
  name: string
  email: string
  phone: string
  documentNumber: string
}) {
  const phone = onlyDigits(customer.phone)
  const documentNumber = onlyDigits(customer.documentNumber)
  const documentType = detectDocumentType(customer.documentNumber)

  if (!customer.name.trim()) {
    throw new Error('Informe o nome completo para gerar o Pix.')
  }

  if (phone.length < 10 || phone.length > 11) {
    throw new Error('Informe um WhatsApp com DDD para gerar o Pix.')
  }

  if (!documentType) {
    throw new Error('Informe um CPF com 11 digitos ou CNPJ com 14 digitos.')
  }

  return {
    name: customer.name.trim(),
    email: customer.email.trim(),
    phone,
    documentNumber,
    documentType,
  } satisfies WestPayCustomer
}

async function invokeWestPayDirect(action: string, payload?: Record<string, unknown>) {
  if (!supabaseUrl) {
    throw new Error('Plataforma nao configurada.')
  }

  const { data: sessionData } = await supabase.auth.getSession()
  const directUrl = `${supabaseUrl.replace('.supabase.co', '.functions.supabase.co')}/westpay`
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
    return {
      configured: true,
      success: false,
      data,
      error: normalizeGatewayErrorMessage(extractGatewayMessage(data) ?? `Gateway retornou HTTP ${response.status}.`),
    } satisfies WestPayInvokeResult
  }

  return data as WestPayInvokeResult | null
}

export async function invokeWestPay(action: string, payload?: Record<string, unknown>) {
  try {
    const { data, error } = await supabase.functions.invoke('westpay', {
      body: { action, ...(payload ?? {}) },
    })

    if (error) {
      const fallbackResult = await invokeWestPayDirect(action, payload)
      if (!fallbackResult || fallbackResult.configured === false || fallbackResult.success === false) return null
      return fallbackResult
    }

    const result = data as WestPayInvokeResult | null
    if (!result || result.configured === false || result.success === false) return null

    return result
  } catch (error) {
    try {
      const fallbackResult = await invokeWestPayDirect(action, payload)
      if (!fallbackResult || fallbackResult.configured === false || fallbackResult.success === false) return null
      return fallbackResult
    } catch (fallbackError) {
      console.error(error)
      console.error(fallbackError)
      return null
    }
  }
}

export async function invokeWestPayStrict(action: string, payload?: Record<string, unknown>) {
  try {
    const { data, error } = await supabase.functions.invoke('westpay', {
      body: { action, ...(payload ?? {}) },
    })

    if (error) {
      const fallbackResult = await invokeWestPayDirect(action, payload)
      if (!fallbackResult) {
        throw new Error(normalizeGatewayErrorMessage(error.message || 'Gateway indisponivel.'))
      }

      if (fallbackResult.configured === false) {
        throw new Error('Gateway WestPay desativado ou sem credenciais no painel admin.')
      }

      if (fallbackResult.success === false) {
        throw new Error(normalizeGatewayErrorMessage(extractGatewayMessage(fallbackResult.data) || fallbackResult.error || error.message || 'WestPay recusou a requisicao.'))
      }

      return fallbackResult
    }

    const result = data as WestPayInvokeResult | null
    if (!result) {
      throw new Error('Resposta vazia da funcao WestPay.')
    }

    if (result.configured === false) {
      throw new Error('Gateway WestPay desativado ou sem credenciais no painel admin.')
    }

    if (result.success === false) {
      throw new Error(normalizeGatewayErrorMessage(extractGatewayMessage(result.data) || result.error || 'WestPay recusou a requisicao.'))
    }

    return result
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('Gateway WestPay desativado')) throw err
    if (msg.includes('Pagamento via Pix temporariamente')) throw err
    
    throw new Error(normalizeGatewayErrorMessage(msg))
  }
}

export async function ensureWestPayReady() {
  await invokeWestPayStrict('status')
}

export async function createWestPayPixIn(payload: {
  saleId: string
  amount: number
  customer: WestPayCustomer
  itemTitle: string
}) {
  const customer = {
    name: payload.customer.name,
    email: payload.customer.email,
    phone: payload.customer.phone,
    document: {
      number: payload.customer.documentNumber,
      type: payload.customer.documentType,
    },
  }

  return invokeWestPay('create_pix_in', {
    saleId: payload.saleId,
    amount: payload.amount,
    customer,
    items: [
      {
        title: payload.itemTitle,
        unitPrice: payload.amount,
        quantity: 1,
        tangible: false,
      },
    ],
    externalRef: `sale-${payload.saleId}`,
  })
}

export async function createWestPayPixInOrThrow(payload: {
  saleId: string
  amount: number
  customer: WestPayCustomer
  itemTitle: string
}) {
  const customer = {
    name: payload.customer.name,
    email: payload.customer.email,
    phone: payload.customer.phone,
    document: {
      number: payload.customer.documentNumber,
      type: payload.customer.documentType,
    },
  }

  return invokeWestPayStrict('create_pix_in', {
    saleId: payload.saleId,
    amount: payload.amount,
    customer,
    items: [
      {
        title: payload.itemTitle,
        unitPrice: payload.amount,
        quantity: 1,
        tangible: false,
      },
    ],
    externalRef: `sale-${payload.saleId}`,
  })
}

export async function createWestPayPixOut(payload: {
  withdrawalId: string | number
  amount: number
  pixKey: string
  destinationName: string
  destinationDocument: string
}) {
  return invokeWestPay('create_pix_out', {
    withdrawalId: String(payload.withdrawalId),
    amount: payload.amount,
    pixKey: payload.pixKey,
    destinationName: payload.destinationName,
    destinationDocument: payload.destinationDocument,
    externalRef: `withdrawal-${payload.withdrawalId}`,
  })
}

export async function createWestPayWalletDepositPixIn(payload: {
  depositId: string
  amount: number
  customer: WestPayCustomer
}) {
  const customer = {
    name: payload.customer.name,
    email: payload.customer.email,
    phone: payload.customer.phone,
    document: {
      number: payload.customer.documentNumber,
      type: payload.customer.documentType,
    },
  }

  return invokeWestPayStrict('create_wallet_deposit_pix_in', {
    depositId: payload.depositId,
    amount: payload.amount,
    customer,
  })
}

export async function createWestPayGroupPromotionPixIn(payload: {
  groupId: string | number
  amount: number
  customer: WestPayCustomer
}) {
  const customer = {
    name: payload.customer.name,
    email: payload.customer.email,
    phone: payload.customer.phone,
    document: {
      number: payload.customer.documentNumber,
      type: payload.customer.documentType,
    },
  }

  return invokeWestPayStrict('create_group_promotion_pix_in', {
    groupId: String(payload.groupId),
    amount: payload.amount,
    customer,
  })
}

export async function westPayBalance() {
  return invokeWestPay('balance')
}

export async function westPayStatus() {
  return invokeWestPayStrict('status')
}
