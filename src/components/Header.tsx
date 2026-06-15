import { type FormEvent, useEffect, useRef, useState } from "react"
import { Bell, Home, Search, Menu, ChevronDown, ChevronRight, LogOut, ShieldCheck, Store, UserRound, Zap, Smartphone } from "lucide-react"
import { Facebook, Google } from "iconsax-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useCart } from "../contexts/CartContext"
import { supabase } from "../lib/supabase"
import { DEFAULT_PLATFORM_SETTINGS, loadPlatformSettings, readCachedPlatformSettings } from "../lib/platformSettings"
import { PlatformLogo } from "./PlatformLogo"
import { formatCurrency, getProducts, recordProductSearch } from "../lib/data"
import { productTaxonomy, type ProductTaxonomyGroup } from "../lib/productTaxonomy"

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

type NotificationItem = {
  id: number
  type: string
  title: string
  body: string | null
  link_url: string | null
  metadata: Record<string, unknown> | null
  read_at: string | null
  created_at: string
}

const defaultSettings: HeaderSettings = {
  headerPromo: DEFAULT_PLATFORM_SETTINGS.headerPromo,
  topbarBackgroundColor: DEFAULT_PLATFORM_SETTINGS.topbarBackgroundColor,
  topbarTextColor: DEFAULT_PLATFORM_SETTINGS.topbarTextColor,
  navBackgroundColor: DEFAULT_PLATFORM_SETTINGS.navBackgroundColor,
  navTextColor: DEFAULT_PLATFORM_SETTINGS.navTextColor,
}

function getHeaderSettings(): HeaderSettings {
  const settings = readCachedPlatformSettings()
  if (!settings) return defaultSettings

  return {
    headerPromo: settings.headerPromo,
    topbarBackgroundColor: settings.topbarBackgroundColor,
    topbarTextColor: settings.topbarTextColor,
    navBackgroundColor: settings.navBackgroundColor,
    navTextColor: settings.navTextColor,
  }
}

function BrandMark({ brand }: { brand: ProductTaxonomyGroup['brand'] }) {
  if (brand === 'meta') {
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-[var(--layout-category-menu-icon-bg)] text-[#0866ff] shadow-sm ring-1 ring-black/10">
        <Facebook size="20" variant="Bold" color="currentColor" />
      </span>
    )
  }

  if (brand === 'google') {
    return (
      <span className="inline-grid h-8 w-8 place-items-center rounded-sm bg-[var(--layout-category-menu-icon-bg)] text-[#4285f4] shadow-sm ring-1 ring-black/10">
        <Google size="20" variant="Bold" color="currentColor" />
      </span>
    )
  }

  if (brand === 'shopify') {
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-[var(--layout-category-menu-icon-bg)] shadow-sm ring-1 ring-black/10">
        <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden="true">
          <path fill="#95BF47" d="M22.4 8.4c-.1-.1-.2-.1-.3-.1l-2.7-.2s-1.9-1.9-2.1-2.1c-.2-.2-.6-.1-.7 0l-1 .3c-.6-1.6-1.7-3-3.6-3.1h-.2c-.5-.6-1.1-.8-1.6-.8-4.1 0-6 5.1-6.6 7.7l-3.1 1c-.9.3-1 .3-1.1 1.2-.1.7-2.5 19-2.5 19L19.4 35l10.1-2.2S22.5 8.5 22.4 8.4Z" transform="translate(2 -2)" />
          <path fill="#5E8E3E" d="m24.1 10.3-2.7-.2s-1.9-1.9-2.1-2.1c-.1-.1-.2-.1-.3-.1L17.7 33l10.1-2.2s-3.5-20.4-3.7-20.5Z" transform="translate(2 -2)" />
          <path fill="#fff" d="M13.9 15.3 12.6 19s-1.1-.6-2.5-.6c-2 0-2.1 1.2-2.1 1.6 0 1.7 4.5 2.4 4.5 6.4 0 3.2-2 5.2-4.8 5.2-3.3 0-5-2.1-5-2.1l.9-2.9s1.7 1.5 3.2 1.5c1 0 1.4-.8 1.4-1.3 0-2.2-3.7-2.3-3.7-6 0-3.1 2.2-6.1 6.7-6.1 1.8 0 2.7.6 2.7.6Z" transform="translate(2 -2)" />
          <path fill="#fff" d="M12 4.9c1 .1 1.6 1.3 1.9 2.5l-2.4.7c.5-2 1.4-3.1 2.5-3.2Zm-1.6.3c.2 0 .4.1.6.2-1.4.7-2.2 2.4-2.6 3.6l-2 .6c.7-2.4 2-4.4 4-4.4Zm-2.2 4.2c-.3 1.2-.4 2.1-.4 2.1l-2.6.8s.5-2.2 1.6-4.2l1.4-.4Z" transform="translate(2 -2)" />
        </svg>
      </span>
    )
  }

  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-[var(--layout-category-menu-icon-bg)] shadow-sm ring-1 ring-black/10">
      <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden="true">
        <path fill="#25F4EE" d="M14.7 5.1h4.1c.2 2.1 1.5 4 3.4 4.9 1 .5 2 .8 3.1.8v4.1a9.4 9.4 0 0 1-5.9-2v8.3c0 4.2-3.4 7.6-7.6 7.6a7.6 7.6 0 0 1-4.5-13.7 7.6 7.6 0 0 1 5.1-1.3v4.3a3.4 3.4 0 1 0 2.3 3.2V5.1Z" />
        <path fill="#FE2C55" d="M16.2 5.1h2.6c.2 2.1 1.5 4 3.4 4.9 1 .5 2 .8 3.1.8v2.6a9.3 9.3 0 0 1-5.9-2v8.3c0 4.2-3.4 7.6-7.6 7.6a7.6 7.6 0 0 1-5.1-1.9 7.6 7.6 0 0 0 12.7-5.6v-8.3a9.3 9.3 0 0 0 5.9 2v-2.7a7.6 7.6 0 0 1-9.1-5.7Z" opacity=".9" />
        <path fill="#111827" d="M14.7 7.3h2.8c.4 3.3 2.6 6.1 5.7 7.2v2.9a11.4 11.4 0 0 1-5.2-1.7v6.2a5.6 5.6 0 1 1-5.6-5.6h.5v3a2.7 2.7 0 1 0 1.8 2.6V7.3Z" />
      </svg>
    </span>
  )
}

