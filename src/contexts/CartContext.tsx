/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

export interface CartItem {
  id: number
  title: string
  price: number
  image: string
  quantity: number
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: CartItem) => Promise<void>
  removeFromCart: (id: number) => Promise<void>
  clearCart: () => Promise<void>
  totalItems: number
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: async () => {},
  removeFromCart: async () => {},
  clearCart: async () => {},
  totalItems: 0,
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [cart, setCart] = useState<CartItem[]>([])

  const loadCart = useCallback(async () => {
    if (!user) {
      setCart([])
      return
    }

    const { data, error } = await supabase
      .from('cart_items')
      .select('product_id, quantity, products(title, price, image_url)')
      .eq('user_id', user.id)

    if (error) throw error

    setCart((data ?? []).map((item) => {
      const product = Array.isArray(item.products) ? item.products[0] : item.products
      return {
        id: Number(item.product_id),
        title: product?.title ?? 'Produto indisponivel',
        price: Number(product?.price ?? 0),
        image: product?.image_url ?? '',
        quantity: Number(item.quantity ?? 1),
      }
    }))
  }, [user])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadCart().catch(console.error)
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [loadCart])

  const addToCart = useCallback(async (newItem: CartItem) => {
    if (!user) {
      setCart((prev) => {
        const existing = prev.find((item) => item.id === newItem.id)
        if (existing) {
          return prev.map((item) => item.id === newItem.id ? { ...item, quantity: item.quantity + newItem.quantity } : item)
        }
        return [...prev, newItem]
      })
      return
    }

    const existing = cart.find((item) => item.id === newItem.id)
    const quantity = (existing?.quantity ?? 0) + newItem.quantity

    const { error } = await supabase
      .from('cart_items')
      .upsert({ user_id: user.id, product_id: newItem.id, quantity, updated_at: new Date().toISOString() }, { onConflict: 'user_id,product_id' })

    if (error) throw error
    await loadCart()
  }, [cart, loadCart, user])

  const removeFromCart = useCallback(async (id: number) => {
    if (user) {
      const { error } = await supabase.from('cart_items').delete().eq('user_id', user.id).eq('product_id', id)
      if (error) throw error
    }
    setCart((prev) => prev.filter((item) => item.id !== id))
  }, [user])

  const clearCart = useCallback(async () => {
    if (user) {
      const { error } = await supabase.from('cart_items').delete().eq('user_id', user.id)
      if (error) throw error
    }
    setCart([])
  }, [user])

  const value = useMemo(() => ({
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    totalItems: cart.reduce((acc, item) => acc + item.quantity, 0),
  }), [addToCart, cart, clearCart, removeFromCart])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
