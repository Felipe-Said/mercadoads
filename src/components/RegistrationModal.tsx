import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import type { Product } from "./ProductCard"

interface RegistrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
}

export function RegistrationModal({ open, onOpenChange, product }: RegistrationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-ml-dark">Crie sua conta para comprar</DialogTitle>
          <DialogDescription>
            Para continuar com a compra de <span className="font-semibold text-ml-dark">{product?.title}</span>, você precisa se cadastrar na Mercado Ads.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">Nome completo</label>
            <Input id="name" placeholder="Ex: João da Silva" />
          </div>
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium">E-mail</label>
            <Input id="email" type="email" placeholder="Seu melhor e-mail" />
          </div>
          <div className="grid gap-2">
            <label htmlFor="phone" className="text-sm font-medium">WhatsApp</label>
            <Input id="phone" type="tel" placeholder="(11) 99999-9999" />
          </div>
          <div className="grid gap-2">
            <label htmlFor="password" className="text-sm font-medium">Senha</label>
            <Input id="password" type="password" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Button className="w-full bg-ml-blue hover:bg-ml-hover text-white py-6 text-lg font-semibold" onClick={() => onOpenChange(false)}>
            Criar conta e continuar
          </Button>
          <p className="text-center text-sm text-gray-500">
            Já tem uma conta? <a href="#" className="text-ml-blue hover:underline">Faça login</a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