export function Header() {
  const { user, profile, role, logout } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [settings, setSettings] = useState<HeaderSettings>(getHeaderSettings)
  const [walletBalance, setWalletBalance] = useState(0)
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const categoryMenuRef = useRef<HTMLDivElement | null>(null)
  const notificationsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let mounted = true

    const loadSettings = async () => {
      const data = await loadPlatformSettings({ force: true })
      if (!mounted) return

      setSettings({
        headerPromo: data.headerPromo,
        topbarBackgroundColor: data.topbarBackgroundColor,
        topbarTextColor: data.topbarTextColor,
        navBackgroundColor: data.navBackgroundColor,
        navTextColor: data.navTextColor,
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

  useEffect(() => {
    if (!user) {
      setWalletBalance(0)
      return
    }

    let mounted = true

    const loadWalletBalance = async () => {
      if (role === 'user') {
        if (mounted) setWalletBalance(0)
        return
      }

      const [{ data: sales, error: salesError }, { data: withdrawals, error: withdrawalsError }] = await Promise.all([
        supabase
          .from('sales')
          .select('amount, claim_until')
          .eq('seller_id', user.id)
          .eq('status', 'paid'),
        supabase
          .from('withdrawals')
          .select('amount, status')
          .eq('user_id', user.id)
          .in('status', ['pending', 'paid']),
      ])

      if (salesError || withdrawalsError || !mounted) return

      const now = Date.now()
      const available = (sales ?? [])
        .filter((sale) => !sale.claim_until || new Date(sale.claim_until).getTime() <= now)
        .reduce((sum, sale) => sum + Number(sale.amount ?? 0), 0)
      const withdrawn = (withdrawals ?? []).reduce((sum, withdrawal) => sum + Number(withdrawal.amount ?? 0), 0)
      setWalletBalance(Math.max(available - withdrawn, 0))
    }

    loadWalletBalance().catch(console.error)

    return () => {
      mounted = false
    }
  }, [role, user])

  const loadNotifications = async () => {
    if (!user) {
      setNotifications([])
      return
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('id, type, title, body, link_url, metadata, read_at, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(12)

    if (error) {
      console.error(error)
      return
    }

    setNotifications((data ?? []) as NotificationItem[])
  }

  useEffect(() => {
    loadNotifications().catch(console.error)
  }, [user?.id])

  useEffect(() => {
    if (!categoryMenuOpen) return

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!categoryMenuRef.current?.contains(event.target as Node)) {
        setCategoryMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
    }
  }, [categoryMenuOpen])

  useEffect(() => {
    if (!notificationsOpen) return

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!notificationsRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
    }
  }, [notificationsOpen])

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = searchTerm.trim()
    if (!query) return

    try {
      const products = await getProducts()
      await recordProductSearch(query, products, user?.id)
    } catch (error) {
      console.error(error)
    }

    navigate(`/category/${encodeURIComponent(query)}`)
  }

  const markNotificationRead = async (notification: NotificationItem) => {
    if (notification.read_at) return
    await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', notification.id)
    setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item))
  }

  const openNotification = async (notification: NotificationItem) => {
    await markNotificationRead(notification)
    setNotificationsOpen(false)
    if (notification.link_url) navigate(notification.link_url)
  }

  const acceptAffiliateInvite = async (notification: NotificationItem) => {
    const affiliateId = Number(notification.metadata?.affiliate_id ?? 0)
    if (!affiliateId) return

    const { error } = await supabase
      .from('affiliates')
      .update({ status: 'active' })
      .eq('id', affiliateId)
      .eq('user_id', user?.id)
      .eq('status', 'pending')

    if (error) {
      console.error(error)
      return
    }

    await markNotificationRead(notification)
    await loadNotifications()
  }

  const firstName = profile?.full_name?.trim().split(/\s+/)[0] || user?.email?.split('@')[0] || 'usuario'
  const panelLink = role === 'admin' ? '/painel/admin' : role === 'seller' ? '/painel/vendedor' : '/painel/usuario'
  const panelLabel = role === 'admin' ? 'Painel Admin' : role === 'seller' ? 'Painel do Vendedor' : 'Meu Perfil'
  const unreadNotifications = notifications.filter((item) => !item.read_at).length
  const bottomItemClass = (href: string) => {
    const active = href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)
    return `flex flex-col items-center gap-1 rounded-sm px-1 py-1.5 text-[11px] font-semibold transition-colors ${active ? 'bg-[var(--layout-button-primary-bg)] text-[var(--layout-button-primary-text)]' : 'text-[var(--layout-text-muted)]'}`
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
        <div className="mx-auto flex min-h-8 max-w-[1440px] items-center justify-between gap-4 text-[12px]">
          <div className={`${settings.headerPromo.enabled && settings.headerPromo.text ? 'hidden md:flex' : 'flex'} min-w-0 items-center gap-2 md:flex`}>
            <ShieldCheck className="h-4 w-4 text-current" />
            <span className="truncate">Compra segura com vendedores verificados</span>
          </div>
          {settings.headerPromo.enabled && settings.headerPromo.text && (
            <Link
              to={settings.headerPromo.link || '/'}
              className="ml-auto flex min-w-0 items-center gap-2 rounded-sm px-2 py-1 font-medium"
              style={{ backgroundColor: settings.headerPromo.backgroundColor, color: settings.headerPromo.textColor }}
            >
              {settings.headerPromo.gifUrl && <img src={settings.headerPromo.gifUrl} alt="" className="h-5 flex-shrink-0 object-contain" />}
              <span className="truncate">{settings.headerPromo.text}</span>
            </Link>
          )}
        </div>
      </div>

      <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-3 py-2 md:px-4 md:py-3" style={{ color: settings.navTextColor }}>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 md:grid-cols-[auto_1fr_auto] md:gap-5">
          <Link to="/" className="flex min-w-0 flex-shrink-0 items-center font-bold text-xl tracking-tight" style={{ color: settings.navTextColor }}>
            <PlatformLogo fallbackClassName="text-xl" imageClassName="max-h-9 md:max-h-11" />
          </Link>

          <form onSubmit={handleSearchSubmit} className="relative order-3 col-span-2 min-w-0 md:order-none md:col-span-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar contas, BMs, perfis, proxies..."
              className="h-10 w-full rounded-sm border border-black/10 bg-[var(--layout-surface-background)] px-4 pr-12 text-[16px] text-[var(--layout-text-primary)] shadow-sm outline-none transition focus:border-[var(--layout-accent-color)] focus:ring-2 focus:ring-[var(--layout-accent-color)] md:h-11 md:text-sm"
            />
            <button type="submit" className="absolute right-0 top-0 flex h-10 w-12 items-center justify-center rounded-r-sm border-l border-[var(--layout-border-color)] bg-[var(--layout-subtle-background)] text-[var(--layout-text-muted)] hover:bg-[var(--layout-surface-background)] hover:text-[var(--layout-link-color)] md:h-11">
              <Search className="h-5 w-5" />
            </button>
          </form>

          <div className="order-2 flex items-center justify-end gap-2 md:order-none md:gap-3">
            {user && (
              <div ref={notificationsRef} className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen((current) => !current)
                    loadNotifications().catch(console.error)
                  }}
                  className="relative p-2 text-current transition-opacity hover:opacity-75"
                  aria-label="Notificacoes"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-[360px] overflow-hidden rounded-md border border-gray-200 bg-white text-[var(--layout-text-primary)] shadow-2xl">
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                      <p className="text-sm font-black">Notificacoes</p>
                      <button type="button" onClick={() => loadNotifications().catch(console.error)} className="text-xs font-semibold text-[var(--layout-link-color)]">Atualizar</button>
                    </div>
                    <div className="max-h-[420px] overflow-y-auto">
                      {notifications.length === 0 && <p className="px-4 py-6 text-center text-sm text-gray-500">Nenhuma notificacao no momento.</p>}
                      {notifications.map((notification) => (
                        <div key={notification.id} className={`border-b border-gray-100 px-4 py-3 last:border-b-0 ${notification.read_at ? 'bg-white' : 'bg-blue-50/60'}`}>
                          <button type="button" onClick={() => openNotification(notification)} className="block w-full text-left">
                            <p className="text-sm font-bold text-[var(--layout-text-primary)]">{notification.title}</p>
                            {notification.body && <p className="mt-1 text-xs leading-5 text-gray-600">{notification.body}</p>}
                            <p className="mt-2 text-[11px] text-gray-400">{new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(notification.created_at))}</p>
                          </button>
                          {notification.type === 'affiliate_invite' && !notification.read_at && (
                            <button
                              type="button"
                              onClick={() => acceptAffiliateInvite(notification)}
                              className="mt-3 rounded-sm bg-[var(--layout-button-primary-bg)] px-3 py-2 text-xs font-bold text-[var(--layout-button-primary-text)]"
                            >
                              Aceitar convite
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
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
          <div className="flex min-w-0 items-center gap-4 overflow-x-auto font-medium text-current/80 [scrollbar-width:none] md:gap-5 md:overflow-visible [&::-webkit-scrollbar]:hidden">
            <div ref={categoryMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setCategoryMenuOpen((current) => !current)}
                aria-expanded={categoryMenuOpen}
                className="flex items-center gap-1 whitespace-nowrap py-2 transition-opacity hover:opacity-75"
              >
                <Menu className="h-4 w-4" /> Categorias <ChevronDown className={`ml-0.5 h-3 w-3 transition-transform ${categoryMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoryMenuOpen && (
                <div className="fixed inset-x-3 top-[126px] z-50 max-h-[70vh] overflow-y-auto rounded-sm border bg-[var(--layout-category-menu-bg)] text-[var(--layout-category-menu-text)] shadow-2xl md:absolute md:inset-auto md:left-0 md:top-full md:mt-1 md:w-[min(92vw,860px)]" style={{ borderColor: 'var(--layout-category-menu-border)' }}>
                  <div className="border-b px-3 py-2" style={{ backgroundColor: 'var(--layout-category-menu-header-bg)', borderColor: 'var(--layout-category-menu-border)' }}>
                    <p className="text-[13px] font-black">Categorias</p>
                    <p className="text-[11px] text-[var(--layout-category-menu-muted-text)]">Ativos organizados por plataforma.</p>
                  </div>
                  <div className="grid gap-0 md:grid-cols-4">
                    {productTaxonomy.map((group) => (
                      <div key={group.brand} className="border-b p-3 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0" style={{ borderColor: 'var(--layout-category-menu-border)' }}>
                        <div className="mb-2 flex items-center gap-2">
                          <BrandMark brand={group.brand} />
                          <div>
                            <p className="text-sm font-black leading-tight">{group.label}</p>
                            <Link
                              to={`/category/${encodeURIComponent(group.label.toLowerCase())}`}
                              onClick={() => setCategoryMenuOpen(false)}
                              className="text-[11px] font-semibold text-[var(--layout-category-menu-link)] hover:text-[var(--layout-category-menu-hover-text)]"
                            >
                              Ver tudo
                            </Link>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {group.items.map((section) => (
                            <div key={section.label}>
                              <div className="mb-1 flex items-center justify-between text-[10px] font-black uppercase text-[var(--layout-category-menu-muted-text)]">
                                <span>{section.label}</span>
                                <ChevronRight className="h-3 w-3" />
                              </div>
                              <div className="space-y-0.5">
                                {section.children.map((item) => (
                                  <Link
                                    key={item.value}
                                    to={`/category/${encodeURIComponent(item.value.toLowerCase())}`}
                                    onClick={() => setCategoryMenuOpen(false)}
                                    className="block rounded-sm px-2 py-1.5 text-xs font-semibold text-[var(--layout-category-menu-text)] transition hover:bg-[var(--layout-category-menu-hover-bg)] hover:text-[var(--layout-category-menu-hover-text)]"
                                  >
                                    {item.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t px-3 py-2" style={{ backgroundColor: 'var(--layout-category-menu-header-bg)', borderColor: 'var(--layout-category-menu-border)' }}>
                    <Link
                      to="/category/all"
                      onClick={() => setCategoryMenuOpen(false)}
                      className="text-xs font-black text-[var(--layout-category-menu-link)] hover:text-[var(--layout-category-menu-hover-text)]"
                    >
                      Ver todas as categorias
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link to="/ofertas" className="whitespace-nowrap py-2 transition-opacity hover:opacity-75">Ofertas do dia</Link>
            <Link to="/historico" className="whitespace-nowrap py-2 transition-opacity hover:opacity-75">Historico</Link>
            {!role && (
              <Link to="/vender" className="hidden items-center gap-1 whitespace-nowrap py-2 transition-opacity hover:opacity-75 md:flex">
                <Store className="h-4 w-4" /> Vender
              </Link>
            )}
            <Link to="/contato" className="whitespace-nowrap py-2 transition-opacity hover:opacity-75">Contato</Link>
            <Link to="/proxy" className="whitespace-nowrap py-2 transition-opacity hover:opacity-75">Proxy</Link>
            <Link to="/smm" className="whitespace-nowrap py-2 transition-opacity hover:opacity-75">SMM</Link>
            <Link to="/numero-virtual" className="whitespace-nowrap py-2 transition-opacity hover:opacity-75">Numero virtual</Link>
            <Link to="/email-temporario" className="whitespace-nowrap py-2 transition-opacity hover:opacity-75">Email temporario</Link>
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
              <div className="flex items-center gap-3">
                <Link to={panelLink} className="font-medium text-[var(--layout-header-account-link-color)] transition-opacity hover:opacity-75">{panelLabel}</Link>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 overflow-hidden rounded-full border border-white/30 bg-white/20">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-bold uppercase">
                        {firstName.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <span className="max-w-[140px] truncate font-medium">Ola, {firstName}</span>
                </div>
                <div className="rounded-sm border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold shadow-sm">
                  <span className="mr-1 opacity-75">Carteira</span>
                  <span>{formatCurrency(walletBalance)}</span>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-1 text-[var(--layout-header-logout-color)] transition-opacity hover:opacity-75">
                  <LogOut className="h-3 w-3" /> Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-[var(--layout-surface-background)] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 text-[var(--layout-text-muted)] shadow-[0_-8px_24px_rgba(15,23,42,0.12)] md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          <Link to="/" className={bottomItemClass('/')}>
            <Home className="h-5 w-5" />
            Home
          </Link>
          <Link to="/ofertas" className={bottomItemClass('/ofertas')}>
            <Zap className="h-5 w-5" />
            Ofertas
          </Link>
          <Link to="/proxy" className={bottomItemClass('/proxy')}>
            <ShieldCheck className="h-5 w-5" />
            Proxy
          </Link>
          <Link to="/numero-virtual" className={bottomItemClass('/numero-virtual')}>
            <Smartphone className="h-5 w-5" />
            Numero
          </Link>
          <Link to={role ? panelLink : '/login'} className={bottomItemClass(role ? panelLink : '/login')}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" />
            ) : (
              <UserRound className="h-5 w-5" />
            )}
            {role ? 'Perfil' : 'Entrar'}
          </Link>
        </div>
      </nav>
    </header>
  )
}
