import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, Package, MapPin, ExternalLink } from 'lucide-react'
import { getProfileBySlug, getProducts, type Profile, type Product } from '../lib/data'

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
        const sellerProfile = await getProfileBySlug(storeSlug!)
        if (!sellerProfile) {
          setError('Loja não encontrada.')
          return
        }

        setProfile(sellerProfile)
        const sellerProducts = await getProducts({ sellerId: sellerProfile.id })
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
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-ml-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Ops!</h1>
        <p className="text-gray-500 mb-6">{error || 'Loja não encontrada.'}</p>
        <Link to="/" className="bg-ml-blue text-white px-6 py-2 rounded-full font-semibold hover:bg-ml-hover transition-colors">
          Voltar para a página inicial
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-16">
      {/* Header Minimalista */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-xl text-ml-dark tracking-tight">COOKIE<span className="text-ml-blue">MARKET</span></span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-10">
        {/* Perfil do Vendedor */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-28 h-28 bg-white rounded-full p-1 shadow-md mb-4 relative">
            <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.store_name || profile.full_name || 'Vendedor'} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-gray-400">
                  {(profile.store_name || profile.full_name || 'L').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {/* Badge de Verificado */}
            <div className="absolute bottom-1 right-1 bg-white rounded-full p-0.5 shadow-sm">
              <CheckCircle2 className="w-6 h-6 text-green-500 fill-white" />
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-ml-dark tracking-tight">
            {profile.store_name || profile.full_name}
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1 flex items-center gap-1">
            <MapPin className="w-4 h-4" /> Vendedor na Cookie Market
          </p>
          
          <div className="mt-4 px-4 py-1.5 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full border border-green-200">
            {products.length} Anúncios Ativos
          </div>
        </div>

        {/* Vitrine de Produtos - Estilo Linktree */}
        <div className="space-y-3 w-full max-w-md mx-auto">
          {products.length > 0 ? (
            products.map((product) => (
              <Link 
                key={product.id} 
                to={`/produto/${product.id}`}
                className="group flex items-center justify-between p-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1 w-full"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={product.image || '/favicon.svg'} alt={product.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col overflow-hidden text-left">
                    <span className="font-semibold text-ml-dark text-sm line-clamp-1 group-hover:text-ml-blue transition-colors">{product.title}</span>
                    <span className="text-green-600 font-bold text-sm">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                    </span>
                  </div>
                </div>
                <div className="px-3 flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-ml-blue/10 transition-colors">
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-ml-blue" />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="bg-white p-8 rounded-2xl text-center shadow-sm border border-gray-100">
              <p className="text-gray-500">Esta loja ainda não possui anúncios ativos no momento.</p>
            </div>
          )}
        </div>

        {/* Footer Minimalista */}
        <div className="mt-16 text-center pb-8">
          <p className="text-xs text-gray-400 font-medium">Powered by Cookie Market</p>
        </div>
      </main>
    </div>
  )
}
