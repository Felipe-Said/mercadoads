import React from 'react'
import { SellerLayout } from '../../components/layouts/SellerLayout'
import { Card } from '../../components/ui/card'

export function VendasEntregas() {
  return (
    <SellerLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark mb-4">Vendas e Entregas</h2>

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Data</th>
                  <th className="px-6 py-4 font-medium">Comprador</th>
                  <th className="px-6 py-4 font-medium">Produto</th>
                  <th className="px-6 py-4 font-medium">Status de Entrega</th>
                  <th className="px-6 py-4 font-medium text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-500">Hoje, 14:30</td>
                  <td className="px-6 py-4 font-medium text-ml-dark">João Silva</td>
                  <td className="px-6 py-4">BM Infinita Facebook Ads</td>
                  <td className="px-6 py-4"><span className="text-green-500 font-medium">Entregue via API</span></td>
                  <td className="px-6 py-4 text-right">R$ 349,90</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-500">Ontem, 09:15</td>
                  <td className="px-6 py-4 font-medium text-ml-dark">Maria Antonieta</td>
                  <td className="px-6 py-4">Perfil Aquecido Facebook BR</td>
                  <td className="px-6 py-4"><span className="text-green-500 font-medium">Entregue via API</span></td>
                  <td className="px-6 py-4 text-right">R$ 89,90</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </SellerLayout>
  )
}
