import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LucideIcon } from 'lucide-react'

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  title: string;
}

export function DashboardLayout({ children, navItems, title }: DashboardLayoutProps) {
  const location = useLocation()

  return (
    <div className="min-h-[calc(100vh-100px)] bg-[var(--layout-page-background)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 py-5 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 lg:w-[286px]">
          <div className="sticky top-24 overflow-hidden rounded-sm border bg-[var(--layout-dashboard-sidebar-bg)] shadow-sm" style={{ borderColor: 'var(--layout-dashboard-sidebar-border)' }}>
            <div className="border-b bg-[var(--layout-dashboard-sidebar-header-bg)] px-5 py-5 text-[var(--layout-dashboard-sidebar-text)]" style={{ borderColor: 'var(--layout-dashboard-sidebar-border)' }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--layout-dashboard-sidebar-kicker-text)]">Cookie market</p>
              <h2 className="mt-1 text-xl font-bold leading-tight">{title}</h2>
              <p className="mt-2 text-xs text-[var(--layout-dashboard-sidebar-muted-text)]">Central de operacao e acompanhamento.</p>
            </div>
            <nav className="flex gap-2 overflow-x-auto p-3 [scrollbar-width:none] lg:block lg:space-y-1 lg:overflow-visible [&::-webkit-scrollbar]:hidden">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex shrink-0 items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors lg:w-full ${
                      isActive 
                        ? 'bg-[var(--layout-dashboard-sidebar-active-bg)] text-[var(--layout-dashboard-sidebar-active-text)] font-bold shadow-sm' 
                        : 'text-[var(--layout-dashboard-sidebar-text)] hover:bg-[var(--layout-dashboard-sidebar-hover-bg)] hover:text-[var(--layout-dashboard-sidebar-hover-text)]'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="whitespace-nowrap">{item.title}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4 rounded-sm border border-[var(--layout-border-color)] bg-[var(--layout-surface-background)] px-5 py-4 shadow-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--layout-link-color)]">Painel</p>
                <h1 className="text-2xl font-bold tracking-tight text-[var(--layout-text-primary)]">{title}</h1>
              </div>
              <p className="text-sm text-[var(--layout-text-muted)]">Dados em tempo real conectados a plataforma.</p>
            </div>
          </div>
          <div className="dashboard-surface">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
