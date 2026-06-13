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

async function parseRequestBody(req: Request) {
  const raw = await req.text()
  if (!raw) return {}
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return {}
  }
}

function firstMatch(html: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) {
      return decodeHtmlEntities(match[1]).trim()
    }
  }
  return ''
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (match, code) => {
      const parsed = Number(code)
      return Number.isFinite(parsed) ? String.fromCharCode(parsed) : match
    })
    .replace(/&#x([0-9a-f]+);/gi, (match, code) => {
      const parsed = parseInt(code, 16)
      return Number.isFinite(parsed) ? String.fromCharCode(parsed) : match
    })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const body = await parseRequestBody(req)
  const link = String(body.link || '').trim()

  if (!/^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9_-]+/i.test(link)) {
    return json({ success: false, error: 'Informe um link valido de grupo do WhatsApp.' }, 400)
  }

  try {
    const response = await fetch(link, {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'Mozilla/5.0 CookieMarketBot/1.0',
      },
    })
    const html = await response.text()
    const name = firstMatch(html, [
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
      /<title[^>]*>([^<]+)<\/title>/i,
    ])
    const image = firstMatch(html, [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    ])

    return json({
      success: true,
      name: name.replace(/\s*\|\s*WhatsApp.*$/i, '').trim() || 'Grupo do WhatsApp',
      imageUrl: image || null,
    })
  } catch {
    return json({ success: true, name: 'Grupo do WhatsApp', imageUrl: null })
  }
})
