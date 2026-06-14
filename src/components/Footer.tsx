import { Link } from 'react-router-dom'
import { Instagram } from 'iconsax-react'

const policyLinks = [
  { label: 'Termos e condicoes', href: '/politicas/termos' },
  { label: 'Privacidade', href: '/politicas/privacidade' },
  { label: 'Reembolso e disputas', href: '/politicas/reembolso' },
  { label: 'Entrega digital', href: '/politicas/entrega-digital' },
  { label: 'Regras da comunidade', href: '/politicas/comunidade' },
  { label: 'Acessibilidade', href: '/acessibilidade' },
]

export function Footer() {
  return (
    <footer className="border-t bg-[var(--layout-surface-background)] pb-24 pt-8 md:pb-8" style={{ borderColor: 'var(--layout-border-color)' }}>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div>
          <p className="text-sm font-bold text-[var(--layout-text-primary)]">Cookie market</p>
          <nav className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <Link to="/trabalhe-conosco" className="font-medium text-[var(--layout-link-color)] hover:text-[var(--layout-link-hover-color)]">
              Trabalhe conosco
            </Link>
            {policyLinks.map((link) => (
              <Link key={link.href} to={link.href} className="font-medium text-[var(--layout-link-color)] hover:text-[var(--layout-link-hover-color)]">
                {link.label}
              </Link>
            ))}
            <Link to="/contato" className="font-medium text-[var(--layout-link-color)] hover:text-[var(--layout-link-hover-color)]">
              Contato
            </Link>
          </nav>
          <p className="mt-4 text-xs text-[var(--layout-text-muted)]">Copyright © 2026 Cookie market LTDA.</p>
        </div>

        <a
          href="https://www.instagram.com/cookiemarket.lat"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-max items-center gap-2 rounded-sm border px-3 py-2 text-sm font-bold text-[var(--layout-text-primary)] transition hover:border-[var(--layout-link-color)] hover:text-[var(--layout-link-color)]"
          style={{ borderColor: 'var(--layout-border-color)' }}
        >
          <Instagram size="20" variant="Bold" color="currentColor" />
          @cookiemarket.net
        </a>
      </div>
    </footer>
  )
}
