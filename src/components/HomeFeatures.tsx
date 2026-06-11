import React from 'react'
import { Zap, ShieldCheck, Lock, Users, Tag, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

export function HomeFeatures() {
  const features = [
    {
      id: 1,
      title: 'Entrega Automática',
      icon: <Zap className="w-8 h-8 text-green-500" strokeWidth={1.5} />,
      description: 'Receba seus ativos digitais instantaneamente após a compra.',
      actionText: 'Ver produtos',
      link: '/'
    },
    {
      id: 2,
      title: 'Ativos Verificados',
      icon: <ShieldCheck className="w-8 h-8 text-green-500" strokeWidth={1.5} />,
      description: 'BMs e perfis testados e garantidos pela plataforma.',
      actionText: 'Garantia total',
      link: '/'
    },
    {
      id: 3,
      title: 'Pagamento Seguro',
      icon: <Lock className="w-8 h-8 text-green-500" strokeWidth={1.5} />,
      description: 'Transações protegidas via Gateway oficial criptografado.',
      actionText: 'Saiba mais',
      link: '/'
    },
    {
      id: 4,
      title: 'Programa Afiliados',
      icon: <Users className="w-8 h-8 text-green-500" strokeWidth={1.5} />,
      description: 'Revenda nossos ativos e ganhe comissões automaticamente.',
      actionText: 'Quero lucrar',
      link: '/painel/usuario/afiliacoes'
    },
    {
      id: 5,
      title: 'Ofertas Exclusivas',
      icon: <Tag className="w-8 h-8 text-green-500" strokeWidth={1.5} />,
      description: 'Encontre os melhores preços do mercado digital aqui.',
      actionText: 'Ver ofertas',
      link: '/'
    },
    {
      id: 6,
      title: 'Top Ativos',
      icon: <TrendingUp className="w-8 h-8 text-green-500" strokeWidth={1.5} />,
      description: 'Explore as BMs e perfis mais vendidos do momento.',
      actionText: 'Mais vendidos',
      link: '/'
    }
  ]

  return (
    <div className="w-full">
      <div className="flex overflow-x-auto lg:grid lg:grid-cols-6 gap-3 lg:gap-4 pb-4 lg:pb-0 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {features.map((feature) => (
          <div 
            key={feature.id} 
            className="flex-shrink-0 w-64 lg:w-auto snap-center bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center transition-all hover:shadow-md hover:border-ml-blue h-[220px] justify-between group cursor-default"
          >
            <div>
              <h3 className="text-sm font-semibold text-ml-dark mb-4">{feature.title}</h3>
              
              <div className="w-16 h-16 rounded-full border-2 border-gray-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-green-50/50 transition-colors">
                {feature.icon}
              </div>
              
              <p className="text-[13px] text-gray-500 leading-tight px-2 line-clamp-2">
                {feature.description}
              </p>
            </div>
            
            <Link 
              to={feature.link}
              className="mt-4 w-full block text-[13px] font-bold text-ml-blue hover:text-white transition-colors bg-blue-50 hover:bg-ml-blue py-2.5 rounded-lg"
            >
              {feature.actionText}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
