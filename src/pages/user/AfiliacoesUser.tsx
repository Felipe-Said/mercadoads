import React, { useState } from 'react'
import { UserLayout } from '../../components/layouts/UserLayout'
import { Card, CardContent } from '../../components/ui/card'
import { DollarSign, Copy, CheckCircle2, TrendingUp, Store, Activity, ArrowRightLeft, Clock } from 'lucide-react'
import { Button } from '../../components/ui/button'

export function AfiliacoesUser() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'saques'>('dashboard');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [pixKey, setPixKey] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark mb-4">Central de Afiliações</h2>

        <div className="flex gap-1 bg-white p-1 rounded-md shadow-sm w-max border border-gray-100 mb-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-2 text-sm font-medium rounded-sm transition-colors flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-ml-blue/10 text-ml-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Activity className="w-4 h-4" /> Visão Geral
          </button>
          <button 
            onClick={() => setActiveTab('saques')}
            className={`px-6 py-2 text-sm font-medium rounded-sm transition-colors flex items-center gap-2 ${activeTab === 'saques' ? 'bg-ml-blue/10 text-ml-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <ArrowRightLeft className="w-4 h-4" /> Saques
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Dashboards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-r from-ml-blue to-blue-600 border-none shadow-md rounded-md text-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-blue-100 font-medium mb-1">Comissões a Receber</p>
                  <h3 className="text-3xl font-bold">R$ 1.250,00</h3>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-xs text-blue-100">Atualizado em tempo real</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm rounded-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Vendido (Bruto)</p>
                  <h3 className="text-3xl font-light text-ml-dark">R$ 8.333,33</h3>
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-gray-400">Total gerado com seus links</p>
            </CardContent>
          </Card>
        </div>

        {/* Lojas Parceiras */}
        <div>
          <h3 className="text-lg font-medium text-ml-dark mb-4">Lojas Parceiras</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="bg-white border border-gray-100 shadow-sm rounded-md hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Store className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-ml-dark">Agência XYZ</p>
                  <p className="text-xs text-gray-500">15% de comissão média</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-100 shadow-sm rounded-md hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Store className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-ml-dark">BM Brasil Oficial</p>
                  <p className="text-xs text-gray-500">20% de comissão média</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Meus Links */}
        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-ml-dark">Meus Links de Divulgação (Trackeados)</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Produto</th>
                  <th className="px-6 py-4 font-medium">Comissão</th>
                  <th className="px-6 py-4 font-medium">Seu Link Exclusivo</th>
                  <th className="px-6 py-4 font-medium text-right">Copiar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                
                {/* Product 1 */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-ml-dark">BM Infinita Facebook Ads</p>
                    <p className="text-xs text-gray-500">Agência XYZ</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-sm text-xs font-semibold">15% (R$ 180,00)</span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-sm break-all">
                      https://mercadoads.com/produto/1?ref=user_883
                    </code>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleCopy('https://mercadoads.com/produto/1?ref=user_883')}
                      className="p-2 text-gray-400 hover:text-ml-blue hover:bg-blue-50 rounded-full transition-colors"
                      title="Copiar Link"
                    >
                      {copiedLink === 'https://mercadoads.com/produto/1?ref=user_883' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                </tr>

                {/* Product 2 */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-ml-dark">Perfil Aquecido Meta Ads BR</p>
                    <p className="text-xs text-gray-500">BM Brasil Oficial</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-sm text-xs font-semibold">20% (R$ 40,00)</span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-sm break-all">
                      https://mercadoads.com/produto/2?ref=user_883
                    </code>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleCopy('https://mercadoads.com/produto/2?ref=user_883')}
                      className="p-2 text-gray-400 hover:text-ml-blue hover:bg-blue-50 rounded-full transition-colors"
                      title="Copiar Link"
                    >
                      {copiedLink === 'https://mercadoads.com/produto/2?ref=user_883' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </Card>
        </div>
        )}

        {activeTab === 'saques' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Request Withdrawal Box */}
              <Card className="bg-white border-none shadow-sm rounded-md">
                <CardContent className="p-8">
                  <h3 className="text-xl font-light text-ml-dark mb-6">Solicitar Saque</h3>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6">
                    <p className="text-sm text-blue-600 font-medium mb-1">Saldo Disponível</p>
                    <p className="text-3xl font-bold text-ml-blue">R$ 1.250,00</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chave PIX (Destino)</label>
                      <input 
                        type="text" 
                        value={pixKey}
                        onChange={(e) => setPixKey(e.target.value)}
                        placeholder="CPF, E-mail ou Telefone..." 
                        className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-ml-blue text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Saque (R$)</label>
                      <input 
                        type="number" 
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="0,00" 
                        className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-ml-blue text-lg font-medium"
                      />
                    </div>
                    
                    <Button className="w-full bg-ml-blue hover:bg-ml-hover text-white font-semibold h-12 rounded-sm shadow-sm transition-colors mt-2">
                      Confirmar Saque
                    </Button>
                    <p className="text-xs text-gray-400 text-center mt-2">A transferência via Gateway pode levar até 2h para ser processada.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Withdrawal History */}
              <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-lg font-medium text-ml-dark">Histórico de Saques</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 font-medium">Data</th>
                        <th className="px-6 py-4 font-medium">Valor</th>
                        <th className="px-6 py-4 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-gray-500">Ontem, 14:30</td>
                        <td className="px-6 py-4 font-medium text-ml-dark">R$ 500,00</td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-600 px-2 py-1 rounded-sm text-xs font-semibold">
                            <Clock className="w-3 h-3" /> Pendente
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-gray-500">01/06/2026</td>
                        <td className="px-6 py-4 font-medium text-ml-dark">R$ 840,00</td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded-sm text-xs font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> Pago
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        )}

      </div>
    </UserLayout>
  )
}
