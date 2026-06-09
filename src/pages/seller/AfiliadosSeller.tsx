import React, { useState } from 'react'
import { SellerLayout } from '../../components/layouts/SellerLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Search, Filter, TrendingUp, Users, UserPlus, CheckCircle2, BellRing } from 'lucide-react'
import { Button } from '../../components/ui/button'

export function AfiliadosSeller() {
  const [activeTab, setActiveTab] = useState<'lista' | 'convidar'>('lista');
  const [searchEmail, setSearchEmail] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [commission, setCommission] = useState('15');
  const [inviteSent, setInviteSent] = useState(false);

  const handleSearch = () => {
    if (searchEmail.includes('@')) {
      setHasSearched(true);
      setInviteSent(false);
    }
  }

  const handleSendInvite = () => {
    setInviteSent(true);
    setTimeout(() => {
      setHasSearched(false);
      setSearchEmail('');
      setInviteSent(false);
    }, 3000);
  }

  return (
    <SellerLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark mb-4">Meus Afiliados</h2>

        <div className="flex gap-1 bg-white p-1 rounded-md shadow-sm w-max border border-gray-100 mb-2">
          <button 
            onClick={() => setActiveTab('lista')}
            className={`px-6 py-2 text-sm font-medium rounded-sm transition-colors flex items-center gap-2 ${activeTab === 'lista' ? 'bg-ml-blue/10 text-ml-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Users className="w-4 h-4" /> Rede de Afiliados
          </button>
          <button 
            onClick={() => setActiveTab('convidar')}
            className={`px-6 py-2 text-sm font-medium rounded-sm transition-colors flex items-center gap-2 ${activeTab === 'convidar' ? 'bg-ml-blue/10 text-ml-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <UserPlus className="w-4 h-4" /> Convidar Afiliado
          </button>
        </div>

        {activeTab === 'lista' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-white border-none shadow-sm rounded-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Total de Afiliados</p>
                      <h3 className="text-2xl font-light text-ml-dark">24 ativos</h3>
                    </div>
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-ml-blue">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-green-500 font-medium">+3 novos esta semana</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-none shadow-sm rounded-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Vendas por Afiliados (30 dias)</p>
                      <h3 className="text-2xl font-light text-ml-dark">R$ 8.450,00</h3>
                    </div>
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">Total gerado pela rede</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/50">
                <div className="relative w-full max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar por nome ou e-mail..." 
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
                      <th className="px-6 py-4 font-medium">Nome do Afiliado</th>
                      <th className="px-6 py-4 font-medium">Produto Mais Vendido</th>
                      <th className="px-6 py-4 font-medium text-center">Comissão (%)</th>
                      <th className="px-6 py-4 font-medium">Comissão Paga</th>
                      <th className="px-6 py-4 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-ml-dark">Marcos Vinícius</p>
                        <p className="text-xs text-gray-500">marcos.v@email.com</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600">BM Infinita</td>
                      <td className="px-6 py-4 text-center font-medium">15%</td>
                      <td className="px-6 py-4 font-medium text-green-500">R$ 1.250,00</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-ml-blue hover:text-ml-hover font-medium text-sm transition-colors mr-3">Editar %</button>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-ml-dark">Ana Souza</p>
                        <p className="text-xs text-gray-500">ana.s@email.com</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600">Perfil Aquecido</td>
                      <td className="px-6 py-4 text-center font-medium">20%</td>
                      <td className="px-6 py-4 font-medium text-green-500">R$ 840,00</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-ml-blue hover:text-ml-hover font-medium text-sm transition-colors mr-3">Editar %</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'convidar' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl">
            <Card className="bg-white border-none shadow-sm rounded-md">
              <CardContent className="p-8">
                <h3 className="text-xl font-light text-ml-dark mb-2">Convidar Novo Afiliado</h3>
                <p className="text-sm text-gray-500 mb-6">Busque o usuário pelo e-mail cadastrado na plataforma para enviar o convite de parceria.</p>

                <div className="flex gap-4 mb-8">
                  <div className="flex-grow relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="email" 
                      placeholder="E-mail do usuário..." 
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-ml-blue text-sm"
                    />
                  </div>
                  <Button 
                    onClick={handleSearch}
                    className="bg-ml-blue hover:bg-ml-hover text-white font-semibold h-12 px-8 rounded-sm shadow-sm transition-colors"
                  >
                    Buscar
                  </Button>
                </div>

                {hasSearched && !inviteSent && (
                  <div className="animate-in fade-in zoom-in duration-300">
                    <div className="border border-gray-200 rounded-md p-6 bg-gray-50 mb-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
                          <Users className="w-8 h-8 text-gray-300" />
                        </div>
                        <div>
                          <p className="font-semibold text-ml-dark text-lg">Usuário Encontrado</p>
                          <p className="text-sm text-gray-500">{searchEmail}</p>
                          <span className="inline-block mt-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-sm text-xs font-semibold">Conta Verificada</span>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Definir comissão do afiliado (%)</label>
                        <div className="flex items-center gap-3">
                          <input 
                            type="number" 
                            min="1" max="99"
                            value={commission}
                            onChange={(e) => setCommission(e.target.value)}
                            className="w-24 h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-ml-blue text-lg font-bold text-center text-ml-dark"
                          />
                          <span className="text-gray-500">% por cada venda aprovada</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        onClick={handleSendInvite}
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold h-12 px-10 rounded-sm shadow-sm transition-colors flex items-center gap-2"
                      >
                        <BellRing className="w-5 h-5" /> Enviar Convite de Afiliação
                      </Button>
                    </div>
                  </div>
                )}

                {inviteSent && (
                  <div className="animate-in fade-in zoom-in duration-300 flex flex-col items-center justify-center py-10 bg-green-50 rounded-md border border-green-100 text-center">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                    <h3 className="text-xl font-bold text-green-700 mb-2">Convite Enviado com Sucesso!</h3>
                    <p className="text-green-600 text-sm max-w-sm">
                      O usuário receberá uma notificação no painel dele informando a porcentagem de comissão aprovada.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </SellerLayout>
  )
}
