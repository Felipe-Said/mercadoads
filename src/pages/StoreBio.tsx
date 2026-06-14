import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Package } from 'lucide-react'
import { PlatformLogo } from '../components/PlatformLogo'
import { getProducts, getProfileBySlug, type Product, type Profile } from '../lib/data'
import { DEFAULT_PLATFORM_SETTINGS, loadPlatformSettings, readCachedPlatformSettings, type StoreBioThemeSettings } from '../lib/platformSettings'

function formatPrice(price: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)
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

        const sellerProducts = await getProducts({ sellerId: sellerProfile.id })
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

  const storeName = profile.store_name || profile.full_name || 'Cookie Market'
  const bioText = profile.store_bio || profile.seller_category || 'Produtos digitais selecionados para compra segura.'

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

          <div className="mt-4 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] shadow-sm" style={{ backgroundColor: theme.countBadgeBackground, borderColor: theme.countBadgeBorder, color: theme.countBadgeText }}>
            {products.length} produtos ativos
          </div>
        </section>

        <section className="w-full space-y-3">
          {products.length > 0 ? (
            products.map((product) => (
              <Link
                key={product.id}
                to={`/produto/${product.id}`}
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
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Link>
            ))
          ) : (
            <div className="rounded-[24px] border p-8 text-center shadow-[0_12px_34px_rgba(31,19,15,0.10)]" style={{ backgroundColor: theme.emptyCardBackground, borderColor: theme.emptyCardBorder }}>
              <p className="text-sm" style={{ color: theme.emptyText }}>Esta loja ainda nao possui produtos ativos no momento.</p>
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
