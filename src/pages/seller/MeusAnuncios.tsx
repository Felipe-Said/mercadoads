import React from 'react'
import { SellerLayout } from '../../components/layouts/SellerLayout'
import { PlusCircle } from 'lucide-react'
import { Card } from '../../components/ui/card'

export function MeusAnuncios() {
  return (
    <SellerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-light text-ml-dark">Meus Anúncios</h2>
          <button className="flex items-center gap-2 bg-ml-blue text-white px-4 py-2 rounded-sm text-sm font-semibold hover:bg-ml-hover transition-colors shadow-sm">
            <PlusCircle className="w-4 h-4" /> Novo Anúncio
          </button>
        </div>

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Produto</th>
                  <th className="px-6 py-4 font-medium">Preço</th>
                  <th className="px-6 py-4 font-medium">Estoque</th>
                  <th className="px-6 py-4 font-medium">Vendas</th>
                  <th className="px-6 py-4 font-medium text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-ml-dark">BM Infinita Facebook Ads</td>
                  <td className="px-6 py-4">R$ 349,90</td>
                  <td className="px-6 py-4 text-green-500 font-medium">Ilimitado</td>
                  <td className="px-6 py-4">84</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-ml-blue hover:underline font-medium">Editar</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-ml-dark">Perfil Aquecido Facebook BR</td>
                  <td className="px-6 py-4">R$ 89,90</td>
                  <td className="px-6 py-4">42 unidades</td>
                  <td className="px-6 py-4">31</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-ml-blue hover:underline font-medium">Editar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </SellerLayout>
  )
}
