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
    <div className="min-h-[calc(100vh-100px)] bg-[#e3e6e6]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 py-5 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 lg:w-[286px]">
          <div className="sticky top-24 overflow-hidden rounded-sm border border-[#101820]/20 bg-[#131921] shadow-sm">
            <div className="border-b border-white/10 bg-[#232f3e] px-5 py-5 text-white">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff9900]">Cookie market</p>
              <h2 className="mt-1 text-xl font-bold leading-tight">{title}</h2>
              <p className="mt-2 text-xs text-white/65">Central de operacao e acompanhamento.</p>
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
                        ? 'bg-[#ff9900] text-[#131921] font-bold shadow-sm' 
                        : 'text-white/78 hover:bg-white/10 hover:text-white'
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
          <div className="mb-4 rounded-sm border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#007185]">Painel</p>
                <h1 className="text-2xl font-bold tracking-tight text-[#111827]">{title}</h1>
              </div>
              <p className="text-sm text-gray-500">Dados em tempo real conectados ao Supabase.</p>
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
