import { supabase } from './supabase'

export type Role = 'user' | 'seller' | 'admin'

export interface Profile {
  id: string
  role: Role
  full_name: string | null
  email?: string | null
  phone?: string | null
  avatar_url?: string | null
  pix_key?: string | null
  status?: 'active' | 'blocked'
  store_name?: string | null
  store_slug?: string | null
  store_bio?: string | null
  store_bio_tools_json?: Record<string, boolean> | null
  store_bio_background_color?: string | null
  store_bio_button_color?: string | null
  store_bio_button_text_color?: string | null
  linkbio_referrer_id?: string | null
  seller_category?: string | null
  created_at: string
}

export interface Product {
  id: string
  seller_id: string | null
  title: string
  description: string | null
  price: number
  originalPrice?: number
  installments?: string
  shipping: string
  image: string
  images?: string[]
  category: string | null
  stock: number | null
  allow_affiliates?: boolean
  default_commission?: number
  sales_count: number
  status: 'draft' | 'active' | 'paused' | 'rejected'
  hidden_by_admin?: boolean
  delivery_method?: 'ready' | 'dropservice' | null
  is_boosted?: boolean
  boosted_at?: string | null
  boost_expires_at?: string | null
  created_at: string
  seller?: Profile | null
}

export interface Group {
  id: string
  name: string
  members: number
  category: string
  link: string
  image: string
  sponsored: boolean
}

export interface Banner {
  id: string
  title: string
  subtitle: string | null
  image: string | null
  mobile_image: string | null
  link: string
  color: string
  position: BannerPosition
  is_active?: boolean
}

export type BannerPosition =
  | 'home_hero'
  | 'left_flyer'
  | 'right_flyer'
  | 'home_side_top'
  | 'home_side_middle'
  | 'home_side_bottom'
  | 'home_middle'
  | 'home_bottom'
  | 'home_deals_top'
  | 'home_deals_bottom'
  | 'home_grid_1'
  | 'home_grid_2'
  | 'home_grid_3'
  | 'home_grid_4'

export interface Sale {
  id: string
  product_id: string | null
  buyer_id: string | null
  seller_id: string | null
  amount: number
  status: 'pending' | 'paid' | 'cancelled'
  created_at: string
  paid_at?: string | null
  claim_until?: string | null
  payment_gateway?: string | null
  payment_external_ref?: string | null
  payment_transaction_id?: string | null
  payment_qrcode?: string | null
  payment_qrcode_text?: string | null
  payment_qrcode_expires_at?: string | null
  affiliate_user_id?: string | null
  affiliate_source?: string | null
  affiliate_commission_percent?: number | null
  affiliate_commission_amount?: number | null
  proxy_country_code?: string | null
  proxy_country_name?: string | null
  proxy_endpoint?: string | null
  proxy_port?: string | null
  virtual_number_service_id?: string | null
  virtual_number_service_name?: string | null
  virtual_number_service_code?: string | null
  virtual_number_country_code?: string | null
  virtual_number_country_name?: string | null
  virtual_number_ddd?: string | null
  virtual_number_operator?: string | null
  temp_email_service_id?: string | null
  temp_email_service_name?: string | null
  temp_email_service_code?: string | null
  temp_email_domain?: string | null
  smm_service_id?: string | null
  smm_service_name?: string | null
  smm_service_type?: string | null
  smm_service_category?: string | null
  smm_link?: string | null
  smm_quantity?: number | null
  gateway_payload?: Record<string, unknown> | null
  products?: { title: string | null; image_url: string | null; file_url?: string | null; seller_note?: string | null } | null
  product_reviews?: Array<{ id: string; rating: number; title: string | null; body: string | null }> | null
  proxy_offers?: { name: string | null; traffic: string | null; protocol: string | null } | null
  proxy_deliveries?: Array<{
    username: string
    password: string
    host: string
    port: string
    traffic_limit_gb: number
    status: string
  }> | null
  virtual_number_deliveries?: Array<{
    service_name: string
    phone_number: string | null
    sms_code: string | null
    status: string
    expires_at: string | null
  }> | null
  temp_email_deliveries?: Array<{
    service_name: string
    domain: string | null
    email: string | null
    code: string | null
    status: string
    expires_at: string | null
  }> | null
  smm_deliveries?: Array<{
    service_name: string
    provider_order_id: string | null
    link: string
    quantity: number
    status: string
    start_count: string | null
    remains: string | null
  }> | null
  buyer?: { full_name: string | null } | null
  seller?: { full_name: string | null } | null
}

