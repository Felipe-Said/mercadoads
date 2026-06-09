import React from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { CheckCircle, XCircle } from 'lucide-react'
import { Card } from '../../components/ui/card'

export function Moderacao() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-light text-ml-dark">Fila de Moderação</h2>
          <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-sm">2 pendentes</span>
        </div>

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Vendedor</th>
                  <th className="px-6 py-4 font-medium">Ativo (Título)</th>
                  <th className="px-6 py-4 font-medium">Preço</th>
                  <th className="px-6 py-4 font-medium">Data</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-ml-dark">Agência XYZ</td>
                  <td className="px-6 py-4">BM Verificada Cnpj + 3 Perfis</td>
                  <td className="px-6 py-4">R$ 890,00</td>
                  <td className="px-6 py-4 text-gray-500">Há 2 horas</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button className="flex items-center gap-1 text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-sm transition-colors">
                      <CheckCircle className="w-4 h-4" /> Aprovar
                    </button>
                    <button className="flex items-center gap-1 text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-sm transition-colors">
                      <XCircle className="w-4 h-4" /> Rejeitar
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-ml-dark">DropKing BR</td>
                  <td className="px-6 py-4">Conta Google Ads Gasta ($350)</td>
                  <td className="px-6 py-4">R$ 450,00</td>
                  <td className="px-6 py-4 text-gray-500">Há 5 horas</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button className="flex items-center gap-1 text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-sm transition-colors">
                      <CheckCircle className="w-4 h-4" /> Aprovar
                    </button>
                    <button className="flex items-center gap-1 text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-sm transition-colors">
                      <XCircle className="w-4 h-4" /> Rejeitar
                    </button>
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
