import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, Package } from 'lucide-react'
import { ArrowRight2, Chart2, CloudConnection, Mobile, Sms } from 'iconsax-react'
import { PlatformLogo } from '../components/PlatformLogo'
import { supabase } from '../lib/supabase'
import { getProducts, getProfileBySlug, type Product, type Profile } from '../lib/data'
import { DEFAULT_PLATFORM_SETTINGS, loadPlatformSettings, readCachedPlatformSettings, type StoreBioThemeSettings } from '../lib/platformSettings'

function formatPrice(price: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)
}

const toolLinks = [
  { key: 'proxy', label: 'Proxy', href: '/proxy', Icon: CloudConnection },
  { key: 'smm', label: 'SMM', href: '/smm', Icon: Chart2 },
  { key: 'numeroVirtual', label: 'Numero virtual', href: '/numero-virtual', Icon: Mobile },
  { key: 'emailTemporario', label: 'Email temporario', href: '/email-temporario', Icon: Sms },
]

async function getAffiliateProducts(profileId: string) {
  const { data: affiliates, error: affiliateError } = await supabase
    .from('affiliates')
    .select('product_id')
    .eq('user_id', profileId)
    .eq('status', 'active')
    .not('product_id', 'is', null)

  if (affiliateError) throw affiliateError

  const productIds = Array.from(new Set((affiliates ?? []).map((affiliate) => affiliate.product_id).filter(Boolean))).map(String)
  if (productIds.length === 0) return []

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*, profiles:seller_id(id, role, full_name, store_name, seller_category, avatar_url, pix_key, created_at)')
    .in('id', productIds)
    .eq('status', 'active')
    .eq('hidden_by_admin', false)
    .order('created_at', { ascending: false })

  if (productsError) throw productsError

  return (products ?? []).map((row) => ({
    id: String(row.id),
    seller_id: (row.seller_id as string | null) ?? null,
    title: String(row.title ?? ''),
    description: (row.description as string | null) ?? null,
    price: Number(row.price ?? 0),
    originalPrice: row.original_price == null ? undefined : Number(row.original_price ?? 0),
    shipping: String(row.delivery_type ?? 'Entrega digital na plataforma'),
    image: String(row.image_url ?? '/favicon.svg'),
    images: row.image_gallery_json && Array.isArray(row.image_gallery_json) ? (row.image_gallery_json as string[]) : [String(row.image_url ?? '/favicon.svg')],
    category: (row.category as string | null) ?? null,
    stock: row.stock == null ? null : Number(row.stock),
    allow_affiliates: Boolean(row.allow_affiliates ?? false),
    default_commission: Number(row.default_commission ?? 0),
    sales_count: Number(row.sales_count ?? 0),
    status: (row.status as Product['status']) ?? 'active',
    hidden_by_admin: Boolean(row.hidden_by_admin ?? false),
    delivery_method: (row.delivery_method as Product['delivery_method']) ?? 'ready',
    is_boosted: Boolean(row.is_boosted ?? false),
    boosted_at: (row.boosted_at as string | null) ?? null,
    boost_expires_at: (row.boost_expires_at as string | null) ?? null,
    created_at: String(row.created_at ?? ''),
    seller: (row.profiles as Profile | null) ?? null,
  })) as Product[]
}

