import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type GatewaySettings = {
  provider: string
  active: boolean
  westpay_api_key: string | null
  westpay_public_key: string | null
  westpay_user_agent: string | null
  westpay_webhook_secret: string | null
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function getFunctionBaseUrl(supabaseUrl: string) {
  return supabaseUrl.replace('.supabase.co', '.functions.supabase.co')
}

function normalizeDigits(value: string) {
  return value.replace(/\D/g, '')
}

function firstString(...values: unknown[]) {
  const found = values.find((value) => {
    if (typeof value === 'string') return value.trim().length > 0
    return value !== null && value !== undefined && String(value).trim().length > 0
  })

  return found === undefined || found === null ? null : String(found).trim()
}

function inferPixKeyType(pixKey: string) {
  const trimmed = pixKey.trim()
  const digits = normalizeDigits(trimmed)
  if (trimmed.includes('@')) return 'EMAIL'
  if (/^\d{11}$/.test(digits)) return 'CPF'
  if (/^\d{14}$/.test(digits)) return 'CNPJ'
  if (/^\+?\d{10,13}$/.test(trimmed.replace(/\s+/g, ''))) return 'PHONE'
  return 'EVP'
}

function parseExternalRef(payload: Record<string, unknown>) {
  const candidates = [
    payload.externalRef,
    payload.external_ref,
    (payload.data as Record<string, unknown> | undefined)?.externalRef,
    (payload.data as Record<string, unknown> | undefined)?.external_ref,
    (payload.transaction as Record<string, unknown> | undefined)?.externalRef,
    (payload.transaction as Record<string, unknown> | undefined)?.external_ref,
    (payload.payment as Record<string, unknown> | undefined)?.externalRef,
    (payload.payment as Record<string, unknown> | undefined)?.external_ref,
  ]

  return firstString(...candidates)
}

function parseStatus(payload: Record<string, unknown>) {
  const candidates = [
    payload.event,
    payload.status,
    (payload.data as Record<string, unknown> | undefined)?.event,
    (payload.data as Record<string, unknown> | undefined)?.status,
    (payload.transaction as Record<string, unknown> | undefined)?.status,
    (payload.transaction as Record<string, unknown> | undefined)?.event,
  ]

  return candidates
    .filter((value) => typeof value === 'string')
    .map((value) => String(value).toLowerCase())
    .join(' ')
}

function mapSaleStatus(statusText: string) {
  if (statusText.includes('confirmado') || statusText.includes('paid') || statusText.includes('pago') || statusText.includes('completed')) {
    return 'paid'
  }
  if (statusText.includes('estorno') || statusText.includes('refund') || statusText.includes('chargeback')) {
    return 'cancelled'
  }
  if (statusText.includes('falhou') || statusText.includes('failed') || statusText.includes('expirada') || statusText.includes('cancelada') || statusText.includes('cancelled')) {
    return 'cancelled'
  }
  return null
}

function mapWithdrawalStatus(statusText: string) {
  if (statusText.includes('completada') || statusText.includes('completed') || statusText.includes('aprovada') || statusText.includes('processing')) {
    return 'paid'
  }
  if (statusText.includes('rejeitada') || statusText.includes('rejected') || statusText.includes('falhou') || statusText.includes('failed') || statusText.includes('cancelada') || statusText.includes('cancelled')) {
    return 'rejected'
  }
  return null
}

function extractPixInfo(transaction: Record<string, unknown>) {
  const pix = (transaction.pix as Record<string, unknown> | undefined) ?? {}
  const qrcode = firstString(pix.qrcode, pix.code, pix.copyPaste, pix.copiaCola, pix.brCode)
  const expiresAt = firstString(pix.expiresAt, pix.expires_at)
  return { qrcode, expiresAt }
}

async function loadGatewaySettings(supabaseAdmin: ReturnType<typeof createClient>) {
  const { data, error } = await supabaseAdmin
    .from('payment_gateway_settings')
    .select('provider, active, westpay_api_key, westpay_public_key, westpay_user_agent, westpay_webhook_secret')
    .eq('id', 1)
    .maybeSingle()

  if (error) throw error
  return data as GatewaySettings | null
}

async function callWestPay(settings: GatewaySettings, path: string, method: 'GET' | 'POST', body?: Record<string, unknown>) {
  if (!settings.westpay_api_key || !settings.westpay_public_key) {
    return { configured: false as const }
  }

  const headers = new Headers({
    Authorization: `Basic ${btoa(`${settings.westpay_api_key}:${settings.westpay_public_key}`)}`,
    'User-Agent': settings.westpay_user_agent?.trim() || 'Mercado Ads/1.0 (+suporte@mercadoads.com)',
  })

  const init: RequestInit = { method, headers }
  if (body && method !== 'GET') {
    headers.set('Content-Type', 'application/json')
    init.body = JSON.stringify(body)
  }

  const response = await fetch(`https://api.gw.westpay.com.br${path}`, init)
  const text = await response.text()

  let data: unknown = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!response.ok) {
    return {
      configured: true as const,
      success: false as const,
      status: response.status,
      data,
    }
  }

  return {
    configured: true as const,
    success: true as const,
    data,
  }
}

