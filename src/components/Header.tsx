import { useEffect, useState } from "react"
import { Search, Menu, ChevronDown, LogOut } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useCart } from "../contexts/CartContext"
import { supabase } from "../lib/supabase"

type HeaderSettings = {
  logoUrl: string
  logoDesktopSize: number
  logoMobileSize: number
  headerPromo: { gifUrl: string; text: string; link: string }
}

export function Header() {
  const { role, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate()
  const [settings, setSettings] = useState<HeaderSettings>({
    logoUrl: '',
    logoDesktopSize: 130,
    logoMobileSize: 80,
    headerPromo: {
      gifUrl: 'https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.19.1/mercadolibre/mplus-icon.svg',
      text: 'Assine o Meli+',
      link: '/meliplus',
    },
  })

  useEffect(() => {
    supabase
      .from('platform_settings')
      .select('logo_url, logo_desktop_size, logo_mobile_size, header_promo_json')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) return
        setSettings({
          logoUrl: data.logo_url ?? '',
          logoDesktopSize: Number(data.logo_desktop_size ?? 130),
          logoMobileSize: Number(data.logo_mobile_size ?? 80),
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
    <header className="bg-ml-yellow text-ml-dark py-2 px-4 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* Top Row: Logo & Search */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex-shrink-0 flex items-center font-bold text-xl tracking-tight cursor-pointer">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Mercado Ads"
                className="object-contain max-h-12"
                style={{ width: `clamp(${settings.logoMobileSize}px, 12vw, ${settings.logoDesktopSize}px)` }}
              />
            ) : (
              <>
                <span className="text-ml-blue mr-1">Mercado</span>
                <span>Ads</span>
              </>
            )}
          </Link>
          
          <div className="flex-grow max-w-2xl relative">
            <input 
              type="text" 
              placeholder="Buscar contas de anúncio, BMs, perfis..." 
              className="w-full h-10 px-4 py-2 rounded-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ml-blue text-sm border-none"
            />
            <button className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center text-gray-500 border-l">
              <Search className="w-5 h-5" />
            </button>
          </div>
          
          {settings.headerPromo.text && (
            <div className="hidden md:flex items-center text-sm font-medium gap-6 ml-auto">
              <Link to={settings.headerPromo.link || '/'} className="flex items-center gap-2 cursor-pointer hover:text-black/70">
                {settings.headerPromo.gifUrl && <img src={settings.headerPromo.gifUrl} alt="" className="h-6 object-contain" />}
                <span>{settings.headerPromo.text}</span>
              </Link>
            </div>
          )}
        </div>

        {/* Bottom Row: Nav Links */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-black/60 font-medium">
            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-black/80 py-2">
                <Menu className="w-4 h-4" /> Categorias <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute left-0 top-full mt-0 w-48 bg-white text-gray-600 rounded-sm shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                <div className="py-2">
                  <Link to="/category/google" className="block px-4 py-2 text-sm hover:bg-ml-blue/10 hover:text-ml-blue transition-colors">Google Ads</Link>
                  <Link to="/category/meta" className="block px-4 py-2 text-sm hover:bg-ml-blue/10 hover:text-ml-blue transition-colors">Meta Ads</Link>
                  <Link to="/category/tiktok" className="block px-4 py-2 text-sm hover:bg-ml-blue/10 hover:text-ml-blue transition-colors">TikTok Ads</Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <Link to="/category/all" className="block px-4 py-2 text-sm hover:bg-ml-blue/10 hover:text-ml-blue transition-colors font-medium text-ml-dark">Ver todas</Link>
                </div>
              </div>
            </div>
            
            <Link to="/ofertas" className="hidden md:block hover:text-black/80 py-2">Ofertas do dia</Link>
            <Link to="/historico" className="hidden md:block hover:text-black/80 py-2">Histórico</Link>
            {!role && (
              <Link to="/vender" className="hidden md:block hover:text-black/80 py-2">Vender</Link>
            )}
            <Link to="/contato" className="hidden md:block hover:text-black/80 py-2">Contato</Link>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="hidden md:flex items-center gap-4">
              {!role ? (
                <>
                  <Link to="/cadastro" className="hover:text-black/80">Crie a sua conta</Link>
                  <Link to="/login" className="hover:text-black/80">Entre</Link>
                </>
              ) : (
                <>
                  {role === 'user' && (
                    <>
                      <Link to="/painel/usuario/compras" className="hover:text-black/80">Minhas Compras</Link>
                      <Link to="/painel/usuario" className="hover:text-black/80 font-medium">Meu Perfil</Link>
                    </>
                  )}
                  {role === 'seller' && (
                    <Link to="/painel/vendedor" className="hover:text-black/80 font-medium">Painel do Vendedor</Link>
                  )}
                  {role === 'admin' && (
                    <Link to="/painel/admin" className="hover:text-black/80 font-medium text-ml-blue">Painel Admin</Link>
                  )}
                  <button onClick={handleLogout} className="hover:text-black/80 flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors">
                    <LogOut className="w-3 h-3" /> Sair
                  </button>
                </>
              )}
            </div>
            <button className="relative p-1 text-ml-dark hover:text-black/70 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <Link to="/carrinho" className="relative p-1 text-ml-dark hover:text-black/70 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
