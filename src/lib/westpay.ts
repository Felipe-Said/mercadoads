import { supabase } from './supabase'

type WestPayInvokeResult = {
  configured?: boolean
  success?: boolean
  data?: unknown
  error?: string
}

function extractGatewayMessage(value: unknown) {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value !== 'object') return null

  const data = value as Record<string, unknown>
  const direct = data.message || data.error || data.details
  if (typeof direct === 'string') return direct

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.map((item) => typeof item === 'string' ? item : JSON.stringify(item)).join(', ')
  }

  return JSON.stringify(data)
}

export async function invokeWestPay(action: string, payload?: Record<string, unknown>) {
  try {
    const { data, error } = await supabase.functions.invoke('westpay', {
      body: { action, ...(payload ?? {}) },
    })

    if (error) return null

    const result = data as WestPayInvokeResult | null
    if (!result || result.configured === false || result.success === false) return null

    return result
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function invokeWestPayStrict(action: string, payload?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('westpay', {
    body: { action, ...(payload ?? {}) },
  })

  if (error) {
    throw new Error(error.message || 'Funcao WestPay indisponivel.')
  }

  const result = data as WestPayInvokeResult | null
  if (!result) {
    throw new Error('Resposta vazia da funcao WestPay.')
  }

  if (result.configured === false) {
    throw new Error('Gateway WestPay desativado ou sem credenciais no painel admin.')
  }

  if (result.success === false) {
    throw new Error(extractGatewayMessage(result.data) || result.error || 'WestPay recusou a requisicao.')
  }

  return result
}

export async function ensureWestPayReady() {
  await invokeWestPayStrict('status')
}

export async function createWestPayPixIn(payload: {
  saleId: string
  amount: number
  customer: { name: string; email: string; phone?: string | null }
  itemTitle: string
}) {
  const customer = {
    name: payload.customer.name,
    email: payload.customer.email,
    ...(payload.customer.phone ? { phone: payload.customer.phone } : {}),
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
  customer: { name: string; email: string; phone?: string | null }
  itemTitle: string
}) {
  const customer = {
    name: payload.customer.name,
    email: payload.customer.email,
    ...(payload.customer.phone ? { phone: payload.customer.phone } : {}),
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

export async function westPayBalance() {
  return invokeWestPay('balance')
}

export async function westPayStatus() {
  return invokeWestPayStrict('status')
}
