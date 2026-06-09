import React from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card } from '../../components/ui/card'

export function Usuarios() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark mb-4">Gerenciamento de Usuários</h2>

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Nome</th>
                  <th className="px-6 py-4 font-medium">E-mail</th>
                  <th className="px-6 py-4 font-medium">Tipo</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-ml-dark">Maria Antonieta</td>
                  <td className="px-6 py-4 text-gray-500">maria@email.com</td>
                  <td className="px-6 py-4">Comprador</td>
                  <td className="px-6 py-4"><span className="text-green-500 font-medium">Ativo</span></td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-ml-blue hover:underline">Editar</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-ml-dark">Agência XYZ</td>
                  <td className="px-6 py-4 text-gray-500">contato@xyz.com</td>
                  <td className="px-6 py-4">Vendedor</td>
                  <td className="px-6 py-4"><span className="text-green-500 font-medium">Ativo</span></td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-ml-blue hover:underline">Editar</button>
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
