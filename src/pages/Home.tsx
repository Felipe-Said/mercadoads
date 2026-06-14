import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Clock3, CreditCard, PackageCheck, Search, ShieldCheck, Sparkles, Star, Truck } from 'lucide-react'
import { BannerSlot, Banners } from '../components/Banners'
import { ProductGrid } from '../components/ProductCard'
import { Stories } from '../components/Stories'
import { getPopularProducts, getProducts, recordProductSearch, type Product, formatCurrency } from '../lib/data'
import { useAuth } from '../contexts/AuthContext'
import { DEFAULT_PLATFORM_SETTINGS, loadPlatformSettings, readCachedPlatformSettings, type HomeSectionSettings } from '../lib/platformSettings'

const departments = [
  { label: 'Contas de anuncios', href: '/category/contas%20de%20anuncios' },
  { label: 'BM e perfis', href: '/category/bm%20e%20perfis' },
  { label: 'Google Ads', href: '/category/google%20ads' },
  { label: 'Meta Ads', href: '/category/meta%20ads' },
  { label: 'TikTok Ads', href: '/category/tiktok%20ads' },
  { label: 'Proxies', href: '/proxy' },
  { label: 'Ferramentas', href: '/ferramentas' },
  { label: 'Network', href: '/groups' },
]

function ProductTile({ product }: { product: Product }) {
  return (
    <Link to={`/produto/${product.id}`} className="group block rounded-sm border border-gray-200 bg-white p-3 transition hover:border-[var(--layout-accent-color)] hover:shadow-md">
      <div className="flex gap-3">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-gray-50">
          {product.image ? (
            <img src={product.image} alt={product.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
          ) : (
            <PackageCheck className="h-9 w-9 text-gray-300" />
          )}
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-[var(--layout-text-primary)] group-hover:text-[var(--layout-link-color)]">{product.title}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-[var(--layout-rating-color)]">
            <Star className="h-3.5 w-3.5 fill-current" />
            <Star className="h-3.5 w-3.5 fill-current" />
            <Star className="h-3.5 w-3.5 fill-current" />
            <Star className="h-3.5 w-3.5 fill-current" />
            <Star className="h-3.5 w-3.5 fill-current" />
          </div>
          <p className="mt-2 text-lg font-bold text-[var(--layout-price-color)]">{formatCurrency(product.price || 0)}</p>
          <p className="mt-1 text-xs font-semibold text-[var(--layout-success-color)]">Entrega digital pela plataforma</p>
        </div>
      </div>
    </Link>
  )
}

function MiniProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/produto/${product.id}`} className="group block min-w-0">
      <div className="aspect-square overflow-hidden rounded-sm bg-gray-50">
        {product.image ? (
          <img src={product.image} alt={product.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <PackageCheck className="h-10 w-10" />
          </div>
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-xs font-semibold leading-snug text-[var(--layout-text-primary)] group-hover:text-[var(--layout-link-color)]">{product.title}</p>
      <p className="mt-1 text-sm font-bold text-[var(--layout-price-color)]">{formatCurrency(product.price || 0)}</p>
    </Link>
  )
}

function DenseShelf({ title, products, linkText = 'Ver tudo' }: { title: string; products: Product[]; linkText?: string }) {
  return (
    <section className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold tracking-tight text-[var(--layout-text-primary)]">{title}</h2>
        <Link to="/ofertas" className="shrink-0 text-xs font-semibold text-[var(--layout-link-color)] hover:text-[var(--layout-link-hover-color)]">{linkText}</Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {products.slice(0, 4).map((product) => (
          <MiniProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

export function Home() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [popularProducts, setPopularProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [homeSections, setHomeSections] = useState<HomeSectionSettings>(() => readCachedPlatformSettings()?.homeSections ?? DEFAULT_PLATFORM_SETTINGS.homeSections)
  const [loading, setLoading] = useState(true)
  const lastTrackedSearch = useRef('')

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let mounted = true
    const loadSections = async () => {
      const settings = await loadPlatformSettings({ force: true })
      if (mounted) setHomeSections(settings.homeSections)
    }
    loadSections().catch(console.error)

    const handleSettingsUpdated = () => {
      loadSections().catch(console.error)
    }

    window.addEventListener('platform-settings-updated', handleSettingsUpdated)
    return () => {
      mounted = false
      window.removeEventListener('platform-settings-updated', handleSettingsUpdated)
    }
  }, [])

  useEffect(() => {
    if (!products.length) {
      setPopularProducts([])
      return
    }

    getPopularProducts(products)
      .then(setPopularProducts)
      .catch((error) => {
        console.error(error)
        setPopularProducts(products.slice(0, 4))
      })
  }, [products])

  useEffect(() => {
    const query = searchQuery.trim()
    if (query.length < 2 || query.toLowerCase() === lastTrackedSearch.current) return

    const timeoutId = window.setTimeout(() => {
      lastTrackedSearch.current = query.toLowerCase()
      recordProductSearch(query, products, user?.id).catch(console.error)
    }, 700)

    return () => window.clearTimeout(timeoutId)
  }, [products, searchQuery, user?.id])

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return products
    return products.filter((product) => {
      const title = product.title.toLowerCase()
      const category = product.category?.toLowerCase() ?? ''
      const seller = product.seller?.store_name?.toLowerCase() ?? product.seller?.full_name?.toLowerCase() ?? ''
      return title.includes(query) || category.includes(query) || seller.includes(query)
    })
  }, [products, searchQuery])

  const featured = filteredProducts.slice(0, 6)
  const mostWanted = (popularProducts.length ? popularProducts : products).slice(0, 4)
  const newest = [...products]
    .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
    .slice(0, 4)
  const officialProducts = products
    .filter((product) => product.seller?.role === 'admin')
    .slice(0, 4)
  const categories = useMemo(() => Array.from(new Set(products.map((item) => item.category).filter(Boolean))).slice(0, 8) as string[], [products])
  const showDealsRow = homeSections.homeDealsTop || homeSections.homeDealsBottom
  const showGridRow = homeSections.homeGrid1 || homeSections.homeGrid2 || homeSections.homeGrid3 || homeSections.homeGrid4
  const showMiddleRow = homeSections.homePopularCategories || homeSections.homeMiddle

  return (
    <div className="min-h-screen bg-[var(--layout-page-background)] pb-12 font-sans text-[var(--layout-text-primary)]">
      <section className="bg-[var(--layout-dashboard-sidebar-header-bg)] text-white">
        <div className="mx-auto grid max-w-[1440px] gap-4 px-4 py-4 lg:grid-cols-[240px_minmax(0,1fr)_280px]">
          <aside className="hidden rounded-sm border bg-[var(--layout-home-departments-bg)] text-[var(--layout-home-departments-text)] shadow-sm lg:block" style={{ borderColor: 'var(--layout-home-departments-border)' }}>
            <div className="border-b px-4 py-3" style={{ borderColor: 'var(--layout-home-departments-border)' }}>
              <p className="text-sm font-bold">Departamentos</p>
              <p className="text-xs text-[var(--layout-home-departments-muted-text)]">Cookie market</p>
            </div>
            <nav className="py-2">
              {departments.map((department) => (
                <Link key={department.label} to={department.href} className="flex items-center justify-between px-4 py-2 text-sm font-medium hover:bg-[var(--layout-home-departments-hover-bg)] hover:text-[var(--layout-home-departments-hover-text)]">
                  {department.label}
                  <ChevronRight className="h-3.5 w-3.5 text-[var(--layout-home-departments-icon)]" />
                </Link>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 space-y-3">
            <Banners position="home_hero" />
            <Stories />
          </div>

          <aside className="grid content-start gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <BannerSlot position="home_side_top" className="aspect-[16/9]" compact fallbackTitle="Banner lateral superior" />
            <BannerSlot position="home_side_middle" className="aspect-[16/9]" compact fallbackTitle="Banner lateral central" />
            <BannerSlot position="home_side_bottom" className="aspect-[16/9]" compact fallbackTitle="Banner lateral inferior" />
          </aside>
        </div>
      </section>

      <main className="mx-auto -mt-1 max-w-[1440px] px-4">
        <section className="grid gap-4 py-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <DenseShelf title="Mais procurados agora" products={mostWanted} />
            <DenseShelf title="Novidades da loja" products={newest} />
            <DenseShelf title="Produtos oficiais" products={officialProducts.length ? officialProducts : newest} />
          </div>

          <aside className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">Comprar com seguranca</h2>
              <ShieldCheck className="h-5 w-5 text-[var(--layout-success-color)]" />
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-[var(--layout-link-color)]" />
                <p><strong>Pix integrado:</strong> finalize pedidos com codigo Pix e QR Code.</p>
              </div>
              <div className="flex gap-3">
                <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--layout-link-color)]" />
                <p><strong>24 horas para reclamar:</strong> o saldo so libera depois do prazo.</p>
              </div>
              <div className="flex gap-3">
                <Truck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--layout-link-color)]" />
                <p><strong>Entrega digital:</strong> acompanhe tudo em Minhas Compras.</p>
              </div>
            </div>
          </aside>
        </section>

        {showDealsRow && (
          <section className={`grid gap-4 ${homeSections.homeDealsTop && homeSections.homeDealsBottom ? 'md:grid-cols-[1.2fr_0.8fr]' : ''}`}>
            {homeSections.homeDealsTop && <BannerSlot position="home_deals_top" className="h-40 md:h-56" fallbackTitle="Banner de ofertas" />}
            {homeSections.homeDealsBottom && <BannerSlot position="home_deals_bottom" className="h-40 md:h-56" fallbackTitle="Banner de categoria" />}
          </section>
        )}

        <section className="mt-4 rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Ofertas em destaque</h2>
              <p className="text-sm text-gray-500">Produtos ativos organizados em vitrine densa.</p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-10 w-full rounded-sm border border-gray-300 pl-9 pr-3 text-sm outline-none focus:border-[var(--layout-accent-color)]"
                placeholder="Buscar nesta vitrine"
              />
            </div>
          </div>

          {loading && <div className="h-40 animate-pulse rounded-sm bg-gray-100" />}
          {!loading && featured.length === 0 && (
            <div className="rounded-sm border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
              Nenhum produto ativo cadastrado.
            </div>
          )}
          {!loading && featured.length > 0 && (
            <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
              {featured.map((product) => (
                <ProductTile key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {showGridRow && (
          <section className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {homeSections.homeGrid1 && <BannerSlot position="home_grid_1" className="h-44" compact fallbackTitle="Slot 1" />}
            {homeSections.homeGrid2 && <BannerSlot position="home_grid_2" className="h-44" compact fallbackTitle="Slot 2" />}
            {homeSections.homeGrid3 && <BannerSlot position="home_grid_3" className="h-44" compact fallbackTitle="Slot 3" />}
            {homeSections.homeGrid4 && <BannerSlot position="home_grid_4" className="h-44" compact fallbackTitle="Slot 4" />}
          </section>
        )}

        <div className="mt-4">
          <ProductGrid title="Ofertas do dia" linkText="Abrir ofertas" linkUrl="/ofertas" />
        </div>

        {showMiddleRow && (
          <section className={`mt-4 grid gap-4 ${homeSections.homePopularCategories && homeSections.homeMiddle ? 'lg:grid-cols-[280px_minmax(0,1fr)]' : ''}`}>
            {homeSections.homePopularCategories && (
              <aside className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[var(--layout-accent-color)]" />
                  <h2 className="text-lg font-bold">Categorias populares</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(categories.length ? categories : departments.slice(0, 7).map((department) => department.label)).map((category) => (
                    <Link key={category} to={`/category/${encodeURIComponent(category.toLowerCase())}`} className="rounded-sm border border-gray-200 px-3 py-2 text-xs font-semibold text-[var(--layout-link-color)] hover:border-[var(--layout-accent-color)] hover:text-[var(--layout-link-hover-color)]">
                      {category}
                    </Link>
                  ))}
                </div>
              </aside>
            )}
            {homeSections.homeMiddle && <BannerSlot position="home_middle" className="h-52" fallbackTitle="Banner horizontal central" />}
          </section>
        )}

        <div className="mt-4">
          <ProductGrid title="Mais vendidos da semana" linkText="Ver todos" shuffle />
        </div>

        {homeSections.homeBottom && (
          <div className="mt-4">
            <BannerSlot position="home_bottom" className="h-48 md:h-64" fallbackTitle="Banner inferior da home" />
          </div>
        )}

        <div className="mt-4 mb-12">
          <ProductGrid title="Recomendados para voce" linkText="Descobrir mais" shuffle />
        </div>
      </main>
    </div>
  )
}
