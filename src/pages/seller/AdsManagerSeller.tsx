import React, { useState } from 'react'
import { SellerLayout } from '../../components/layouts/SellerLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Megaphone, Star, Users, LayoutTemplate } from 'lucide-react'

export function AdsManagerSeller() {
  const [selectedAd, setSelectedAd] = useState('produto')
  const [days, setDays] = useState(7)

  const getDailyPrice = () => {
    if (selectedAd === 'produto') return 5;
    if (selectedAd === 'grupo') return 10;
    if (selectedAd === 'flyer') return 50;
    return 0;
  }

  const totalCost = getDailyPrice() * days;

  return (
    <SellerLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark mb-4">Ads Manager (Impulsionar Vendas)</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
              <CardContent className="p-8">
                <h3 className="text-lg font-medium text-ml-dark mb-6">Escolha o formato do seu anúncio</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div 
                    onClick={() => setSelectedAd('produto')}
                    className={`border-2 rounded-md p-4 cursor-pointer transition-all ${selectedAd === 'produto' ? 'border-ml-blue bg-ml-blue/5' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <Star className={`w-6 h-6 mb-2 ${selectedAd === 'produto' ? 'text-ml-blue' : 'text-gray-400'}`} />
                    <h4 className="font-semibold text-ml-dark text-sm">Produto Patrocinado</h4>
                    <p className="text-xs text-gray-500 mt-1">Apareça no topo das buscas.</p>
                  </div>

                  <div 
                    onClick={() => setSelectedAd('grupo')}
                    className={`border-2 rounded-md p-4 cursor-pointer transition-all ${selectedAd === 'grupo' ? 'border-ml-blue bg-ml-blue/5' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <Users className={`w-6 h-6 mb-2 ${selectedAd === 'grupo' ? 'text-ml-blue' : 'text-gray-400'}`} />
                    <h4 className="font-semibold text-ml-dark text-sm">Grupo WhatsApp</h4>
                    <p className="text-xs text-gray-500 mt-1">Ganhe o selo de destaque.</p>
                  </div>

                  <div 
                    onClick={() => setSelectedAd('flyer')}
                    className={`border-2 rounded-md p-4 cursor-pointer transition-all ${selectedAd === 'flyer' ? 'border-ml-blue bg-ml-blue/5' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <LayoutTemplate className={`w-6 h-6 mb-2 ${selectedAd === 'flyer' ? 'text-ml-blue' : 'text-gray-400'}`} />
                    <h4 className="font-semibold text-ml-dark text-sm">Flyer na Home</h4>
                    <p className="text-xs text-gray-500 mt-1">Banner lateral de alta conversão.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {selectedAd === 'produto' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Selecione o Produto</label>
                      <select className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue bg-white">
                        <option>BM Infinita Facebook Ads</option>
                        <option>Perfil Aquecido Facebook BR</option>
                      </select>
                    </div>
                  )}

                  {selectedAd === 'grupo' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Link do Grupo</label>
                      <input type="text" placeholder="https://chat.whatsapp.com/..." className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue" />
                    </div>
                  )}

                  {selectedAd === 'flyer' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Posição do Flyer</label>
                        <select className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue bg-white">
                          <option>Lateral Esquerda</option>
                          <option>Lateral Direita</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload da Arte (Vertical)</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center bg-gray-50">
                          <p className="text-sm text-gray-500">Clique ou arraste a imagem aqui (160x600px recomendado)</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duração da Campanha (Dias)</label>
                    <input 
                      type="number" 
                      min="1"
                      value={days}
                      onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                      className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue" 
                    />
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="bg-white border-none shadow-sm rounded-md sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-ml-dark mb-4 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-ml-blue" /> Resumo do Pedido
                </h3>
                
                <div className="space-y-3 text-sm text-gray-600 mb-6">
                  <div className="flex justify-between">
                    <span>Tipo</span>
                    <span className="font-medium text-ml-dark">
                      {selectedAd === 'produto' ? 'Produto' : selectedAd === 'grupo' ? 'Grupo WhatsApp' : 'Flyer Vertical'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duração</span>
                    <span className="font-medium text-ml-dark">{days} dias</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custo diário</span>
                    <span className="font-medium text-ml-dark">R$ {getDailyPrice().toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-ml-dark">Total</span>
                    <span className="text-2xl font-light text-ml-dark">R$ {totalCost.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>

                <Button className="w-full bg-ml-blue text-white hover:bg-ml-hover font-semibold py-6 text-base rounded-sm shadow-sm mb-3">
                  Pagar e Impulsionar
                </Button>
                <p className="text-xs text-center text-gray-400">O valor pode ser descontado do seu saldo a receber.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SellerLayout>
  )
}
