import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Search, Plus, Filter } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency, type Product } from '../../lib/data'

export function MeusAnunciosAdmin() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setProducts(data as Product[])
        }
      })
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-light text-ml-dark">Meus Anúncios (Admin)</h2>
          <Button className="bg-ml-blue hover:bg-ml-hover text-white font-semibold rounded-sm shadow-sm transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Novo Anúncio
          </Button>
        </div>

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/50">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar por título ou ID..." 
                className="w-full h-10 pl-9 pr-4 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-ml-blue text-sm"
              />
            </div>
            <Button variant="outline" className="border-gray-200 text-gray-600 rounded-sm hover:bg-gray-100 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filtrar
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Produto</th>
                  <th className="px-6 py-4 font-medium">Preço</th>
                  <th className="px-6 py-4 font-medium">Estoque</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-sm overflow-hidden flex-shrink-0">
                          <img src={product.image_url || 'https://via.placeholder.com/150'} alt="Produto" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-ml-dark line-clamp-1">{product.title}</p>
                          <p className="text-xs text-gray-500">ID: #{product.id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-ml-dark font-medium">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4 text-gray-600">Ilimitado</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-sm text-xs font-semibold ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {product.status === 'active' ? 'Ativo' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-ml-blue hover:text-ml-hover font-medium text-sm transition-colors">
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td className="px-6 py-8 text-center text-gray-500" colSpan={5}>Nenhum produto cadastrado.</td>
                  </tr>
                )}
                
                {/* Note about auto-approval */}
                <tr className="bg-blue-50/50 border-l-4 border-ml-blue">
                  <td colSpan={5} className="px-6 py-4 text-sm text-ml-blue">
                    <strong>Nota do Sistema:</strong> Como Administrador, seus anúncios pulam a fase de Moderação e entram "Ativos" imediatamente após a criação.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}
