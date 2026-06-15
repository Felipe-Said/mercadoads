import React, { useEffect, useState } from 'react'
import { SellerLayout } from '../../components/layouts/SellerLayout'
import { Card } from '../../components/ui/card'
import { formatCurrency, formatDate, getSales, type Sale } from '../../lib/data'
import { useAuth } from '../../contexts/AuthContext'

export function VendasEntregas() {
  const { user } = useAuth()
  const [sales, setSales] = useState<Sale[]>([])

  useEffect(() => {
    if (!user) return
    getSales({ sellerId: user.id }).then(setSales).catch(console.error)
  }, [user])

  const getSaleTitle = (sale: Sale) => (
    sale.products?.title
      ?? sale.proxy_offers?.name
      ?? sale.virtual_number_service_name
      ?? sale.temp_email_service_name
      ?? (sale.smm_service_name ? `SMM - ${sale.smm_service_name}` : 'Ferramenta da plataforma')
  )

  const getSellerAmount = (sale: Sale) => (
    sale.affiliate_source === 'linkbio' && sale.affiliate_user_id === user?.id
      ? Number(sale.affiliate_commission_amount ?? 0)
      : sale.amount
  )

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
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-500">{formatDate(sale.created_at)}</td>
                    <td className="px-6 py-4 font-medium text-ml-dark">{sale.buyer?.full_name ?? 'Comprador'}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-ml-dark">{getSaleTitle(sale)}</div>
                      {sale.affiliate_source === 'linkbio' && sale.affiliate_user_id === user?.id && (
                        <span className="mt-1 inline-flex rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">comissão linkbio</span>
                      )}
                    </td>
                    <td className="px-6 py-4"><span className="text-green-500 font-medium">{sale.status}</span></td>
                    <td className="px-6 py-4 text-right">{formatCurrency(getSellerAmount(sale))}</td>
                  </tr>
                ))}
                {sales.length === 0 && (
                  <tr>
                    <td className="px-6 py-8 text-center text-gray-500" colSpan={5}>Nenhuma venda encontrada.</td>
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
