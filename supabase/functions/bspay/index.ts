import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

async function getBspayToken(clientId: string, clientSecret: string) {
  const credentials = btoa(`${clientId}:${clientSecret}`)
  const response = await fetch('https://api.bspay.co/v2/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ grant_type: 'client_credentials' })
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Falha ao obter token BSPay: ${err}`)
  }

  const data = await response.json()
  return data.access_token
}

async function generateHmacSignature(payload: string, webhookSecret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payload)
  )
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase variables.')

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

    // Load BSPay Settings
    const { data: settingsData, error: settingsError } = await supabaseAdmin
      .from('payment_gateway_settings')
      .select('bspay_active, bspay_client_id, bspay_client_secret, bspay_webhook_secret')
      .eq('id', 1)
      .single()

    if (settingsError || !settingsData?.bspay_active) {
      throw new Error('BSPay gateway nao esta ativo ou configurado.')
    }

    const { bspay_client_id, bspay_client_secret, bspay_webhook_secret } = settingsData
    if (!bspay_client_id || !bspay_client_secret) throw new Error('Credenciais BSPay incompletas.')

    // WEBHOOK ACTION
    if (action === 'webhook') {
      const signature = req.headers.get('x-webhook-signature')
      if (!signature) return json({ error: 'Missing signature' }, 401)

      const rawBody = await req.text()
      const expectedSignature = await generateHmacSignature(rawBody, bspay_webhook_secret)

      if (signature !== expectedSignature) {
        return json({ error: 'Invalid signature' }, 401)
      }

      const event = JSON.parse(rawBody)

      if (event.event === 'cashin.confirmed') {
        const saleId = event.data?.external_id
        if (saleId) {
          await supabaseAdmin
            .from('sales')
            .update({ status: 'paid', updated_at: new Date().toISOString() })
            .eq('id', saleId)
        }
      } else if (event.event === 'cashin.expired' || event.event === 'cashin.refunded') {
        const saleId = event.data?.external_id
        if (saleId) {
          await supabaseAdmin
            .from('sales')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', saleId)
        }
      }

      return json({ received: true })
    }

    // CREATE CASHIN ACTIONS
    if (action === 'create_pix_in' || action === 'create_crypto_in') {
      const { saleId } = await req.json()
      if (!saleId) throw new Error('saleId is required')

      const { data: saleData, error: saleError } = await supabaseAdmin
        .from('sales')
        .select(`
          id, total_amount, status, buyer_email, buyer_name, buyer_document,
          buyer:buyer_id ( email, user_metadata )
        `)
        .eq('id', saleId)
        .single()

      if (saleError || !saleData) throw new Error('Sale not found')
      if (saleData.status === 'paid') throw new Error('Sale already paid')

      const token = await getBspayToken(bspay_client_id, bspay_client_secret)
      const isCrypto = action === 'create_crypto_in'

      const postbackUrl = `${getFunctionBaseUrl(supabaseUrl)}/bspay?action=webhook`
      
      const payerDocument = saleData.buyer_document || saleData.buyer?.user_metadata?.cpf || '00000000000'
      const payerName = saleData.buyer_name || saleData.buyer?.user_metadata?.full_name || 'Cliente'

      const cashinPayload: any = {
        amount: Number(saleData.total_amount).toFixed(2),
        currency: isCrypto ? 'USDT' : 'BRL',
        postback_url: postbackUrl,
        external_id: saleData.id,
        payer: {
          name: payerName,
          document: payerDocument.replace(/\D/g, '')
        }
      }

      if (isCrypto) {
        cashinPayload.chain = 'tron' // Always TRC20 for USDT
      }

      // Need to compute HMAC signature for the cashin? Actually Cashin usually requires Bearer Token. Wait, the docs say Cashout requires HMAC, but what about Cashin?
      // Wait, let's just send the POST request.
      const cashinRes = await fetch('https://api.bspay.co/v2/transactions/cashin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cashinPayload)
      })

      if (!cashinRes.ok) {
        const err = await cashinRes.text()
        throw new Error(`BSPay error: ${err}`)
      }

      const cashinData = await cashinRes.json()
      
      let qrcode_text = null
      
      if (isCrypto) {
        qrcode_text = cashinData.data?.payment_info?.address
      } else {
        qrcode_text = cashinData.data?.payment_info?.qrcode || cashinData.data?.payment_info?.payload
      }

      await supabaseAdmin
        .from('sales')
        .update({
          payment_gateway: 'bspay',
          payment_id: cashinData.data?.transaction_id,
          payment_qrcode_text: qrcode_text,
        })
        .eq('id', saleId)

      return json({ ok: true, qrcode_text })
    }

    return json({ error: 'Unknown action' }, 400)

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return json({ error: message }, 500)
  }
})