const toNumber = (value: unknown) => Number(value ?? 0)

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(value))
}

export function decodeHtmlEntities(value: string) {
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

function mapProduct(row: Record<string, unknown>): Product {
  const gallery = Array.isArray(row.image_gallery_json)
    ? (row.image_gallery_json as unknown[]).map(String).filter(Boolean)
    : []
  const mainImage = String(row.image_url ?? gallery[0] ?? '')

  return {
    id: String(row.id),
    seller_id: (row.seller_id as string | null) ?? null,
    title: String(row.title ?? ''),
    description: (row.description as string | null) ?? null,
    price: toNumber(row.price),
    originalPrice: row.original_price == null ? undefined : toNumber(row.original_price),
    installments: row.installments ? String(row.installments) : undefined,
    shipping: String(row.delivery_type ?? 'Entrega digital na plataforma'),
    image: mainImage,
    images: gallery.length ? gallery : mainImage ? [mainImage] : [],
    category: (row.category as string | null) ?? null,
    stock: row.stock == null ? null : toNumber(row.stock),
    allow_affiliates: Boolean(row.allow_affiliates ?? false),
    default_commission: toNumber(row.default_commission),
    sales_count: toNumber(row.sales_count),
    status: (row.status as Product['status']) ?? 'active',
    hidden_by_admin: Boolean(row.hidden_by_admin ?? false),
    delivery_method: (row.delivery_method as Product['delivery_method']) ?? 'ready',
    is_boosted: Boolean(row.is_boosted ?? false),
    boosted_at: (row.boosted_at as string | null) ?? null,
    boost_expires_at: (row.boost_expires_at as string | null) ?? null,
    created_at: String(row.created_at ?? ''),
    seller: (row.profiles as Profile | null) ?? null,
  }
}

export function isProductBoosted(product: Product) {
  if (!product.is_boosted) return false
  if (!product.boost_expires_at) return true
  return new Date(product.boost_expires_at).getTime() > Date.now()
}

function sortBoostedFirst(left: Product, right: Product) {
  const boostDelta = Number(isProductBoosted(right)) - Number(isProductBoosted(left))
  if (boostDelta !== 0) return boostDelta
  return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
}

export async function getProducts(options: { offersOnly?: boolean; category?: string; sellerId?: string; includeInactive?: boolean } = {}) {
  let query = supabase
    .from('products')
    .select('*, profiles:seller_id(id, role, full_name, store_name, seller_category, avatar_url, pix_key, created_at)')
    .order('created_at', { ascending: false })

  if (!options.includeInactive) query = query.eq('status', 'active')
  if (!options.includeInactive) query = query.eq('hidden_by_admin', false)
  if (options.offersOnly) query = query.not('original_price', 'is', null)
  if (options.category && options.category !== 'all') query = query.ilike('category', `%${options.category}%`)
  if (options.sellerId) query = query.eq('seller_id', options.sellerId)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map((row) => mapProduct(row as Record<string, unknown>))
}

export async function getProduct(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, profiles:seller_id(id, role, full_name, store_name, seller_category, avatar_url, pix_key, created_at)')
    .eq('id', id)
    .eq('status', 'active')
    .eq('hidden_by_admin', false)
    .maybeSingle()

  if (error) throw error
  return data ? mapProduct(data as Record<string, unknown>) : null
}

export async function getProfileBySlug(slug: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('store_slug', slug)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    id: String(data.id),
    role: (data.role as Profile['role']) ?? 'user',
    full_name: (data.full_name as string | null) ?? null,
    email: (data.email as string | null) ?? null,
    phone: (data.phone as string | null) ?? null,
    avatar_url: (data.avatar_url as string | null) ?? null,
    pix_key: (data.pix_key as string | null) ?? null,
    status: (data.status as Profile['status']) ?? 'active',
    store_name: (data.store_name as string | null) ?? null,
    store_slug: (data.store_slug as string | null) ?? null,
    store_bio: (data.store_bio as string | null) ?? null,
    store_bio_tools_json: (data.store_bio_tools_json as Record<string, boolean> | null) ?? null,
    store_bio_background_color: (data.store_bio_background_color as string | null) ?? null,
    store_bio_button_color: (data.store_bio_button_color as string | null) ?? null,
    store_bio_button_text_color: (data.store_bio_button_text_color as string | null) ?? null,
    linkbio_referrer_id: (data.linkbio_referrer_id as string | null) ?? null,
    seller_category: (data.seller_category as string | null) ?? null,
    created_at: String(data.created_at ?? ''),
  }
}

