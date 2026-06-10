import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { createWestPayPixInOrThrow, ensureWestPayReady } from '../lib/westpay'

export function Cart() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { cart, removeFromCart, updateQuantity, totalItems, clearCart } = useCart()
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)
  const total = subtotal

  const handleContinuePurchase = async () => {
    if (checkoutLoading) return

    if (!user) {
      navigate('/login', { state: { from: '/carrinho' } })
      return
    }

    if (cart.length === 0) return

    setCheckoutLoading(true)
    setCheckoutError(null)
    const createdSaleIds: string[] = []

    try {
      await ensureWestPayReady()

      const productIds = cart.map((item) => item.id)
      const { data: products, error } = await supabase
        .from('products')
        .select('id, title, price, seller_id, status, hidden_by_admin')
        .in('id', productIds)

      if (error) throw error

      const productMap = new Map((products ?? []).map((product) => [Number(product.id), product]))
      const missingIds = productIds.filter((id) => !productMap.has(id))
      if (missingIds.length > 0) {
        throw new Error('Alguns produtos do carrinho nao estao mais disponiveis.')
      }

      for (const item of cart) {
        const product = productMap.get(item.id)
        if (!product) continue

        const amount = Number(product.price ?? item.price) * item.quantity
        const { data: saleData, error: saleError } = await supabase.from('sales').insert({
          product_id: product.id,
          buyer_id: user.id,
          seller_id: product.seller_id,
          amount,
          status: 'pending',
        }).select('id').single()

        if (saleError) throw saleError

        const saleId = saleData?.id ? String(saleData.id) : null
        if (!saleId) throw new Error('Nao foi possivel gerar o pedido.')
        createdSaleIds.push(saleId)

        await createWestPayPixInOrThrow({
          saleId,
          amount,
          customer: {
            name: profile?.full_name ?? user.user_metadata?.full_name ?? user.email ?? 'Cliente',
            email: user.email ?? '',
            phone: profile?.phone ?? null,
          },
          itemTitle: product.title,
        })
      }

      await clearCart()
      navigate('/painel/usuario/compras', { state: { checkoutSaleIds: createdSaleIds } })
    } catch (err) {
      if (createdSaleIds.length > 0) {
        await supabase.from('sales').delete().in('id', createdSaleIds)
      }
      setCheckoutError(err instanceof Error ? err.message : 'Nao foi possivel concluir a compra.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#ebebeb]">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Carrinho ({totalItems})</h1>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-md shadow-sm p-12 text-center flex flex-col items-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-medium text-gray-800 mb-2">Seu carrinho está vazio</h2>
            <p className="text-gray-500 mb-6">Produtos digitais prontos para entrega dentro da plataforma.</p>
            <Link to="/" className="bg-ml-blue text-white px-6 py-3 rounded-md font-semibold hover:bg-ml-hover transition-colors">
              Descobrir ofertas
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Produtos */}
            <div className="flex-grow space-y-4">
              <div className="bg-white rounded-md shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between text-sm text-gray-500 font-medium bg-gray-50/50">
                  <span>Produtos</span>
                  <span className="hidden md:block">Quantidade</span>
                  <span className="hidden md:block">Preço</span>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {cart.map((item) => (
                    <div key={item.id} className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-50 rounded-md p-2 flex items-center justify-center border border-gray-100">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="text-base text-gray-800 font-medium mb-1 line-clamp-2">{item.title}</h3>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-ml-blue text-sm font-medium hover:underline flex items-center gap-1 mt-2"
                        >
                          <Trash2 className="w-3 h-3" /> Excluir
                        </button>
                      </div>

                      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:w-64 justify-end">
                        {/* Seletor de Quantidade */}
                        <div className="flex items-center border border-gray-200 rounded-md h-10 w-28 bg-white">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-full flex items-center justify-center text-ml-blue disabled:text-gray-300 hover:bg-gray-50 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="flex-grow text-center text-sm font-medium text-gray-700">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-full flex items-center justify-center text-ml-blue hover:bg-gray-50 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Preço */}
                        <div className="text-right w-24 flex-shrink-0">
                          <div className="text-xl font-medium text-gray-800">
                            R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-xs text-gray-500 mt-1">
                              R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} un.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
              </div>
            </div>

            {/* Resumo da Compra */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-white rounded-md shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-medium text-gray-800 mb-6">Resumo da compra</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Produtos ({totalItems})</span>
                    <span>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mb-6 flex justify-between items-end">
                  <span className="text-gray-800 font-medium">Total</span>
                  <span className="text-2xl font-medium text-gray-800">
                    R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {checkoutError && <p className="text-sm text-red-600 mb-3">{checkoutError}</p>}
                <button
                  type="button"
                  onClick={handleContinuePurchase}
                  disabled={checkoutLoading}
                  className="w-full bg-ml-blue text-white py-3.5 rounded-md font-semibold hover:bg-ml-hover transition-colors shadow-sm disabled:opacity-60"
                >
                  {checkoutLoading ? 'Processando...' : 'Continuar a compra'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
