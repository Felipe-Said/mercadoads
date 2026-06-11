import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Clock3, CreditCard, PackageCheck, Search, ShieldCheck, Sparkles, Star, Truck } from 'lucide-react'
import { BannerSlot, Banners } from '../components/Banners'
import { ProductGrid } from '../components/ProductCard'
import { Stories } from '../components/Stories'
import { getProducts, type Product, formatCurrency } from '../lib/data'

const departments = [
  'Contas de anuncios',
  'BM e perfis',
  'Google Ads',
  'Meta Ads',
  'TikTok Ads',
  'Proxies',
  'Criativos',
  'Ferramentas',
  'Network',
]

function ProductTile({ product }: { product: Product }) {
  return (
    <Link to={`/produto/${product.id}`} className="group block rounded-sm border border-gray-200 bg-white p-3 transition hover:border-[#ff9900] hover:shadow-md">
      <div className="flex gap-3">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-gray-50">
          {product.image ? (
            <img src={product.image} alt={product.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
          ) : (
            <PackageCheck className="h-9 w-9 text-gray-300" />
          )}
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-[#111827] group-hover:text-[#007185]">{product.title}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-[#ffa41c]">
            <Star className="h-3.5 w-3.5 fill-current" />
            <Star className="h-3.5 w-3.5 fill-current" />
            <Star className="h-3.5 w-3.5 fill-current" />
            <Star className="h-3.5 w-3.5 fill-current" />
            <Star className="h-3.5 w-3.5 fill-current" />
          </div>
          <p className="mt-2 text-lg font-bold text-[#b12704]">{formatCurrency(product.price || 0)}</p>
          <p className="mt-1 text-xs font-semibold text-[#007600]">Entrega digital pela plataforma</p>
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
      <p className="mt-2 line-clamp-2 text-xs font-semibold leading-snug text-[#111827] group-hover:text-[#007185]">{product.title}</p>
      <p className="mt-1 text-sm font-bold text-[#b12704]">{formatCurrency(product.price || 0)}</p>
    </Link>
  )
}

function DenseShelf({ title, products, linkText = 'Ver tudo' }: { title: string; products: Product[]; linkText?: string }) {
  return (
    <section className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold tracking-tight text-[#111827]">{title}</h2>
        <Link to="/ofertas" className="shrink-0 text-xs font-semibold text-[#007185] hover:text-[#c7511f]">{linkText}</Link>
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
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

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
  const dealProducts = products.slice(0, 4)
  const newest = products.slice(4, 8)
  const digital = products.slice(8, 12)
  const categories = useMemo(() => Array.from(new Set(products.map((item) => item.category).filter(Boolean))).slice(0, 8) as string[], [products])

  return (
    <div className="min-h-screen bg-[#e3e6e6] pb-12 font-sans text-[#111827]">
      <section className="bg-[#232f3e] text-white">
        <div className="mx-auto grid max-w-[1440px] gap-4 px-4 py-4 lg:grid-cols-[240px_minmax(0,1fr)_280px]">
          <aside className="hidden rounded-sm bg-white text-[#111827] shadow-sm lg:block">
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="text-sm font-bold">Departamentos</p>
              <p className="text-xs text-gray-500">Cookie market</p>
            </div>
            <nav className="py-2">
              {departments.map((department) => (
                <Link key={department} to={`/category/${encodeURIComponent(department.toLowerCase())}`} className="flex items-center justify-between px-4 py-2 text-sm font-medium hover:bg-[#f3f4f6] hover:text-[#007185]">
                  {department}
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                </Link>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 space-y-3">
            <Banners position="home_hero" />
            <Stories />
          </div>

          <aside className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <BannerSlot position="home_side_top" className="h-40 lg:h-[205px]" compact fallbackTitle="Banner lateral superior" />
            <BannerSlot position="home_side_bottom" className="h-40 lg:-mt-3 lg:h-[205px]" compact fallbackTitle="Banner lateral inferior" />
          </aside>
        </div>
      </section>

      <main className="mx-auto -mt-1 max-w-[1440px] px-4">
        <section className="grid gap-4 py-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <DenseShelf title="Mais procurados agora" products={dealProducts} />
            <DenseShelf title="Novidades da loja" products={newest.length ? newest : dealProducts} />
            <DenseShelf title="Entrega digital rapida" products={digital.length ? digital : dealProducts} />
          </div>

          <aside className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">Comprar com seguranca</h2>
              <ShieldCheck className="h-5 w-5 text-[#007600]" />
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-[#007185]" />
                <p><strong>Pix integrado:</strong> finalize pedidos com codigo Pix e QR Code.</p>
              </div>
              <div className="flex gap-3">
                <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#007185]" />
                <p><strong>24 horas para reclamar:</strong> o saldo so libera depois do prazo.</p>
              </div>
              <div className="flex gap-3">
                <Truck className="mt-0.5 h-5 w-5 shrink-0 text-[#007185]" />
                <p><strong>Entrega digital:</strong> acompanhe tudo em Minhas Compras.</p>
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <BannerSlot position="home_deals_top" className="h-40 md:h-56" fallbackTitle="Banner de ofertas" />
          <BannerSlot position="home_deals_bottom" className="h-40 md:h-56" fallbackTitle="Banner de categoria" />
        </section>

        <section className="mt-4 rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Ofertas em destaque</h2>
              <p className="text-sm text-gray-500">Produtos reais ativos no Supabase, organizados em vitrine densa.</p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-10 w-full rounded-sm border border-gray-300 pl-9 pr-3 text-sm outline-none focus:border-[#ff9900] focus:ring-2 focus:ring-[#ff9900]/20"
                placeholder="Buscar nesta vitrine"
              />
            </div>
          </div>

          {loading && <div className="h-40 animate-pulse rounded-sm bg-gray-100" />}
          {!loading && featured.length === 0 && (
            <div className="rounded-sm border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
              Nenhum produto ativo cadastrado no Supabase.
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

        <section className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <BannerSlot position="home_grid_1" className="h-44" compact fallbackTitle="Slot 1" />
          <BannerSlot position="home_grid_2" className="h-44" compact fallbackTitle="Slot 2" />
          <BannerSlot position="home_grid_3" className="h-44" compact fallbackTitle="Slot 3" />
          <BannerSlot position="home_grid_4" className="h-44" compact fallbackTitle="Slot 4" />
        </section>

        <div className="mt-4">
          <ProductGrid title="Ofertas do dia" linkText="Abrir ofertas" linkUrl="/ofertas" />
        </div>

        <section className="mt-4 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#ff9900]" />
              <h2 className="text-lg font-bold">Categorias populares</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {(categories.length ? categories : departments.slice(0, 7)).map((category) => (
                <Link key={category} to={`/category/${encodeURIComponent(category.toLowerCase())}`} className="rounded-sm border border-gray-200 px-3 py-2 text-xs font-semibold text-[#007185] hover:border-[#ff9900] hover:text-[#c7511f]">
                  {category}
                </Link>
              ))}
            </div>
          </aside>
          <BannerSlot position="home_middle" className="h-52" fallbackTitle="Banner horizontal central" />
        </section>

        <div className="mt-4">
          <ProductGrid title="Mais vendidos da semana" linkText="Ver todos" shuffle />
        </div>

        <div className="mt-4">
          <BannerSlot position="home_bottom" className="h-48 md:h-64" fallbackTitle="Banner inferior da home" />
        </div>

        <div className="mt-4 mb-12">
          <ProductGrid title="Recomendados para voce" linkText="Descobrir mais" shuffle />
        </div>
      </main>
    </div>
  )
}
