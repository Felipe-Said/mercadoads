import React from 'react'
import { BadgeCheck, Lock, ShieldCheck, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export function HomeFeatures() {
  const features = [
    {
      id: 1,
      title: 'Entrega rapida',
      icon: <Zap className="h-5 w-5 text-[var(--layout-success-color)]" strokeWidth={2} />,
      description: 'Pedido acompanhado dentro da plataforma.',
      link: '/'
    },
    {
      id: 2,
      title: 'Ativos verificados',
      icon: <BadgeCheck className="h-5 w-5 text-[var(--layout-success-color)]" strokeWidth={2} />,
      description: 'Lojas e produtos moderados.',
      link: '/'
    },
    {
      id: 3,
      title: 'Pagamento protegido',
      icon: <Lock className="h-5 w-5 text-[var(--layout-success-color)]" strokeWidth={2} />,
      description: 'Pix via gateway oficial.',
      link: '/'
    },
    {
      id: 4,
      title: 'Suporte brasileiro',
      icon: <ShieldCheck className="h-5 w-5 text-[var(--layout-success-color)]" strokeWidth={2} />,
      description: 'Fluxo de compra com registro.',
      link: '/contato'
    }
  ]

  return (
    <div className="layout-surface grid grid-cols-1 overflow-hidden rounded-md shadow-sm md:grid-cols-4">
      {features.map((feature, index) => (
        <Link
          key={feature.id}
          to={feature.link}
          className={`flex items-center gap-3 px-5 py-4 transition hover:bg-[var(--layout-subtle-background)] ${index > 0 ? 'md:border-l md:border-[var(--layout-border-color)]' : ''}`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--layout-subtle-background)]">
            {feature.icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--layout-text-primary)]">{feature.title}</p>
            <p className="truncate text-xs text-[var(--layout-text-muted)]">{feature.description}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