export async function recordProductClick(product: Product, userId?: string | null) {
  const { error } = await supabase.from('product_clicks').insert({
    product_id: product.id,
    user_id: userId ?? null,
    category: product.category,
  })

  if (error) console.warn('product click ignored', error.message)
}

export async function recordProductSearch(query: string, products: Product[], userId?: string | null) {
  const term = query.trim().toLowerCase()
  if (term.length < 2) return

  const matchedProduct = products.find((product) => {
    const category = product.category?.toLowerCase() ?? ''
    const title = product.title.toLowerCase()
    return category.includes(term) || title.includes(term)
  })

  const { error } = await supabase.from('product_searches').insert({
    query: query.trim(),
    user_id: userId ?? null,
    matched_category: matchedProduct?.category ?? null,
  })

  if (error) console.warn('product search ignored', error.message)
}

export async function getPopularProducts(products: Product[], limit = 4) {
  const fallback = [...products]
    .sort((left, right) => {
      const salesDelta = Number(right.sales_count ?? 0) - Number(left.sales_count ?? 0)
      if (salesDelta !== 0) return salesDelta
      return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
    })
    .slice(0, limit)

  if (!products.length) return []

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const [clicksResult, searchesResult] = await Promise.all([
    supabase.from('product_clicks').select('product_id, category').gte('created_at', since),
    supabase.from('product_searches').select('matched_category').gte('created_at', since).not('matched_category', 'is', null),
  ])

  if (clicksResult.error || searchesResult.error) {
    if (clicksResult.error) console.warn('popular clicks ignored', clicksResult.error.message)
    if (searchesResult.error) console.warn('popular searches ignored', searchesResult.error.message)
    return fallback
  }

  const clickCounts = new Map<string, number>()
  const categorySearchCounts = new Map<string, number>()

  for (const click of clicksResult.data ?? []) {
    const productId = String(click.product_id ?? '')
    if (productId) clickCounts.set(productId, (clickCounts.get(productId) ?? 0) + 1)
  }

  for (const search of searchesResult.data ?? []) {
    const category = String(search.matched_category ?? '').toLowerCase()
    if (category) categorySearchCounts.set(category, (categorySearchCounts.get(category) ?? 0) + 1)
  }

  return [...products]
    .sort((left, right) => {
      const leftScore = (clickCounts.get(left.id) ?? 0) * 3 + (categorySearchCounts.get((left.category ?? '').toLowerCase()) ?? 0) * 2 + Number(left.sales_count ?? 0)
      const rightScore = (clickCounts.get(right.id) ?? 0) * 3 + (categorySearchCounts.get((right.category ?? '').toLowerCase()) ?? 0) * 2 + Number(right.sales_count ?? 0)
      if (rightScore !== leftScore) return rightScore - leftScore
      return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
    })
    .slice(0, limit)
}

