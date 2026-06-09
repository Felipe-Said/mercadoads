import React, { useState } from 'react'
import { SellerLayout } from '../../components/layouts/SellerLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Star, MessageSquare, Reply, User } from 'lucide-react'

export function ResumoVendas() {
  const [activeTab, setActiveTab] = useState<'pendentes' | 'respondidas'>('pendentes');

  return (
    <SellerLayout>
      <div className="space-y-6">
        
        {/* Profile & Reputation Header */}
        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <CardContent className="p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-4xl text-gray-400 font-light overflow-hidden flex-shrink-0">
              <User className="w-12 h-12 text-gray-400" />
            </div>
            <div className="flex-grow">
              <h1 className="text-2xl font-light text-ml-dark">Agência XYZ</h1>
              <p className="text-gray-500 mt-1">Membro desde Outubro de 2024</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md min-w-[200px] border border-gray-100 text-center">
              <p className="text-sm text-gray-500 font-medium mb-2">Sua reputação</p>
              <div className="flex items-center justify-center gap-1 mb-1 text-green-500">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-xs font-semibold text-green-600">Vendedor Excelente</p>
            </div>
          </CardContent>
        </Card>

        {/* Q&A Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-light text-ml-dark">Central de Perguntas</h2>
          </div>

          <div className="flex gap-1 bg-white p-1 rounded-md shadow-sm w-max border border-gray-100">
            <button 
              onClick={() => setActiveTab('pendentes')}
              className={`px-6 py-2 text-sm font-medium rounded-sm transition-colors flex items-center gap-2 ${activeTab === 'pendentes' ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <MessageSquare className="w-4 h-4" /> Pendentes (2)
            </button>
            <button 
              onClick={() => setActiveTab('respondidas')}
              className={`px-6 py-2 text-sm font-medium rounded-sm transition-colors flex items-center gap-2 ${activeTab === 'respondidas' ? 'bg-ml-blue/10 text-ml-blue' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Reply className="w-4 h-4" /> Respondidas
            </button>
          </div>

          {activeTab === 'pendentes' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Pendente 1 */}
              <Card className="bg-white border-l-4 border-l-red-500 border-t-0 border-r-0 border-b-0 shadow-sm rounded-md">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <MessageSquare className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-grow">
                      <p className="text-sm font-medium text-ml-dark mb-1">
                        "Boa tarde, essa BM vem com limite diário de quanto para anunciar?"
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                        <span className="font-medium text-ml-blue cursor-pointer hover:underline">BM Infinita Facebook Ads c/ 5 Contas</span>
                        <span>•</span>
                        <span>Há 2 horas</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Escreva sua resposta..." 
                          className="flex-grow h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue text-sm"
                        />
                        <Button className="bg-ml-blue text-white hover:bg-ml-hover font-semibold px-6 rounded-sm shadow-sm h-10">
                          Responder
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pendente 2 */}
              <Card className="bg-white border-l-4 border-l-red-500 border-t-0 border-r-0 border-b-0 shadow-sm rounded-md">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <MessageSquare className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-grow">
                      <p className="text-sm font-medium text-ml-dark mb-1">
                        "O perfil já vem aquecido há quanto tempo?"
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                        <span className="font-medium text-ml-blue cursor-pointer hover:underline">Perfil Aquecido Facebook BR</span>
                        <span>•</span>
                        <span>Há 5 horas</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Escreva sua resposta..." 
                          className="flex-grow h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue text-sm"
                        />
                        <Button className="bg-ml-blue text-white hover:bg-ml-hover font-semibold px-6 rounded-sm shadow-sm h-10">
                          Responder
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'respondidas' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Card className="bg-white border-none shadow-sm rounded-md">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <MessageSquare className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-ml-dark mb-1">
                        "Vocês entregam na hora após o pagamento PIX?"
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <span className="font-medium text-ml-blue cursor-pointer hover:underline">BM Verificada Cnpj</span>
                        <span>•</span>
                        <span>Ontem</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-sm border-l-2 border-l-gray-300">
                        <div className="flex items-center gap-2 mb-1">
                          <Reply className="w-4 h-4 text-gray-400" />
                          <span className="text-xs font-semibold text-gray-600">Sua resposta</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Olá! Sim, a entrega é 100% automática logo após a confirmação do pagamento. Enviamos os dados de acesso diretamente no painel.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </div>
    </SellerLayout>
  )
}
