import { useEffect, useState } from "react"
import { Search, Menu, ChevronDown, LogOut, ShieldCheck, Store, UserRound } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useCart } from "../contexts/CartContext"
import { supabase } from "../lib/supabase"
import { PlatformLogo } from "./PlatformLogo"

type HeaderSettings = {
  headerPromo: { gifUrl: string; text: string; link: string }
}

export function Header() {
  const { role, logout } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const [settings, setSettings] = useState<HeaderSettings>({
    headerPromo: {
      gifUrl: 'https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.19.1/mercadolibre/mplus-icon.svg',
      text: 'Ofertas e beneficios para compradores verificados',
      link: '/',
    },
  })

  useEffect(() => {
    supabase
      .from('platform_settings')
      .select('header_promo_json')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) return
        setSettings({
          headerPromo: {
            gifUrl: data.header_promo_json?.gifUrl ?? '',
            text: data.header_promo_json?.text ?? '',
            link: data.header_promo_json?.link ?? '',
          },
        })
      })
      .catch(console.error)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <header className="sticky top-0 z-40 bg-ml-yellow text-ml-dark shadow-[0_1px_0_rgba(0,0,0,0.08)]">
      <div className="border-b border-black/5 bg-white/25 px-4">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between gap-4 text-[12px] text-black/70">
          <div className="hidden items-center gap-2 md:flex">
            <ShieldCheck className="h-4 w-4 text-ml-blue" />
            <span>Compra segura com vendedores verificados</span>
          </div>
          {settings.headerPromo.text && (
            <Link to={settings.headerPromo.link || '/'} className="ml-auto flex items-center gap-2 font-medium hover:text-black">
              {settings.headerPromo.gifUrl && <img src={settings.headerPromo.gifUrl} alt="" className="h-5 object-contain" />}
              <span className="truncate">{settings.headerPromo.text}</span>
            </Link>
          )}
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 md:gap-5">
          <Link to="/" className="flex min-w-0 flex-shrink-0 items-center font-bold text-xl tracking-tight">
            <PlatformLogo fallbackClassName="text-xl" imageClassName="max-h-11" />
          </Link>

          <div className="relative min-w-0">
            <input
              type="text"
              placeholder="Buscar contas, BMs, perfis, proxies..."
              className="h-11 w-full rounded-sm border border-black/10 bg-white px-4 pr-12 text-sm shadow-sm outline-none transition focus:border-ml-blue focus:ring-2 focus:ring-ml-blue/20"
            />
            <button className="absolute right-0 top-0 flex h-11 w-12 items-center justify-center rounded-r-sm border-l border-gray-200 bg-gray-50 text-gray-500 hover:bg-white hover:text-ml-blue">
              <Search className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button className="relative hidden p-2 text-ml-dark transition-colors hover:text-black/70 md:block" aria-label="Notificacoes">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <Link to="/carrinho" className="relative p-2 text-ml-dark transition-colors hover:text-black/70" aria-label="Carrinho">
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
          <div className="flex min-w-0 items-center gap-5 overflow-x-auto text-black/65 font-medium [&::-webkit-scrollbar]:hidden">
            <div className="relative group">
              <button className="flex whitespace-nowrap items-center gap-1 py-2 hover:text-black">
                <Menu className="w-4 h-4" /> Categorias <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>

              <div className="absolute left-0 top-full z-50 mt-0 w-52 overflow-hidden rounded-sm border border-gray-100 bg-white text-gray-600 opacity-0 shadow-lg transition-all duration-200 invisible group-hover:visible group-hover:opacity-100">
                <div className="py-2">
                  <Link to="/category/google" className="block px-4 py-2 text-sm hover:bg-ml-blue/10 hover:text-ml-blue transition-colors">Google Ads</Link>
                  <Link to="/category/meta" className="block px-4 py-2 text-sm hover:bg-ml-blue/10 hover:text-ml-blue transition-colors">Meta Ads</Link>
                  <Link to="/category/tiktok" className="block px-4 py-2 text-sm hover:bg-ml-blue/10 hover:text-ml-blue transition-colors">TikTok Ads</Link>
                  <div className="border-t border-gray-100 my-1" />
                  <Link to="/category/all" className="block px-4 py-2 text-sm hover:bg-ml-blue/10 hover:text-ml-blue transition-colors font-medium text-ml-dark">Ver todas</Link>
                </div>
              </div>
            </div>

            <Link to="/ofertas" className="whitespace-nowrap py-2 hover:text-black">Ofertas do dia</Link>
            <Link to="/historico" className="hidden whitespace-nowrap py-2 hover:text-black md:block">Historico</Link>
            {!role && (
              <Link to="/vender" className="hidden whitespace-nowrap py-2 hover:text-black md:flex items-center gap-1">
                <Store className="h-4 w-4" /> Vender
              </Link>
            )}
            <Link to="/contato" className="hidden whitespace-nowrap py-2 hover:text-black md:block">Contato</Link>
          </div>

          <div className="hidden shrink-0 items-center gap-4 md:flex">
            {!role ? (
              <>
                <Link to="/cadastro" className="hover:text-black">Crie a sua conta</Link>
                <Link to="/login" className="inline-flex items-center gap-1 hover:text-black">
                  <UserRound className="h-4 w-4" /> Entre
                </Link>
              </>
            ) : (
              <>
                {role === 'user' && (
                  <>
                    <Link to="/painel/usuario/compras" className="hover:text-black">Minhas Compras</Link>
                    <Link to="/painel/usuario" className="font-medium hover:text-black">Meu Perfil</Link>
                  </>
                )}
                {role === 'seller' && (
                  <Link to="/painel/vendedor" className="font-medium hover:text-black">Painel do Vendedor</Link>
                )}
                {role === 'admin' && (
                  <Link to="/painel/admin" className="font-medium text-ml-blue hover:text-black">Painel Admin</Link>
                )}
                <button onClick={handleLogout} className="flex items-center gap-1 text-red-500 transition-colors hover:text-red-600">
                  <LogOut className="w-3 h-3" /> Sair
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
