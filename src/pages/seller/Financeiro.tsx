import React, { useState } from 'react'
import { SellerLayout } from '../../components/layouts/SellerLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Calendar, ChevronDown, DollarSign, ArrowUpRight, Clock, Trophy } from 'lucide-react'

export function Financeiro() {
  const [activeTab, setActiveTab] = useState<'saques' | 'vendas'>('saques');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('Últimos 30 dias');

  const dateOptions = [
    'Hoje',
    'Últimos 7 dias',
    'Últimos 15 dias',
    'Últimos 30 dias',
    'Este mês',
    'Mês passado'
  ];

  return (
    <SellerLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <h2 className="text-xl font-light text-ml-dark">Financeiro</h2>
          
          {/* Custom Date Picker (Functional) */}
          <div className="relative">
            <button 
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="flex items-center justify-between gap-3 bg-white border border-gray-200 px-4 py-2.5 rounded-sm shadow-sm hover:bg-gray-50 transition-colors text-sm text-gray-600 min-w-[200px]"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-ml-blue" />
                <span>{selectedDateRange}</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isDatePickerOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDatePickerOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsDatePickerOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-full bg-white border border-gray-200 rounded-sm shadow-lg z-20 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  {dateOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSelectedDateRange(option);
                        setIsDatePickerOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedDateRange === option ? 'text-ml-blue font-medium bg-blue-50/50' : 'text-gray-600'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex gap-1 bg-white p-1 rounded-md shadow-sm w-max border border-gray-100">
          <button 
            onClick={() => setActiveTab('saques')}
            className={`px-6 py-2 text-sm font-medium rounded-sm transition-colors ${activeTab === 'saques' ? 'bg-ml-blue/10 text-ml-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Saques
          </button>
          <button 
            onClick={() => setActiveTab('vendas')}
            className={`px-6 py-2 text-sm font-medium rounded-sm transition-colors ${activeTab === 'vendas' ? 'bg-ml-blue/10 text-ml-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Vendas
          </button>
        </div>

        {activeTab === 'saques' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Saques Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white border-none shadow-sm rounded-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Vendas do dia</p>
                      <h3 className="text-2xl font-light text-ml-dark">R$ 840,00</h3>
                    </div>
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-ml-blue">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">Total acumulado hoje</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-none shadow-sm rounded-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Saques feitos</p>
                      <h3 className="text-2xl font-light text-ml-dark">R$ 12.450,00</h3>
                    </div>
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">Total no período</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-none shadow-sm rounded-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Saque pendente</p>
                      <h3 className="text-2xl font-light text-ml-dark">R$ 1.500,00</h3>
                    </div>
                    <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-500">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <Button className="w-full mt-2 bg-ml-blue/10 text-ml-blue hover:bg-ml-blue hover:text-white font-semibold py-1.5 h-auto text-sm transition-colors rounded-sm shadow-none">
                    Solicitar Saque
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Saques History */}
            <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-medium text-ml-dark">Histórico de Saques</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-medium">Data da Solicitação</th>
                      <th className="px-6 py-4 font-medium">Conta Destino</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Valor Líquido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-500">Ontem, 14:30</td>
                      <td className="px-6 py-4 font-medium text-ml-dark">PIX (Nubank ***.123)</td>
                      <td className="px-6 py-4"><span className="text-orange-500 bg-orange-50 px-2 py-1 rounded-sm font-medium text-xs">Processando</span></td>
                      <td className="px-6 py-4 text-right font-medium">- R$ 1.500,00</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-500">10/10/2026</td>
                      <td className="px-6 py-4 font-medium text-ml-dark">PIX (Itaú ***.456)</td>
                      <td className="px-6 py-4"><span className="text-green-500 bg-green-50 px-2 py-1 rounded-sm font-medium text-xs">Concluído</span></td>
                      <td className="px-6 py-4 text-right font-medium">- R$ 3.200,00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'vendas' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* Top Product Highlight */}
            <Card className="bg-gradient-to-r from-ml-blue to-blue-600 border-none shadow-md rounded-md text-white">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-yellow-300" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-100 font-medium mb-1">Produto Mais Vendido (Período)</p>
                    <h3 className="text-xl font-bold">BM Infinita Facebook Ads c/ 5 Contas</h3>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">84</p>
                  <p className="text-sm text-blue-100">unidades vendidas</p>
                </div>
              </CardContent>
            </Card>

            {/* Sales History */}
            <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-medium text-ml-dark">Vendas (Últimas 24h)</h3>
                <span className="text-sm font-semibold text-green-500 bg-green-50 px-3 py-1 rounded-sm">12 Vendas Hoje</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-medium">Data/Hora</th>
                      <th className="px-6 py-4 font-medium">Comprador</th>
                      <th className="px-6 py-4 font-medium">Produto</th>
                      <th className="px-6 py-4 font-medium text-right">Valor Recebido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-500">Hoje, 10:15</td>
                      <td className="px-6 py-4 font-medium text-ml-dark">João Silva</td>
                      <td className="px-6 py-4">BM Infinita Facebook Ads c/ 5 Contas</td>
                      <td className="px-6 py-4 text-right font-medium text-green-500">+ R$ 314,91</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-500">Hoje, 09:30</td>
                      <td className="px-6 py-4 font-medium text-ml-dark">Marcos Vinícius</td>
                      <td className="px-6 py-4">Perfil Aquecido Facebook BR</td>
                      <td className="px-6 py-4 text-right font-medium text-green-500">+ R$ 80,91</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-500">Ontem, 23:45</td>
                      <td className="px-6 py-4 font-medium text-ml-dark">Ana Souza</td>
                      <td className="px-6 py-4">Conta Google Ads Gasta ($350)</td>
                      <td className="px-6 py-4 text-right font-medium text-green-500">+ R$ 405,00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

          </div>
        )}

      </div>
    </SellerLayout>
  )
}
