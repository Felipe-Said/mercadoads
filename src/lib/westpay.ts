import { supabase } from './supabase'

type WestPayInvokeResult = {
  configured?: boolean
  success?: boolean
  data?: unknown
  error?: string
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