async function updateSaleFromWebhook(supabaseAdmin: ReturnType<typeof createClient>, payload: Record<string, unknown>) {
  const externalRef = parseExternalRef(payload)
  if (!externalRef?.startsWith('sale-')) {
    return { skipped: true }
  }

  const saleId = externalRef.replace('sale-', '')
  const statusText = parseStatus(payload)
  const mappedStatus = mapSaleStatus(statusText)
  const transaction = (payload.data as Record<string, unknown> | undefined) ?? (payload.transaction as Record<string, unknown> | undefined) ?? payload
  const { qrcode, expiresAt } = extractPixInfo(transaction)

  const updates: Record<string, unknown> = {
    payment_gateway: 'westpay',
    payment_external_ref: externalRef,
    payment_transaction_id: firstString(transaction.id, transaction.transactionId, transaction.secureId),
    payment_qrcode: qrcode,
    payment_qrcode_text: qrcode,
    payment_qrcode_expires_at: expiresAt,
    gateway_payload: payload,
  }

  if (mappedStatus) {
    updates.status = mappedStatus
    if (mappedStatus === 'paid') {
      const paidAt = new Date().toISOString()
      updates.paid_at = paidAt
      updates.claim_until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  }

  const { error } = await supabaseAdmin.from('sales').update(updates).eq('id', saleId)
  if (error) throw error
  return { updated: true }
}

async function updateWithdrawalFromWebhook(supabaseAdmin: ReturnType<typeof createClient>, payload: Record<string, unknown>) {
  const externalRef = parseExternalRef(payload)
  if (!externalRef?.startsWith('withdrawal-')) {
    return { skipped: true }
  }

  const withdrawalId = externalRef.replace('withdrawal-', '')
  const statusText = parseStatus(payload)
  const mappedStatus = mapWithdrawalStatus(statusText)
  const transaction = (payload.data as Record<string, unknown> | undefined) ?? (payload.transaction as Record<string, unknown> | undefined) ?? payload

  const updates: Record<string, unknown> = {
    gateway_provider: 'westpay',
    gateway_external_ref: externalRef,
    gateway_transaction_id: firstString(transaction.id, transaction.transactionId),
    gateway_secure_id: firstString(transaction.secureId, transaction.secure_id),
    gateway_status: firstString(transaction.status, statusText),
    gateway_payload: payload,
  }

  if (mappedStatus) {
    updates.status = mappedStatus
  }

  const { error } = await supabaseAdmin.from('withdrawals').update(updates).eq('id', withdrawalId)
  if (error) throw error
  return { updated: true }
}

async function parseRequestBody(req: Request) {
  const contentType = req.headers.get('content-type') || ''
  const raw = await req.text()

  if (!raw) return {}

  if (contentType.includes('application/json') || raw.trim().startsWith('{') || raw.trim().startsWith('[')) {
    try {
      return JSON.parse(raw) as Record<string, unknown>
    } catch {
      return {}
    }
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(raw).entries()) as Record<string, unknown>
  }

  return { raw }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !serviceRole) {
    return json({ success: false, configured: false, error: 'Supabase not configured.' }, 500)
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRole)
  const settings = await loadGatewaySettings(supabaseAdmin)

  if (!settings || !settings.active || settings.provider !== 'westpay') {
    return json({ success: true, configured: false })
  }

  const url = new URL(req.url)
  const body = req.method === 'GET' ? {} : await parseRequestBody(req)
  const action = String(url.searchParams.get('action') || body.action || '').toLowerCase()

  if (action === 'webhook') {
    const secret = url.searchParams.get('token')
    if (!settings.westpay_webhook_secret || secret !== settings.westpay_webhook_secret) {
      return json({ success: false, error: 'Webhook token invalid.' }, 401)
    }

    const updatedSale = await updateSaleFromWebhook(supabaseAdmin, body)
    const updatedWithdrawal = await updateWithdrawalFromWebhook(supabaseAdmin, body)
    return json({ success: true, configured: true, sale: updatedSale, withdrawal: updatedWithdrawal })
  }

  if (action === 'balance') {
    const westpayResult = await callWestPay(settings, '/api/v1/balance', 'GET')
    return json(westpayResult, westpayResult.success === false ? 400 : 200)
  }

  if (action === 'create_pix_in') {
    const saleId = String(body.saleId || '')
    const amount = Number(body.amount ?? 0)
    const customer = (body.customer as Record<string, unknown> | undefined) ?? {}
    const items = (body.items as Array<Record<string, unknown>> | undefined) ?? []

    if (!saleId || !amount || items.length === 0) {
      return json({ success: false, configured: true, error: 'Invalid Pix IN data.' }, 400)
    }

    const westpayResult = await callWestPay(settings, '/api/v1/transactions', 'POST', {
      amount,
      customer,
      items,
      paymentMethod: 'pix',
      externalRef: `sale-${saleId}`,
      postbackUrl: settings.westpay_webhook_secret
        ? `${getFunctionBaseUrl(supabaseUrl)}/westpay?action=webhook&token=${encodeURIComponent(settings.westpay_webhook_secret)}`
        : `${getFunctionBaseUrl(supabaseUrl)}/westpay?action=webhook`,
      pix: { expiresInDays: 2 },
    })

    if (westpayResult.success === false) {
      return json(westpayResult, westpayResult.status ?? 400)
    }

    const transaction = (westpayResult.data as Record<string, unknown> | undefined) ?? {}
    const { qrcode, expiresAt } = extractPixInfo(transaction)

    await supabaseAdmin.from('sales').update({
      payment_gateway: 'westpay',
      payment_external_ref: `sale-${saleId}`,
      payment_transaction_id: firstString(transaction.id, transaction.transactionId, transaction.secureId),
      payment_qrcode: qrcode,
      payment_qrcode_text: qrcode,
      payment_qrcode_expires_at: expiresAt,
      gateway_payload: transaction,
    }).eq('id', saleId)

    return json({ success: true, configured: true, data: westpayResult.data })
  }

  if (action === 'create_pix_out') {
    const withdrawalId = String(body.withdrawalId || '')
    const amount = Number(body.amount ?? 0)
    const pixKey = String(body.pixKey || '').trim()
    const destinationName = String(body.destinationName || '').trim()
    const destinationDocument = String(body.destinationDocument || '').trim()

    if (!withdrawalId || !amount || !pixKey || !destinationName || !destinationDocument) {
      return json({ success: false, configured: true, error: 'Invalid Pix OUT data.' }, 400)
    }

    const westpayResult = await callWestPay(settings, '/api/v1/transactions/pix-out', 'POST', {
      amount,
      pixKey,
      pixKeyType: inferPixKeyType(pixKey),
      destinationName,
      destinationDocument: normalizeDigits(destinationDocument),
      externalRef: `withdrawal-${withdrawalId}`,
      postbackUrl: settings.westpay_webhook_secret
        ? `${getFunctionBaseUrl(supabaseUrl)}/westpay?action=webhook&token=${encodeURIComponent(settings.westpay_webhook_secret)}`
        : `${getFunctionBaseUrl(supabaseUrl)}/westpay?action=webhook`,
    })

    if (westpayResult.success === false) {
      return json(westpayResult, westpayResult.status ?? 400)
    }

    const transaction = (westpayResult.data as Record<string, unknown> | undefined) ?? {}

    await supabaseAdmin.from('withdrawals').update({
      gateway_provider: 'westpay',
      gateway_external_ref: `withdrawal-${withdrawalId}`,
      gateway_transaction_id: firstString(transaction.id, transaction.transactionId),
      gateway_secure_id: firstString(transaction.secureId, transaction.secure_id),
      gateway_status: firstString(transaction.status, 'PROCESSING'),
      gateway_payload: transaction,
      status: 'paid',
    }).eq('id', withdrawalId)

    return json({ success: true, configured: true, data: westpayResult.data })
  }

  return json({ success: false, configured: true, error: 'Action not supported.' }, 400)
})
