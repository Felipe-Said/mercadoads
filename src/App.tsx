import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { PlatformTheme } from './components/PlatformTheme'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Home } from './pages/Home'
import { Groups } from './pages/Groups'
import { Offers } from './pages/Offers'
import { History } from './pages/History'
import { SellerRegistration } from './pages/SellerRegistration'
import { Contact } from './pages/Contact'
import { Proxy } from './pages/Proxy'
import { SMM } from './pages/SMM'
import { NumeroVirtual } from './pages/NumeroVirtual'
import { EmailTemporario } from './pages/EmailTemporario'
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
    <div className="flex min-h-screen flex-col bg-[var(--layout-page-background)] text-[var(--layout-text-primary)]">
      <PlatformTheme />
      <Header />
      <main className="flex-grow pb-16 md:pb-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/ofertas" element={<Offers />} />
          <Route path="/historico" element={<History />} />
          <Route path="/vender" element={<SellerRegistration />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/proxy" element={<Proxy />} />
          <Route path="/smm" element={<SMM />} />
          <Route path="/numero-virtual" element={<NumeroVirtual />} />
          <Route path="/email-temporario" element={<EmailTemporario />} />
          <Route path="/category/:name" element={<Offers />} />
          <Route path="/produto/:id" element={<ProductPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/carrinho" element={<Cart />} />
          <Route path="/painel/usuario" element={<ProtectedRoute allowedRoles={['user']}><Resumo /></ProtectedRoute>} />
          <Route path="/painel/usuario/compras" element={<ProtectedRoute allowedRoles={['user']}><Compras /></ProtectedRoute>} />
          <Route path="/painel/usuario/configuracoes" element={<ProtectedRoute allowedRoles={['user']}><Configuracoes /></ProtectedRoute>} />
          <Route path="/painel/usuario/afiliacoes" element={<ProtectedRoute allowedRoles={['user']}><AfiliacoesUser /></ProtectedRoute>} />

          <Route path="/painel/vendedor" element={<ProtectedRoute allowedRoles={['seller']}><ResumoVendas /></ProtectedRoute>} />
          <Route path="/painel/vendedor/anuncios" element={<ProtectedRoute allowedRoles={['seller']}><MeusAnuncios /></ProtectedRoute>} />
          <Route path="/painel/vendedor/vendas" element={<ProtectedRoute allowedRoles={['seller']}><VendasEntregas /></ProtectedRoute>} />
          <Route path="/painel/vendedor/financeiro" element={<ProtectedRoute allowedRoles={['seller']}><Financeiro /></ProtectedRoute>} />
          <Route path="/painel/vendedor/ads" element={<ProtectedRoute allowedRoles={['seller']}><AdsManagerSeller /></ProtectedRoute>} />
          <Route path="/painel/vendedor/afiliados" element={<ProtectedRoute allowedRoles={['seller']}><AfiliadosSeller /></ProtectedRoute>} />
          <Route path="/painel/vendedor/configuracoes" element={<ProtectedRoute allowedRoles={['seller']}><Configuracoes /></ProtectedRoute>} />

          <Route path="/painel/admin" element={<ProtectedRoute allowedRoles={['admin']}><DashboardGlobal /></ProtectedRoute>} />
          <Route path="/painel/admin/usuarios" element={<ProtectedRoute allowedRoles={['admin']}><Usuarios /></ProtectedRoute>} />
          <Route path="/painel/admin/moderacao" element={<ProtectedRoute allowedRoles={['admin']}><Moderacao /></ProtectedRoute>} />
          <Route path="/painel/admin/configuracoes" element={<ProtectedRoute allowedRoles={['admin']}><Taxas /></ProtectedRoute>} />
          <Route path="/painel/admin/gateway" element={<ProtectedRoute allowedRoles={['admin']}><Gateway /></ProtectedRoute>} />
          <Route path="/painel/admin/ads" element={<ProtectedRoute allowedRoles={['admin']}><AdsManagerAdmin /></ProtectedRoute>} />
          <Route path="/painel/admin/personalizacao" element={<ProtectedRoute allowedRoles={['admin']}><Personalizacao /></ProtectedRoute>} />
          
          <Route path="/painel/admin/financeiro" element={<ProtectedRoute allowedRoles={['admin']}><FinanceiroAdmin /></ProtectedRoute>} />
          <Route path="/painel/admin/meus-anuncios" element={<ProtectedRoute allowedRoles={['admin']}><MeusAnunciosAdmin /></ProtectedRoute>} />
          <Route path="/painel/admin/entregas" element={<ProtectedRoute allowedRoles={['admin']}><VendasEntregasAdmin /></ProtectedRoute>} />
          <Route path="/painel/admin/perguntas" element={<ProtectedRoute allowedRoles={['admin']}><PerguntasAdmin /></ProtectedRoute>} />
          <Route path="/painel/admin/afiliados" element={<ProtectedRoute allowedRoles={['admin']}><AfiliadosAdmin /></ProtectedRoute>} />
          <Route path="/painel/admin/minha-conta" element={<ProtectedRoute allowedRoles={['admin']}><Configuracoes /></ProtectedRoute>} />
        </Routes>
      </main>
      
      {/* Simple Footer */}
      <footer className="hidden bg-[var(--layout-surface-background)] py-8 md:block">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mb-2 text-sm text-[var(--layout-text-muted)]">Trabalhe conosco Termos e condições Como cuidamos da sua privacidade Acessibilidade Contato</p>
          <p className="text-xs text-[var(--layout-text-muted)]">Copyright © 2026 Cookie market LTDA.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
