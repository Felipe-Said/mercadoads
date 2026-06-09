import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PRODUCTS, Product } from '../components/ProductCard'
import { RegistrationModal } from '../components/RegistrationModal'
import { Button } from '../components/ui/button'
import { Shield, Trophy, MapPin, MessageSquare, Star, ThumbsUp, Search, Check } from 'lucide-react'
import { useCart } from '../contexts/CartContext'

export function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const product = PRODUCTS.find(p => p.id === id)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [addedToCart, setAddedToCart] = useState(false)
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: parseInt(product.id),
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: 1
      });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-light text-ml-dark mb-4">Produto não encontrado</h1>
        <Link to="/" className="text-ml-blue hover:underline">Voltar à página inicial</Link>
      </div>
    )
  }

  return (
    <div className="bg-[#ededed] min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-2">
        <div className="text-sm text-ml-dark flex items-center gap-2 mb-2">
          <Link to="/" className="font-semibold hover:underline">Voltar à lista</Link>
          <span className="text-gray-400">|</span>
          <Link to="/" className="text-ml-blue hover:underline">Início</Link>
          <span className="text-gray-400">&gt;</span>
          <span className="text-gray-500">Ativos Digitais</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-md shadow-sm p-4 md:p-0 flex flex-col md:flex-row">
          
          {/* Left Column: Image, Description, Q&A, Reviews */}
          <div className="md:w-2/3 md:border-r border-gray-200">
            <div className="flex justify-center items-center p-8 h-[400px] md:h-[600px]">
              <img 
                src={product.image} 
                alt={product.title} 
                className="max-w-full max-h-full object-contain mix-blend-multiply"
              />
            </div>
            
            <div className="border-t border-gray-200 p-8">
              <h2 className="text-2xl font-normal text-ml-dark mb-6">Descrição</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-[17px]">
                {product.title} de alta qualidade.
                <br/><br/>
                Compre com segurança na Mercado Ads. Nossos fornecedores são verificados e garantimos a entrega automática dos ativos imediatamente após a aprovação do pagamento.
                <br/><br/>
                Perfeito para escalar suas operações sem bloqueios ou interrupções. Ativos aquecidos e testados pela nossa equipe de qualidade antes da listagem.
              </p>
            </div>

            {/* Q&A Section */}
            <div className="border-t border-gray-200 p-8">
              <h2 className="text-2xl font-normal text-ml-dark mb-6">Perguntas e respostas</h2>
              
              <div className="mb-8">
                <p className="text-sm font-semibold text-ml-dark mb-3">Qual informação você precisa?</p>
                <div className="flex gap-2">
                  <span className="bg-blue-50 text-ml-blue font-semibold px-3 py-1.5 rounded-md text-sm cursor-pointer hover:bg-blue-100 transition-colors">Custo e prazo de envio</span>
                  <span className="bg-blue-50 text-ml-blue font-semibold px-3 py-1.5 rounded-md text-sm cursor-pointer hover:bg-blue-100 transition-colors">Garantia</span>
                  <span className="bg-blue-50 text-ml-blue font-semibold px-3 py-1.5 rounded-md text-sm cursor-pointer hover:bg-blue-100 transition-colors">Meios de pagamento</span>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-sm font-semibold text-ml-dark mb-3">Pergunte ao vendedor</p>
                <div className="flex gap-4">
                  <div className="flex-grow relative">
                    <input 
                      type="text" 
                      placeholder="Escreva sua pergunta..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-md focus:outline-none focus:border-ml-blue focus:ring-1 focus:ring-ml-blue transition-colors text-sm"
                    />
                  </div>
                  <Button className="bg-ml-blue text-white hover:bg-ml-hover font-semibold px-8 h-12 rounded-md transition-colors">
                    Perguntar
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-semibold text-ml-dark mb-4">Últimas perguntas</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-start gap-2 mb-1">
                      <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p className="text-sm text-ml-dark">O acesso é enviado na hora?</p>
                    </div>
                    <div className="flex items-start gap-2 pl-6">
                      <div className="w-3 h-3 border-l-2 border-b-2 border-gray-300 rounded-bl-sm mt-1"></div>
                      <p className="text-sm text-gray-500">Sim! A entrega é 100% automática logo após a aprovação do PIX. 12/10/2026</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start gap-2 mb-1">
                      <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p className="text-sm text-ml-dark">Vem com garantia caso tome block rápido?</p>
                    </div>
                    <div className="flex items-start gap-2 pl-6">
                      <div className="w-3 h-3 border-l-2 border-b-2 border-gray-300 rounded-bl-sm mt-1"></div>
                      <p className="text-sm text-gray-500">Nossa garantia cobre login. O uso e aquecimento a partir do primeiro acesso é de responsabilidade do comprador. 11/10/2026</p>
                    </div>
                  </div>
                </div>
                
                <button className="text-ml-blue font-semibold text-sm hover:underline mt-2">
                  Ver todas as perguntas
                </button>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="border-t border-gray-200 p-8">
              <h2 className="text-2xl font-normal text-ml-dark mb-6">Opiniões sobre o produto</h2>
              
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="md:w-1/3">
                  <div className="text-6xl font-light text-ml-dark">4.8</div>
                  <div className="flex text-ml-blue my-2">
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current opacity-50" />
                  </div>
                  <p className="text-sm text-gray-500">124 avaliações</p>
                </div>
                
                <div className="md:w-2/3 space-y-2">
                  {[
                    { stars: 5, pct: '85%' },
                    { stars: 4, pct: '10%' },
                    { stars: 3, pct: '3%' },
                    { stars: 2, pct: '1%' },
                    { stars: 1, pct: '1%' },
                  ].map((row) => (
                    <div key={row.stars} className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="w-4">{row.stars}</span>
                      <Star className="w-3 h-3 text-gray-400 fill-current" />
                      <div className="flex-grow h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-ml-blue" style={{ width: row.pct }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {[
                  { title: "Excelente ativo, recomendo!", desc: "Comprei e recebi na mesma hora. A BM estava redondinha, subiu campanha de primeira sem problemas.", date: "10 out. 2026" },
                  { title: "Muito bom", desc: "Perfil bem aquecido, parece real. Único detalhe foi que demorou uns 5 minutos pra chegar no email, mas fora isso tudo perfeito.", date: "05 out. 2026" }
                ].map((review, i) => (
                  <div key={i} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex text-ml-blue mb-2">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                    <h4 className="font-semibold text-ml-dark mb-1">{review.title}</h4>
                    <p className="text-gray-600 text-sm mb-3">{review.desc}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex gap-4">
                        <button className="flex items-center gap-1 hover:text-ml-blue transition-colors">
                          <ThumbsUp className="w-4 h-4" /> Útil
                        </button>
                      </div>
                      <span>{review.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Checkout Info & Seller Info */}
          <div className="md:w-1/3 p-6 md:p-8 flex flex-col gap-6">
            
            {/* Purchase Box */}
            <div className="border border-gray-200 rounded-md p-4">
              <div className="text-sm text-gray-500 mb-2">Novo  |  +100 vendidos</div>
              <h1 className="text-xl font-bold text-ml-dark mb-4 leading-tight">{product.title}</h1>
              
              <div className="flex text-ml-blue text-sm mb-4">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current opacity-50" />
                <span className="text-gray-400 ml-1">(124)</span>
              </div>

              {product.originalPrice && (
                <div className="text-[14px] text-gray-500 line-through mb-1">
                  R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl font-light text-ml-dark">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
                {product.originalPrice && (
                  <span className="text-[16px] font-medium text-green-500">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                )}
              </div>
              
              <div className="text-[16px] text-ml-dark mb-6">
                <span className="text-green-500 font-medium">Pagamento via PIX</span>
              </div>
              
              <div className="mb-6 flex gap-3 items-start">
                <div className="mt-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 text-green-500" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-green-500 font-semibold text-[15px]">{product.shipping}</p>
                  <p className="text-gray-500 text-[13px]">O acesso será enviado para o seu e-mail imediatamente após a compra.</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-ml-dark font-semibold mb-2 text-[15px]">Estoque disponível</p>
                <div className="flex items-center text-[15px]">
                  <span className="text-gray-500">Quantidade:</span>
                  <span className="font-semibold mx-2">1 unidade</span>
                  <span className="text-gray-400 text-sm">(23 disponíveis)</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-6">
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full h-12 bg-ml-blue hover:bg-ml-hover text-white font-semibold text-base transition-colors rounded-md shadow-sm"
                >
                  Comprar agora
                </Button>
                <Button 
                  onClick={handleAddToCart}
                  className={`w-full h-12 font-semibold text-base transition-colors rounded-md flex items-center justify-center gap-2 ${addedToCart ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-ml-blue/10 hover:bg-ml-blue/20 text-ml-blue'}`}
                >
                  {addedToCart ? <><Check className="w-5 h-5" /> Adicionado</> : 'Adicionar ao carrinho'}
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <p className="text-[13px] text-gray-500 leading-tight">
                    <span className="text-ml-blue hover:underline cursor-pointer font-medium">Compra Garantida</span>, receba o produto que está esperando ou devolvemos o dinheiro.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Trophy className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <p className="text-[13px] text-gray-500 leading-tight">
                    <span className="text-ml-dark font-medium">Mercado Pontos</span>. Você acumula 45 pontos.
                  </p>
                </div>
              </div>
            </div>

            {/* Seller Info Box */}
            <div className="border border-gray-200 rounded-md p-6">
              <h3 className="text-[17px] font-normal text-ml-dark mb-4">Informações sobre o vendedor</h3>
              
              <div className="flex items-start gap-3 mb-5">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-ml-dark">Agência XYZ Digital</p>
                  <p className="text-[13px] text-gray-500">São Paulo, São Paulo</p>
                </div>
              </div>

              {/* Reputation Thermometer */}
              <div className="flex justify-between items-center gap-1 mb-2">
                <div className="h-2 flex-1 bg-red-100"></div>
                <div className="h-2 flex-1 bg-orange-100"></div>
                <div className="h-2 flex-1 bg-yellow-100"></div>
                <div className="h-2 flex-1 bg-green-100"></div>
                <div className="h-3 flex-1 bg-green-500 relative">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-ml-dark absolute -top-1.5 left-1/2 -translate-x-1/2"></div>
                </div>
              </div>

              <div className="flex gap-2 items-center mb-6">
                <Trophy className="w-4 h-4 text-green-500" />
                <span className="text-[13px] text-green-500 font-medium">MercadoLíder Platinum</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[13px] text-gray-500 divide-x divide-gray-200">
                <div className="px-1">
                  <p className="text-xl font-normal text-ml-dark mb-1">1005</p>
                  <p className="leading-tight">Vendas nos últimos 60 dias</p>
                </div>
                <div className="px-1">
                  <div className="flex justify-center mb-1">
                    <MessageSquare className="w-5 h-5 text-ml-dark" />
                  </div>
                  <p className="leading-tight">Presta bom atendimento</p>
                </div>
                <div className="px-1">
                  <div className="flex justify-center mb-1">
                    <Shield className="w-5 h-5 text-ml-dark" />
                  </div>
                  <p className="leading-tight">Entrega os produtos no prazo</p>
                </div>
              </div>

              <button className="text-ml-blue font-semibold text-sm mt-6 hover:underline">
                Ver mais dados deste vendedor
              </button>
            </div>

          </div>
        </div>
      </div>

      <RegistrationModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        product={product} 
      />
    </div>
  )
}
