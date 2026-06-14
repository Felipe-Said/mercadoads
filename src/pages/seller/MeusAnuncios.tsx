import React, { useCallback, useEffect, useState } from 'react'
import { SellerLayout } from '../../components/layouts/SellerLayout'
import { Megaphone, PackageCheck, PlusCircle } from 'lucide-react'
import { Card } from '../../components/ui/card'
import { formatCurrency, getProducts, isProductBoosted, type Product } from '../../lib/data'
import { useAuth } from '../../contexts/AuthContext'
import { ProductForm } from '../../components/ProductForm'
import { supabase } from '../../lib/supabase'

type Tab = 'products' | 'boosted'

export function MeusAnuncios() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('products')

  const loadProducts = useCallback(async () => {
    if (!user) return
    const data = await getProducts({ sellerId: user.id, includeInactive: true })
    setProducts(data)
  }, [user])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadProducts().catch(console.error)
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [loadProducts])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja apagar este anúncio? Esta ação não pode ser desfeita.')) return
    
    if (!user) return
    const { error } = await supabase.from('products').delete().eq('id', id).eq('seller_id', user.id)
    if (error) {
      alert('Erro ao apagar produto: ' + error.message)
    } else {
      loadProducts()
    }
  }

  const boostedProducts = products.filter(isProductBoosted)

  return (
    <SellerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-light text-ml-dark">Meus Anuncios</h2>
          <button onClick={() => setShowForm((current) => !current)} className="flex items-center gap-2 bg-ml-blue text-white px-4 py-2 rounded-sm text-sm font-semibold hover:bg-ml-hover transition-colors shadow-sm">
            <PlusCircle className="w-4 h-4" /> {showForm ? 'Fechar' : 'Novo Anuncio'}
          </button>
        </div>

        {showForm && user && (
          <Card className="bg-white border-none shadow-sm rounded-md">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-medium text-ml-dark">Cadastrar novo anuncio</h3>
              <p className="text-sm text-gray-500 mt-1">Anuncios de vendedores entram como rascunho para moderacao.</p>
            </div>
            <div className="p-6">
              <ProductForm sellerId={user.id} defaultStatus="draft" onCreated={loadProducts} />
            </div>
          </Card>
        )}

        <Card className="bg-white border-none shadow-sm rounded-md p-1">
          <div className="grid gap-1 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-3 rounded-sm px-4 py-3 text-left transition-colors ${activeTab === 'products' ? 'bg-ml-blue/10 text-ml-blue' : 'text-gray-500 hover:bg-gray-50 hover:text-ml-dark'}`}
            >
              <PackageCheck className="h-5 w-5" />
              <span>
                <span className="block text-sm font-semibold">Produtos cadastrados</span>
                <span className="block text-xs opacity-75">{products.length} anuncio(s)</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('boosted')}
              className={`flex items-center gap-3 rounded-sm px-4 py-3 text-left transition-colors ${activeTab === 'boosted' ? 'bg-ml-blue/10 text-ml-blue' : 'text-gray-500 hover:bg-gray-50 hover:text-ml-dark'}`}
            >
              <Megaphone className="h-5 w-5" />
              <span>
                <span className="block text-sm font-semibold">Produtos impulsionados</span>
                <span className="block text-xs opacity-75">{boostedProducts.length} ativo(s)</span>
              </span>
            </button>
          </div>
        </Card>

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Produto</th>
                  <th className="px-6 py-4 font-medium">Preco</th>
                  <th className="px-6 py-4 font-medium">Estoque</th>
                  <th className="px-6 py-4 font-medium">Vendas</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  {activeTab === 'boosted' && <th className="px-6 py-4 font-medium">Impulsionamento</th>}
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(activeTab === 'products' ? products : boostedProducts).map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-ml-dark">{product.title}</td>
                    <td className="px-6 py-4">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4">{product.stock ?? 0} unidades</td>
                    <td className="px-6 py-4">{product.sales_count}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-sm px-2 py-1 text-xs font-semibold ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {product.status}
                      </span>
                    </td>
                    {activeTab === 'boosted' && (
                      <td className="px-6 py-4">
                        <p className="font-semibold text-green-600">Ativo</p>
                        <p className="text-xs text-gray-500">
                          {product.boost_expires_at ? `Ate ${new Intl.DateTimeFormat('pt-BR').format(new Date(product.boost_expires_at))}` : 'Sem data final'}
                        </p>
                      </td>
                    )}
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors">
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
                {(activeTab === 'products' ? products : boostedProducts).length === 0 && (
                  <tr>
                    <td className="px-6 py-8 text-center text-gray-500" colSpan={activeTab === 'boosted' ? 7 : 6}>
                      {activeTab === 'products' ? 'Nenhum anuncio cadastrado.' : 'Nenhum produto impulsionado no momento.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </SellerLayout>
  )
}
