import { useEffect, useState } from "react"
import { Search, Menu, ChevronDown, LogOut, ShieldCheck, Store, UserRound } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useCart } from "../contexts/CartContext"
import { supabase } from "../lib/supabase"
import { PlatformLogo } from "./PlatformLogo"

type HeaderSettings = {
  headerPromo: {
    enabled: boolean
    gifUrl: string
    text: string
    link: string
    backgroundColor: string
    textColor: string
  }
  topbarBackgroundColor: string
  topbarTextColor: string
  navBackgroundColor: string
  navTextColor: string
}

const defaultSettings: HeaderSettings = {
  headerPromo: {
    enabled: true,
    gifUrl: 'https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.19.1/mercadolibre/mplus-icon.svg',
    text: 'Ofertas e beneficios para compradores verificados',
    link: '/',
    backgroundColor: '#fff3c4',
    textColor: '#1f2937',
  },
  topbarBackgroundColor: '#fff3c4',
  topbarTextColor: '#1f2937',
  navBackgroundColor: '#ffe600',
  navTextColor: '#333333',
}

export function Header() {
  const { role, logout } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const [settings, setSettings] = useState<HeaderSettings>(defaultSettings)

  useEffect(() => {
    let mounted = true

    const loadSettings = async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('header_promo_json, header_topbar_bg_color, header_topbar_text_color, header_nav_bg_color, header_nav_text_color')
        .eq('id', 1)
        .maybeSingle()

      if (error || !mounted || !data) return

      setSettings({
        headerPromo: {
          enabled: data.header_promo_json?.enabled ?? true,
          gifUrl: data.header_promo_json?.gifUrl ?? '',
          text: data.header_promo_json?.text ?? '',
          link: data.header_promo_json?.link ?? '',
          backgroundColor: data.header_promo_json?.backgroundColor ?? defaultSettings.headerPromo.backgroundColor,
          textColor: data.header_promo_json?.textColor ?? defaultSettings.headerPromo.textColor,
        },
        topbarBackgroundColor: data.header_topbar_bg_color ?? defaultSettings.topbarBackgroundColor,
        topbarTextColor: data.header_topbar_text_color ?? defaultSettings.topbarTextColor,
        navBackgroundColor: data.header_nav_bg_color ?? defaultSettings.navBackgroundColor,
        navTextColor: data.header_nav_text_color ?? defaultSettings.navTextColor,
      })
    }

    const handleSettingsUpdated = () => {
      loadSettings().catch(console.error)
    }

    loadSettings().catch(console.error)
    window.addEventListener('platform-settings-updated', handleSettingsUpdated)

    return () => {
      mounted = false
      window.removeEventListener('platform-settings-updated', handleSettingsUpdated)
    }
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <header
      className="sticky top-0 z-40 shadow-[0_1px_0_rgba(0,0,0,0.08)]"
      style={{ backgroundColor: settings.navBackgroundColor, color: settings.navTextColor }}
    >
      <div
        className="border-b px-4"
        style={{ backgroundColor: settings.topbarBackgroundColor, color: settings.topbarTextColor, borderColor: 'rgba(0,0,0,0.08)' }}
      >
        <div className="mx-auto flex h-8 max-w-[1440px] items-center justify-between gap-4 text-[12px]">
          <div className="hidden items-center gap-2 md:flex">
            <ShieldCheck className="h-4 w-4 text-current" />
            <span>Compra segura com vendedores verificados</span>
          </div>
          {settings.headerPromo.enabled && settings.headerPromo.text && (
            <Link
              to={settings.headerPromo.link || '/'}
              className="ml-auto flex items-center gap-2 rounded-sm px-2 py-1 font-medium"
              style={{ backgroundColor: settings.headerPromo.backgroundColor, color: settings.headerPromo.textColor }}
            >
              {settings.headerPromo.gifUrl && <img src={settings.headerPromo.gifUrl} alt="" className="h-5 object-contain" />}
              <span className="truncate">{settings.headerPromo.text}</span>
            </Link>
          )}
        </div>
      </div>

      <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-3" style={{ color: settings.navTextColor }}>
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 md:gap-5">
          <Link to="/" className="flex min-w-0 flex-shrink-0 items-center font-bold text-xl tracking-tight" style={{ color: settings.navTextColor }}>
            <PlatformLogo fallbackClassName="text-xl" imageClassName="max-h-11" />
          </Link>

          <div className="relative min-w-0">
            <input
              type="text"
              placeholder="Buscar contas, BMs, perfis, proxies..."
              className="h-11 w-full rounded-sm border border-black/10 bg-[var(--layout-surface-background)] px-4 pr-12 text-sm text-[var(--layout-text-primary)] shadow-sm outline-none transition focus:border-[var(--layout-accent-color)] focus:ring-2 focus:ring-[var(--layout-accent-color)]"
            />
            <button className="absolute right-0 top-0 flex h-11 w-12 items-center justify-center rounded-r-sm border-l border-[var(--layout-border-color)] bg-[var(--layout-subtle-background)] text-[var(--layout-text-muted)] hover:bg-[var(--layout-surface-background)] hover:text-[var(--layout-link-color)]">
              <Search className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button className="relative hidden p-2 text-current transition-opacity hover:opacity-75 md:block" aria-label="Notificacoes">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <Link to="/carrinho" className="relative p-2 text-current transition-opacity hover:opacity-75" aria-label="Carrinho">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 text-sm">
          <div className="flex min-w-0 items-center gap-5 overflow-x-auto font-medium text-current/80 [&::-webkit-scrollbar]:hidden">
            <div className="group relative">
              <button className="flex items-center gap-1 whitespace-nowrap py-2 transition-opacity hover:opacity-75">
                <Menu className="h-4 w-4" /> Categorias <ChevronDown className="ml-0.5 h-3 w-3" />
              </button>

              <div className="invisible absolute left-0 top-full z-50 mt-0 w-52 overflow-hidden rounded-sm border border-[var(--layout-border-color)] bg-[var(--layout-surface-background)] text-[var(--layout-text-muted)] opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100">
                <div className="py-2">
                  <Link to="/category/google" className="block px-4 py-2 text-sm transition-colors hover:bg-[var(--layout-subtle-background)] hover:text-[var(--layout-link-color)]">Google Ads</Link>
                  <Link to="/category/meta" className="block px-4 py-2 text-sm transition-colors hover:bg-[var(--layout-subtle-background)] hover:text-[var(--layout-link-color)]">Meta Ads</Link>
                  <Link to="/category/tiktok" className="block px-4 py-2 text-sm transition-colors hover:bg-[var(--layout-subtle-background)] hover:text-[var(--layout-link-color)]">TikTok Ads</Link>
                  <div className="my-1 border-t border-[var(--layout-border-color)]" />
                  <Link to="/category/all" className="block px-4 py-2 text-sm font-medium text-[var(--layout-text-primary)] transition-colors hover:bg-[var(--layout-subtle-background)] hover:text-[var(--layout-link-color)]">Ver todas</Link>
                </div>
              </div>
            </div>

            <Link to="/ofertas" className="whitespace-nowrap py-2 transition-opacity hover:opacity-75">Ofertas do dia</Link>
            <Link to="/historico" className="hidden whitespace-nowrap py-2 transition-opacity hover:opacity-75 md:block">Historico</Link>
            {!role && (
              <Link to="/vender" className="hidden items-center gap-1 whitespace-nowrap py-2 transition-opacity hover:opacity-75 md:flex">
                <Store className="h-4 w-4" /> Vender
              </Link>
            )}
            <Link to="/contato" className="hidden whitespace-nowrap py-2 transition-opacity hover:opacity-75 md:block">Contato</Link>
            <Link to="/proxy" className="hidden whitespace-nowrap py-2 transition-opacity hover:opacity-75 md:block">Proxy</Link>
            <Link to="/smm" className="hidden whitespace-nowrap py-2 transition-opacity hover:opacity-75 md:block">SMM</Link>
          </div>

          <div className="hidden shrink-0 items-center gap-4 md:flex">
            {!role ? (
              <>
                <Link to="/cadastro" className="transition-opacity hover:opacity-75">Crie a sua conta</Link>
                <Link to="/login" className="inline-flex items-center gap-1 transition-opacity hover:opacity-75">
                  <UserRound className="h-4 w-4" /> Entre
                </Link>
              </>
            ) : (
              <>
                {role === 'user' && (
                  <>
                    <Link to="/painel/usuario/compras" className="transition-opacity hover:opacity-75">Minhas Compras</Link>
                    <Link to="/painel/usuario" className="font-medium transition-opacity hover:opacity-75">Meu Perfil</Link>
                  </>
                )}
                {role === 'seller' && (
                  <Link to="/painel/vendedor" className="font-medium transition-opacity hover:opacity-75">Painel do Vendedor</Link>
                )}
                {role === 'admin' && (
                  <Link to="/painel/admin" className="font-medium text-[var(--layout-header-account-link-color)] transition-opacity hover:opacity-75">Painel Admin</Link>
                )}
                <button onClick={handleLogout} className="flex items-center gap-1 text-[var(--layout-header-logout-color)] transition-opacity hover:opacity-75">
                  <LogOut className="h-3 w-3" /> Sair
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
