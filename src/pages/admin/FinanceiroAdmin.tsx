import React, { useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { DollarSign, CheckCircle2, Clock, Landmark, ArrowRightLeft } from 'lucide-react'

export function FinanceiroAdmin() {
  const [activeTab, setActiveTab] = useState<'saques' | 'vendas'>('saques');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark mb-4">Gestão Financeira</h2>

        <div className="flex gap-1 bg-white p-1 rounded-md shadow-sm w-max border border-gray-100">
          <button 
            onClick={() => setActiveTab('saques')}
            className={`px-6 py-2 text-sm font-medium rounded-sm transition-colors ${activeTab === 'saques' ? 'bg-ml-blue/10 text-ml-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Aprovação de Saques (Vendedores)
          </button>
          <button 
            onClick={() => setActiveTab('vendas')}
            className={`px-6 py-2 text-sm font-medium rounded-sm transition-colors ${activeTab === 'vendas' ? 'bg-ml-blue/10 text-ml-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Minhas Vendas & Saque (Admin)
          </button>
        </div>

        {activeTab === 'saques' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-white border-none shadow-sm rounded-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Saques Pendentes</p>
                      <h3 className="text-2xl font-light text-ml-dark">R$ 4.700,00</h3>
                    </div>
                    <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-500">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">Aguardando aprovação via Gateway (Cash out)</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-none shadow-sm rounded-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Total Pago (Hoje)</p>
                      <h3 className="text-2xl font-light text-ml-dark">R$ 1.200,00</h3>
                    </div>
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">Transferências bem sucedidas</p>
                </CardContent>
              </Card>
            </div>

            {/* Withdrawals Table */}
            <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-medium text-ml-dark">Fila de Saques (Moderação)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-medium">Data</th>
                      <th className="px-6 py-4 font-medium">Vendedor / Agência</th>
                      <th className="px-6 py-4 font-medium">Chave PIX (Destino)</th>
                      <th className="px-6 py-4 font-medium">Valor</th>
                      <th className="px-6 py-4 font-medium text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-500">Há 30 min</td>
                      <td className="px-6 py-4 font-medium text-ml-dark">Agência BM Brasil</td>
                      <td className="px-6 py-4 font-mono text-xs">48.123.456/0001-00</td>
                      <td className="px-6 py-4 font-medium">R$ 1.500,00</td>
                      <td className="px-6 py-4 text-right">
                        <Button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1.5 px-4 h-auto text-xs transition-colors rounded-sm shadow-none">
                          Aprovar (Cash-out)
                        </Button>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-500">Há 2 horas</td>
                      <td className="px-6 py-4 font-medium text-ml-dark">João Vendas</td>
                      <td className="px-6 py-4 font-mono text-xs">123.456.789-00</td>
                      <td className="px-6 py-4 font-medium">R$ 3.200,00</td>
                      <td className="px-6 py-4 text-right">
                        <Button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1.5 px-4 h-auto text-xs transition-colors rounded-sm shadow-none">
                          Aprovar (Cash-out)
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'vendas' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Admin Financial Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-r from-ml-blue to-blue-600 border-none shadow-md rounded-md text-white col-span-1 md:col-span-2">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-sm text-blue-100 font-medium mb-1">Saldo Disponível no Gateway</p>
                      <h3 className="text-4xl font-bold">R$ 28.540,00</h3>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Landmark className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-blue-100">Vendas próprias + Taxas da plataforma</p>
                    <Button className="bg-white text-ml-blue hover:bg-gray-100 font-bold px-6 py-2 h-auto text-sm transition-colors rounded-sm shadow-lg flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4" /> Transferir para Conta
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-none shadow-sm rounded-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Minhas Vendas (Hoje)</p>
                      <h3 className="text-2xl font-light text-ml-dark">R$ 840,00</h3>
                    </div>
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-ml-blue">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">Suas vendas diretas (Livre de taxas)</p>
                </CardContent>
              </Card>
            </div>

            {/* Admin Sales History */}
            <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-medium text-ml-dark">Histórico de Vendas Diretas (Admin)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-medium">Data/Hora</th>
                      <th className="px-6 py-4 font-medium">Comprador</th>
                      <th className="px-6 py-4 font-medium">Seu Produto</th>
                      <th className="px-6 py-4 font-medium text-right">Valor Líquido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-500">Hoje, 10:15</td>
                      <td className="px-6 py-4 font-medium text-ml-dark">João Silva</td>
                      <td className="px-6 py-4">Conta Google Ads Gasta ($350)</td>
                      <td className="px-6 py-4 text-right font-medium text-green-500">+ R$ 450,00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
