import { supabase } from './supabase'

export type Role = 'user' | 'seller' | 'admin'

export interface Profile {
  id: string
  role: Role
  full_name: string | null
  email?: string | null
  phone?: string | null
  pix_key?: string | null
  status?: 'active' | 'blocked'
  store_name?: string | null
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
  category: string | null
  stock: number | null
  sales_count: number
  status: 'draft' | 'active' | 'paused' | 'rejected'
  hidden_by_admin?: boolean
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
  position: 'home_hero' | 'left_flyer' | 'right_flyer'
}

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
  gateway_payload?: Record<string, unknown> | null
  products?: { title: string | null; image_url: string | null; file_url?: string | null; seller_note?: string | null } | null
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

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    seller_id: (row.seller_id as string | null) ?? null,
    title: String(row.title ?? ''),
    description: (row.description as string | null) ?? null,
    price: toNumber(row.price),
    originalPrice: row.original_price == null ? undefined : toNumber(row.original_price),
    installments: row.installments ? String(row.installments) : undefined,
    shipping: String(row.delivery_type ?? 'Entrega digital na plataforma'),
    image: String(row.image_url ?? ''),
    category: (row.category as string | null) ?? null,
    stock: row.stock == null ? null : toNumber(row.stock),
    sales_count: toNumber(row.sales_count),
    status: (row.status as Product['status']) ?? 'active',
    hidden_by_admin: Boolean(row.hidden_by_admin ?? false),
    seller: (row.profiles as Profile | null) ?? null,
  }
}

export async function getProducts(options: { offersOnly?: boolean; category?: string; sellerId?: string; includeInactive?: boolean } = {}) {
  let query = supabase
    .from('products')
    .select('*, profiles:seller_id(id, role, full_name, store_name, seller_category, pix_key, created_at)')
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
    .select('*, profiles:seller_id(id, role, full_name, store_name, seller_category, pix_key, created_at)')
    .eq('id', id)
    .eq('status', 'active')
    .eq('hidden_by_admin', false)
    .maybeSingle()

  if (error) throw error
  return data ? mapProduct(data as Record<string, unknown>) : null
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
    name: row.name,
    members: Number(row.members ?? 0),
    category: row.category,
    link: row.link,
    image: row.image_url,
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
  })) as Banner[]
}

export async function getSales(options: { buyerId?: string; sellerId?: string } = {}) {
  let query = supabase
    .from('sales')
    .select('*, products(title, image_url, file_url, seller_note), buyer:buyer_id(full_name), seller:seller_id(full_name)')
    .order('created_at', { ascending: false })

  if (options.buyerId) query = query.eq('buyer_id', options.buyerId)
  if (options.sellerId) query = query.eq('seller_id', options.sellerId)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map((sale) => ({ ...sale, amount: Number(sale.amount) })) as Sale[]
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
