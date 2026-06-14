import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Package } from 'lucide-react'
import { PlatformLogo } from '../components/PlatformLogo'
import { getProducts, getProfileBySlug, type Product, type Profile } from '../lib/data'

function formatPrice(price: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)
}

export function StoreBio() {
  const { storeSlug } = useParams<{ storeSlug: string }>()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!storeSlug) return

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const sellerProfile = await getProfileBySlug(storeSlug!)
        if (!sellerProfile) {
          setError('Loja nao encontrada.')
          return
        }

        const sellerProducts = await getProducts({ sellerId: sellerProfile.id })
        setProfile(sellerProfile)
        setProducts(sellerProducts)
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
      <div className="flex min-h-screen items-center justify-center bg-[#f7f1ed]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3b1f18] border-t-transparent" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f7f1ed] p-4 text-center">
        <Package className="mb-4 h-16 w-16 text-[#8a4f3f]/40" />
        <h1 className="mb-2 text-2xl font-bold text-[#1f130f]">Loja nao encontrada</h1>
        <p className="mb-6 max-w-sm text-[#6b5a54]">{error || 'Este link bio nao esta disponivel no momento.'}</p>
        <Link to="/" className="rounded-full bg-[#3b1f18] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#5a2f25]">
          Ir para Cookie Market
        </Link>
      </div>
    )
  }

  const storeName = profile.store_name || profile.full_name || 'Cookie Market'
  const bioText = profile.store_bio || profile.seller_category || 'Produtos digitais selecionados para compra segura.'
  const pageBackground = profile.store_bio_background_color || '#f7f1ed'
  const buttonColor = profile.store_bio_button_color || '#3b1f18'
  const buttonTextColor = profile.store_bio_button_text_color || '#ffffff'

  return (
    <div className="min-h-screen font-sans" style={{ background: pageBackground }}>
      <main className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col px-5 py-8">
        <div className="mb-8 flex justify-center">
          <Link to="/" aria-label="Cookie Market">
            <PlatformLogo />
          </Link>
        </div>

        <section className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-4 h-28 w-28 rounded-full bg-white p-1 shadow-[0_14px_36px_rgba(31,19,15,0.16)]">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#f0e8e2]">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={storeName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-[#8a4f3f]">{storeName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="absolute bottom-1 right-1 rounded-full bg-white p-1 shadow-sm">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>

          <h1 className="text-3xl font-black leading-tight text-[#1f130f]">{storeName}</h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-[#6b5a54]">{bioText}</p>

          <div className="mt-4 rounded-full border border-white/70 bg-white/70 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#7a4638] shadow-sm">
            {products.length} produtos ativos
          </div>
        </section>

        <section className="w-full space-y-3">
          {products.length > 0 ? (
            products.map((product) => (
              <Link
                key={product.id}
                to={`/produto/${product.id}`}
                className="group flex min-h-[84px] w-full items-center gap-3 rounded-[22px] border border-white/80 bg-white/90 p-3 text-left shadow-[0_12px_34px_rgba(31,19,15,0.10)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(31,19,15,0.16)]"
              >
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-[#f0e8e2]">
                  <img src={product.image || '/favicon.svg'} alt={product.title} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-extrabold leading-5 text-[#1f130f]">{product.title}</p>
                  <p className="mt-1 text-sm font-black text-green-700">{formatPrice(product.price)}</p>
                </div>
                <span
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5"
                  style={{ backgroundColor: buttonColor, color: buttonTextColor }}
                >
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Link>
            ))
          ) : (
            <div className="rounded-[24px] border border-white/80 bg-white/85 p-8 text-center shadow-[0_12px_34px_rgba(31,19,15,0.10)]">
              <p className="text-sm text-[#6b5a54]">Esta loja ainda nao possui produtos ativos no momento.</p>
            </div>
          )}
        </section>

        <div className="mt-auto pt-10 text-center">
          <Link to="/" className="text-xs font-bold uppercase tracking-[0.18em] text-[#7a4638]/70">
            Cookie Market
          </Link>
        </div>
      </main>
    </div>
  )
}
