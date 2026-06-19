import React from 'react'
import { DashboardLayout, NavItem } from '../DashboardLayout'
import { Shield, Users, Activity, Settings, CreditCard, Megaphone, Paintbrush, Tag, PackageOpen, MessageSquare, DollarSign, ShoppingBag } from 'lucide-react'

const NAV_ITEMS: NavItem[] = [
  // Platform Management
  { title: "Dashboard Global", href: "/painel/admin", icon: Activity },
  { title: "Usuários", href: "/painel/admin/usuarios", icon: Users },
  { title: "Moderação", href: "/painel/admin/moderacao", icon: Shield },
  { title: "Gestão Financeira", href: "/painel/admin/financeiro", icon: DollarSign },
  { title: "Taxas e Plataforma", href: "/painel/admin/configuracoes", icon: Settings },
  { title: "Gateway", href: "/painel/admin/gateway", icon: CreditCard },
  { title: "Ads Manager", href: "/painel/admin/ads", icon: Megaphone },
  { title: "Personalização", href: "/painel/admin/personalizacao", icon: Paintbrush },
  
  // Admin as Seller / User
  { title: "Meus Anúncios", href: "/painel/admin/meus-anuncios", icon: Tag },
  { title: "Vendas e Entregas", href: "/painel/admin/entregas", icon: PackageOpen },
  { title: "Minhas Compras", href: "/painel/usuario/compras", icon: ShoppingBag },
  { title: "Meus Afiliados", href: "/painel/admin/afiliados", icon: Users },
  { title: "Central de Perguntas", href: "/painel/admin/perguntas", icon: MessageSquare },
  { title: "Minha Conta", href: "/painel/admin/minha-conta", icon: Settings },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Painel de Administração">
      {children}
    </DashboardLayout>
  )
}
