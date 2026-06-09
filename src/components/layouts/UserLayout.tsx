import React from 'react'
import { DashboardLayout, NavItem } from '../DashboardLayout'
import { ShoppingBag, User, Settings, Megaphone } from 'lucide-react'

const NAV_ITEMS: NavItem[] = [
  { title: "Resumo", href: "/painel/usuario", icon: User },
  { title: "Compras", href: "/painel/usuario/compras", icon: ShoppingBag },
  { title: "Afiliações", href: "/painel/usuario/afiliacoes", icon: Megaphone },
  { title: "Configurações", href: "/painel/usuario/configuracoes", icon: Settings },
]

export function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Meu Perfil">
      {children}
    </DashboardLayout>
  )
}