export function StoreBio() {
  const { storeSlug } = useParams<{ storeSlug: string }>()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState<StoreBioThemeSettings>(() => readCachedPlatformSettings()?.storeBioTheme ?? DEFAULT_PLATFORM_SETTINGS.storeBioTheme)

  useEffect(() => {
    if (!storeSlug) return

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const [sellerProfile, settings] = await Promise.all([
          getProfileBySlug(storeSlug!),
          loadPlatformSettings({ force: true }),
        ])
        if (!sellerProfile) {
          setError('Loja nao encontrada.')
          return
        }

        const sellerProducts = sellerProfile.role === 'user'
          ? await getAffiliateProducts(sellerProfile.id)
          : await getProducts({ sellerId: sellerProfile.id })
        setProfile(sellerProfile)
        setProducts(sellerProducts)
        setTheme(settings.storeBioTheme)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar a loja.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [storeSlug])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: theme.pageBackground }}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: theme.loaderColor, borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center" style={{ backgroundColor: theme.pageBackground }}>
        <Package className="mb-4 h-16 w-16 opacity-50" style={{ color: theme.footerText }} />
        <h1 className="mb-2 text-2xl font-bold" style={{ color: theme.errorTitleText }}>Loja nao encontrada</h1>
        <p className="mb-6 max-w-sm" style={{ color: theme.errorBodyText }}>{error || 'Este link bio nao esta disponivel no momento.'}</p>
        <Link to="/" className="rounded-full px-6 py-3 font-semibold transition-opacity hover:opacity-90" style={{ backgroundColor: theme.errorButtonBackground, color: theme.errorButtonText }}>
          Ir para Cookie Market
        </Link>
      </div>
    )
  }

  const isAffiliateBio = profile.role === 'user'
  const storeName = profile.store_name || profile.full_name || 'Cookie Market'
  const bioText = profile.store_bio || profile.seller_category || (isAffiliateBio ? 'Produtos recomendados por afiliado verificado.' : 'Produtos digitais selecionados para compra segura.')
  const enabledTools = toolLinks.filter((tool) => profile.store_bio_tools_json?.[tool.key])

  return (
    <div className="min-h-screen font-sans" style={{ background: theme.pageBackground }}>
      <main className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col px-5 py-8">
        <div className="mb-8 flex justify-center">
          <Link to="/" aria-label="Cookie Market">
            <PlatformLogo />
          </Link>
        </div>

        <section className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-4 h-28 w-28 rounded-full p-1 shadow-[0_14px_36px_rgba(31,19,15,0.16)]" style={{ backgroundColor: theme.avatarBorderColor }}>
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full" style={{ backgroundColor: theme.avatarBackground }}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={storeName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-4xl font-bold" style={{ color: theme.avatarFallbackText }}>{storeName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="absolute bottom-1 right-1 rounded-full p-1 shadow-sm" style={{ backgroundColor: theme.verifiedBadgeBackground }}>
              <CheckCircle2 className="h-6 w-6" style={{ color: theme.verifiedBadgeIcon }} />
            </div>
          </div>

          <h1 className="text-3xl font-black leading-tight" style={{ color: theme.storeNameText }}>{storeName}</h1>
          <p className="mt-2 max-w-sm text-sm leading-6" style={{ color: theme.bioText }}>{bioText}</p>

        </section>

        {enabledTools.length > 0 && (
          <section className="mb-5 flex flex-wrap justify-center gap-2">
            {enabledTools.map(({ key, label, href, Icon }) => (
              <Link
                key={key}
                to={`${href}?lbref=${profile.id}`}
                className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: theme.productCardBackground, borderColor: theme.productCardBorder, color: theme.productTitleText, boxShadow: `0 8px 20px ${theme.productCardShadow}` }}
              >
                <Icon size={17} color="currentColor" variant="Linear" />
                {label}
              </Link>
            ))}
          </section>
        )}

        <section className="w-full space-y-3">
          {products.length > 0 ? (
            products.map((product) => (
              <Link
                key={product.id}
                to={isAffiliateBio ? `/produto/${product.id}?ref=${profile.id}` : `/produto/${product.id}`}
                className="group flex min-h-[84px] w-full items-center gap-3 rounded-[22px] border p-3 text-left transition-all hover:-translate-y-0.5"
                style={{ backgroundColor: theme.productCardBackground, borderColor: theme.productCardBorder, boxShadow: `0 12px 34px ${theme.productCardShadow}` }}
              >
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl" style={{ backgroundColor: theme.productImageBackground }}>
                  <img src={product.image || '/favicon.svg'} alt={product.title} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-extrabold leading-5" style={{ color: theme.productTitleText }}>{product.title}</p>
                  <p className="mt-1 text-sm font-black" style={{ color: theme.productPriceText }}>{formatPrice(product.price)}</p>
                </div>
                <span
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5"
                  style={{ backgroundColor: theme.productButtonBackground, color: theme.productButtonText }}
                >
                  <ArrowRight2 size={22} color="currentColor" variant="Linear" />
                </span>
              </Link>
            ))
          ) : (
            <div className="rounded-[24px] border p-8 text-center shadow-[0_12px_34px_rgba(31,19,15,0.10)]" style={{ backgroundColor: theme.emptyCardBackground, borderColor: theme.emptyCardBorder }}>
              <p className="text-sm" style={{ color: theme.emptyText }}>
                {isAffiliateBio ? 'Este afiliado ainda nao possui produtos ativos no momento.' : 'Esta loja ainda nao possui produtos ativos no momento.'}
              </p>
            </div>
          )}
        </section>

        <div className="mt-auto pt-10 text-center">
          <Link to="/" className="text-xs font-bold uppercase tracking-[0.18em] opacity-80" style={{ color: theme.footerText }}>
            Cookie Market
          </Link>
        </div>
      </main>
    </div>
  )
}