function uniqueProducts(products: Product[]) {
  const seen = new Set<string>()
  return products.filter((product) => {
    if (seen.has(product.id)) return false
    seen.add(product.id)
    return true
  })
}

export async function getDailyOfferProducts(products: Product[], limit = 12) {
  const boosted = products
    .filter(isProductBoosted)
    .sort(sortBoostedFirst)
  const discounted = products
    .filter((product) => Number(product.originalPrice ?? 0) > Number(product.price ?? 0))
    .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
  const official = products
    .filter((product) => product.seller?.role === 'admin')
    .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())

  return uniqueProducts([...boosted, ...discounted, ...official]).slice(0, limit)
}

export async function getWeeklyBestSellerProducts(products: Product[], limit = 12) {
  const boosted = products.filter(isProductBoosted).sort(sortBoostedFirst)
  const official = products.filter((product) => product.seller?.role === 'admin')
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('sales')
    .select('product_id')
    .eq('status', 'paid')
    .gte('created_at', since)

  if (error) {
    console.warn('weekly sellers ignored', error.message)
    return uniqueProducts([...boosted, ...official, ...products.sort((left, right) => Number(right.sales_count ?? 0) - Number(left.sales_count ?? 0))]).slice(0, limit)
  }

  const saleCounts = new Map<string, number>()
  for (const sale of data ?? []) {
    const productId = String(sale.product_id ?? '')
    if (productId) saleCounts.set(productId, (saleCounts.get(productId) ?? 0) + 1)
  }

  const weeklySold = products
    .filter((product) => (saleCounts.get(product.id) ?? 0) > 0)
    .sort((left, right) => {
      const saleDelta = (saleCounts.get(right.id) ?? 0) - (saleCounts.get(left.id) ?? 0)
      if (saleDelta !== 0) return saleDelta
      return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
    })

  return uniqueProducts([...boosted, ...weeklySold, ...official]).slice(0, limit)
}

export async function getRecommendedProducts(products: Product[], userId?: string | null, limit = 12) {
  if (!products.length) return []
  if (!userId) return getPopularProducts(products, limit)

  const since = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  const [clicksResult, searchesResult, purchasesResult] = await Promise.all([
    supabase.from('product_clicks').select('product_id, category').eq('user_id', userId).gte('created_at', since),
    supabase.from('product_searches').select('matched_category').eq('user_id', userId).gte('created_at', since).not('matched_category', 'is', null),
    supabase.from('sales').select('product_id').eq('buyer_id', userId).in('status', ['pending', 'paid']).gte('created_at', since),
  ])

  if (clicksResult.error || searchesResult.error || purchasesResult.error) {
    if (clicksResult.error) console.warn('recommendation clicks ignored', clicksResult.error.message)
    if (searchesResult.error) console.warn('recommendation searches ignored', searchesResult.error.message)
    if (purchasesResult.error) console.warn('recommendation purchases ignored', purchasesResult.error.message)
    return getPopularProducts(products, limit)
  }

  const productScores = new Map<string, number>()
  const categoryScores = new Map<string, number>()

  for (const click of clicksResult.data ?? []) {
    const productId = String(click.product_id ?? '')
    const category = String(click.category ?? '').toLowerCase()
    if (productId) productScores.set(productId, (productScores.get(productId) ?? 0) + 8)
    if (category) categoryScores.set(category, (categoryScores.get(category) ?? 0) + 4)
  }

  for (const search of searchesResult.data ?? []) {
    const category = String(search.matched_category ?? '').toLowerCase()
    if (category) categoryScores.set(category, (categoryScores.get(category) ?? 0) + 6)
  }

  for (const purchase of purchasesResult.data ?? []) {
    const productId = String(purchase.product_id ?? '')
    if (productId) productScores.set(productId, (productScores.get(productId) ?? 0) + 12)
    const purchasedProduct = products.find((product) => product.id === productId)
    const category = purchasedProduct?.category?.toLowerCase() ?? ''
    if (category) categoryScores.set(category, (categoryScores.get(category) ?? 0) + 8)
  }

  const scored = products
    .map((product) => {
      const category = (product.category ?? '').toLowerCase()
      const score = (productScores.get(product.id) ?? 0)
        + (categoryScores.get(category) ?? 0)
        + Number(product.sales_count ?? 0)
        + (product.seller?.role === 'admin' ? 2 : 0)
      return { product, score }
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score
      return new Date(right.product.created_at).getTime() - new Date(left.product.created_at).getTime()
    })
    .map((item) => item.product)

  if (scored.length) {
    const boostedScored = scored.filter(isProductBoosted)
    return uniqueProducts([...boostedScored, ...scored]).slice(0, limit)
  }
  return getPopularProducts(products, limit)
}

