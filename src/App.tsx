import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { Home } from './pages/Home'
import { Groups } from './pages/Groups'
import { Offers } from './pages/Offers'
import { History } from './pages/History'
import { SellerRegistration } from './pages/SellerRegistration'
import { Contact } from './pages/Contact'
import { ProductPage } from './pages/ProductPage'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Cart } from './pages/Cart'
import { DashboardGlobal } from './pages/admin/DashboardGlobal'
import { Usuarios } from './pages/admin/Usuarios'
import { Moderacao } from './pages/admin/Moderacao'
import { Taxas } from './pages/admin/Taxas'
import { Gateway } from './pages/admin/Gateway'
import { AdsManagerAdmin } from './pages/admin/AdsManagerAdmin'
import { Personalizacao } from './pages/admin/Personalizacao'
import { FinanceiroAdmin } from './pages/admin/FinanceiroAdmin'
import { MeusAnunciosAdmin } from './pages/admin/MeusAnunciosAdmin'
import { VendasEntregasAdmin } from './pages/admin/VendasEntregasAdmin'
import { PerguntasAdmin } from './pages/admin/PerguntasAdmin'
import { AfiliadosAdmin } from './pages/admin/AfiliadosAdmin'

import { ResumoVendas } from './pages/seller/ResumoVendas'
import { MeusAnuncios } from './pages/seller/MeusAnuncios'
import { VendasEntregas } from './pages/seller/VendasEntregas'
import { Financeiro } from './pages/seller/Financeiro'
import { AdsManagerSeller } from './pages/seller/AdsManagerSeller'
import { AfiliadosSeller } from './pages/seller/AfiliadosSeller'

import { Resumo } from './pages/user/Resumo'
import { Compras } from './pages/user/Compras'
import { AfiliacoesUser } from './pages/user/AfiliacoesUser'
import { Configuracoes } from './pages/user/Configuracoes'

function App() {
  return (
    <div className="min-h-screen bg-[#ebebeb] flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/ofertas" element={<Offers />} />
          <Route path="/historico" element={<History />} />
          <Route path="/vender" element={<SellerRegistration />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/category/:name" element={<Offers />} />
          <Route path="/produto/:id" element={<ProductPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/carrinho" element={<Cart />} />
          <Route path="/painel/usuario" element={<Resumo />} />
          <Route path="/painel/usuario/compras" element={<Compras />} />
          <Route path="/painel/usuario/configuracoes" element={<Configuracoes />} />
          <Route path="/painel/usuario/afiliacoes" element={<AfiliacoesUser />} />

          <Route path="/painel/vendedor" element={<ResumoVendas />} />
          <Route path="/painel/vendedor/anuncios" element={<MeusAnuncios />} />
          <Route path="/painel/vendedor/vendas" element={<VendasEntregas />} />
          <Route path="/painel/vendedor/financeiro" element={<Financeiro />} />
          <Route path="/painel/vendedor/ads" element={<AdsManagerSeller />} />
          <Route path="/painel/vendedor/afiliados" element={<AfiliadosSeller />} />

          <Route path="/painel/admin" element={<DashboardGlobal />} />
          <Route path="/painel/admin/usuarios" element={<Usuarios />} />
          <Route path="/painel/admin/moderacao" element={<Moderacao />} />
          <Route path="/painel/admin/configuracoes" element={<Taxas />} />
          <Route path="/painel/admin/gateway" element={<Gateway />} />
          <Route path="/painel/admin/ads" element={<AdsManagerAdmin />} />
          <Route path="/painel/admin/personalizacao" element={<Personalizacao />} />
          
          <Route path="/painel/admin/financeiro" element={<FinanceiroAdmin />} />
          <Route path="/painel/admin/meus-anuncios" element={<MeusAnunciosAdmin />} />
          <Route path="/painel/admin/entregas" element={<VendasEntregasAdmin />} />
          <Route path="/painel/admin/perguntas" element={<PerguntasAdmin />} />
          <Route path="/painel/admin/afiliados" element={<AfiliadosAdmin />} />
        </Routes>
      </main>
      
      {/* Simple Footer */}
      <footer className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500 mb-2">Trabalhe conosco Termos e condições Como cuidamos da sua privacidade Acessibilidade Contato</p>
          <p className="text-xs text-gray-400">Copyright © 2026 Mercado Ads LTDA.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
