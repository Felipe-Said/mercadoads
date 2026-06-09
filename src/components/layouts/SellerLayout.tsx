import React from 'react'
import { DashboardLayout, NavItem } from '../DashboardLayout'
import { Store, DollarSign, PackageOpen, Tag, Megaphone, Users } from 'lucide-react'

const NAV_ITEMS: NavItem[] = [
  { title: "Resumo de Vendas", href: "/painel/vendedor", icon: Store },
  { title: "Meus Anúncios", href: "/painel/vendedor/anuncios", icon: Tag },
  { title: "Vendas e Entregas", href: "/painel/vendedor/vendas", icon: PackageOpen },
  { title: "Meus Afiliados", href: "/painel/vendedor/afiliados", icon: Users },
  { title: "Financeiro", href: "/painel/vendedor/financeiro", icon: DollarSign },
  { title: "Ads Manager", href: "/painel/vendedor/ads", icon: Megaphone },
]

export function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Painel do Vendedor">
      {children}
    </DashboardLayout>
  )
}
