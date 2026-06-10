import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../lib/supabase"
import type { Product } from "../lib/data"
import { createWestPayPixIn } from "../lib/westpay"

interface RegistrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
}

type AuthMode = "register" | "login"

export function RegistrationModal({ open, onOpenChange, product }: RegistrationModalProps) {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<AuthMode>("register")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const createPendingPurchase = async (buyerId: string) => {
    if (!product) throw new Error("Produto indisponivel.")

    const { data: saleData, error: saleError } = await supabase.from("sales").insert({
      product_id: Number(product.id),
      buyer_id: buyerId,
      seller_id: product.seller_id,
      amount: product.price,
      status: "pending",
    }).select('id').single()

    if (saleError) throw saleError

    return saleData?.id ? String(saleData.id) : null
  }

  const getCurrentUserId = async () => {
    const { data, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError
    return data.user?.id ?? null
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === "register") {
        await signUp(fullName, email, password, "user")
        const { data: sessionData } = await supabase.auth.getSession()
        if (!sessionData.session?.user) {
          setError("Conta criada. Confirme seu e-mail para continuar.")
          return
        }
      } else {
        await signIn(email, password)
      }

      const userId = await getCurrentUserId()
      if (!userId) {
        throw new Error("Nao foi possivel confirmar a sessao. Tente entrar com sua conta.")
      }

      if (mode === "register" && phone.trim()) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ phone: phone.trim() })
          .eq("id", userId)

        if (profileError) throw profileError
      }

      const saleId = await createPendingPurchase(userId)
      if (saleId) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("id", userId)
          .maybeSingle()

        await createWestPayPixIn({
          saleId,
          amount: product?.price ?? 0,
          customer: {
            name: (profileData?.full_name as string | null) ?? fullName ?? email,
            email,
            phone: (profileData?.phone as string | null) ?? (phone.trim() || null),
          },
          itemTitle: product?.title ?? "Produto",
        })
      }

      onOpenChange(false)
      navigate("/painel/usuario/compras")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel continuar a compra.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-ml-dark">
            {mode === "register" ? "Crie sua conta para comprar" : "Entre para continuar"}
          </DialogTitle>
          <DialogDescription>
            {mode === "register" ? "Cadastre-se" : "Entre"} para continuar com a compra de{" "}
            <span className="font-semibold text-ml-dark">{product?.title}</span>.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4 py-4" onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="grid gap-2">
              <label htmlFor="checkout-name" className="text-sm font-medium">Nome completo</label>
              <Input id="checkout-name" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Ex: Joao da Silva" required />
            </div>
          )}

          <div className="grid gap-2">
            <label htmlFor="checkout-email" className="text-sm font-medium">E-mail</label>
            <Input id="checkout-email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Seu melhor e-mail" required />
          </div>

          {mode === "register" && (
            <div className="grid gap-2">
              <label htmlFor="checkout-phone" className="text-sm font-medium">WhatsApp</label>
              <Input id="checkout-phone" value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" placeholder="(11) 99999-9999" />
            </div>
          )}

          <div className="grid gap-2">
            <label htmlFor="checkout-password" className="text-sm font-medium">Senha</label>
            <Input id="checkout-password" value={password} onChange={(event) => setPassword(event.target.value)} type="password" minLength={6} required />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full bg-ml-blue hover:bg-ml-hover text-white py-6 text-lg font-semibold">
            {loading ? "Processando..." : mode === "register" ? "Criar conta e continuar" : "Entrar e continuar"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500">
          {mode === "register" ? "Ja tem uma conta?" : "Ainda nao tem conta?"}{" "}
          <button
            type="button"
            className="text-ml-blue hover:underline"
            onClick={() => {
              setError(null)
              setMode((current) => current === "register" ? "login" : "register")
            }}
          >
            {mode === "register" ? "Faca login" : "Criar conta"}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  )
}
