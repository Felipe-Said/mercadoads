import { Link } from 'react-router-dom'
import { AtSign, ChevronRight, MessageSquare, Server, Smartphone } from 'lucide-react'

const tools = [
  {
    title: 'Proxy',
    description: 'Proxies premium com planos de trafego e entrega pela plataforma.',
    href: '/proxy',
    icon: Server,
  },
  {
    title: 'SMM',
    description: 'Servicos sociais organizados por plataforma, categoria e disponibilidade.',
    href: '/smm',
    icon: MessageSquare,
  },
  {
    title: 'Numero virtual',
    description: 'Numeros para receber SMS por plataforma, pais e operadora.',
    href: '/numero-virtual',
    icon: Smartphone,
  },
  {
    title: 'Email temporario',
    description: 'Emails temporarios disponiveis para ativacoes e verificacoes.',
    href: '/email-temporario',
    icon: AtSign,
  },
]

export function Ferramentas() {
  return (
    <div className="min-h-screen bg-[var(--layout-page-background)] py-8 text-[var(--layout-text-primary)]">
      <main className="mx-auto max-w-[1440px] px-4">
        <section className="rounded-sm border bg-[var(--layout-surface-background)] p-5 shadow-sm" style={{ borderColor: 'var(--layout-border-color)' }}>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--layout-link-color)]">Cookie tools</p>
          <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Ferramentas da plataforma</h1>
              <p className="mt-2 max-w-2xl text-sm text-[var(--layout-text-muted)]">
                Acesse as ferramentas conectadas para comprar e gerenciar recursos digitais.
              </p>
            </div>
            <Link to="/" className="text-sm font-bold text-[var(--layout-link-color)] hover:text-[var(--layout-link-hover-color)]">
              Voltar para home
            </Link>
          </div>
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {tools.map((tool) => {
            const Icon = tool.icon

            return (
              <Link
                key={tool.href}
                to={tool.href}
                className="group flex min-h-56 flex-col justify-between rounded-sm border bg-[var(--layout-surface-background)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderColor: 'var(--layout-border-color)' }}
              >
                <div>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-sm bg-[var(--layout-subtle-background)] text-[var(--layout-link-color)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="mt-4 text-xl font-bold">{tool.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--layout-text-muted)]">{tool.description}</p>
                </div>

                <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[var(--layout-link-color)] group-hover:text-[var(--layout-link-hover-color)]">
                  Abrir ferramenta
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Link>
            )
          })}
        </section>
      </main>
    </div>
  )
}