export async function getGroups(limit?: number) {
  let query = supabase
    .from('network_groups')
    .select('*')
    .eq('is_active', true)
    .order('sponsored', { ascending: false })
    .order('created_at', { ascending: false })

  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map((row) => ({
    id: String(row.id),
    name: decodeHtmlEntities(String(row.name ?? '')),
    members: Number(row.members ?? 0),
    category: String(row.category ?? ''),
    link: String(row.link ?? ''),
    image: String(row.image_url ?? ''),
    sponsored: Boolean(row.sponsored),
  })) as Group[]
}

export async function getBanners(position?: Banner['position']) {
  let query = supabase
    .from('marketing_banners')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (position) query = query.eq('position', position)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map((row) => ({
    id: String(row.id),
    title: row.title,
    subtitle: row.subtitle,
    image: row.image_url,
    mobile_image: row.mobile_image_url,
    link: row.link_url,
    color: row.background_color ?? '#1E1E1E',
    position: row.position,
    is_active: Boolean(row.is_active),
  })) as Banner[]
}

export async function getSales(options: { buyerId?: string; sellerId?: string } = {}) {
  let query = supabase
    .from('sales')
    .select('*, products!sales_product_id_fkey(title, image_url, file_url, seller_note), product_reviews(id, rating, title, body), proxy_offers(name, traffic, protocol), proxy_deliveries(username, password, host, port, traffic_limit_gb, status), virtual_number_deliveries(service_name, phone_number, sms_code, status, expires_at), temp_email_deliveries(service_name, domain, email, code, status, expires_at), smm_deliveries(service_name, provider_order_id, link, quantity, status, start_count, remains), buyer:buyer_id(full_name), seller:seller_id(full_name)')
    .order('created_at', { ascending: false })

  if (options.buyerId) query = query.eq('buyer_id', options.buyerId)
  if (options.sellerId) query = query.or(`seller_id.eq.${options.sellerId},and(affiliate_user_id.eq.${options.sellerId},affiliate_source.eq.linkbio)`)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map((sale) => ({
    ...sale,
    amount: Number(sale.amount),
    affiliate_commission_percent: sale.affiliate_commission_percent == null ? null : Number(sale.affiliate_commission_percent),
    affiliate_commission_amount: sale.affiliate_commission_amount == null ? null : Number(sale.affiliate_commission_amount),
  })) as Sale[]
}

export async function getDashboardStats() {
  const start = new Date()
  start.setDate(1)
  start.setHours(0, 0, 0, 0)

  const [{ data: sales, error: salesError }, { count: usersCount, error: usersError }] = await Promise.all([
    supabase.from('sales').select('amount,status,created_at').gte('created_at', start.toISOString()),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
  ])

  if (salesError) throw salesError
  if (usersError) throw usersError

  const paidSales = (sales ?? []).filter((sale) => sale.status === 'paid')
  const volume = paidSales.reduce((sum, sale) => sum + Number(sale.amount), 0)

  return {
    monthlyVolume: volume,
    platformRevenue: volume * 0.1,
    activeUsers: usersCount ?? 0,
    paidSales: paidSales.length,
  }
}
