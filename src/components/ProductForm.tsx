import React, { useState } from 'react'
import { Button } from './ui/button'
import { supabase } from '../lib/supabase'
import { productCategoryOptions } from '../lib/productTaxonomy'

export type ProductStatus = 'draft' | 'active' | 'paused' | 'rejected'

type ProductFormProps = {
  sellerId: string
  defaultStatus: ProductStatus
  showStatus?: boolean
  onCreated: () => Promise<void> | void
}

export function ProductForm({ sellerId, defaultStatus, showStatus = false, onCreated }: ProductFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [category, setCategory] = useState(productCategoryOptions[0]?.value ?? '')
  const [imageUrl, setImageUrl] = useState('')
  const [stock, setStock] = useState('')
  const [allowAffiliates, setAllowAffiliates] = useState(false)
  const [defaultCommission, setDefaultCommission] = useState('0')
  const [status, setStatus] = useState<ProductStatus>(defaultStatus)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setPrice('')
    setOriginalPrice('')
    setCategory(productCategoryOptions[0]?.value ?? '')
    setImageUrl('')
    setStock('')
    setAllowAffiliates(false)
    setDefaultCommission('0')
    setStatus(defaultStatus)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage(null)
    setLoading(true)

    const { error } = await supabase.from('products').insert({
      seller_id: sellerId,
      title,
      description: description || null,
      price: Number(price),
      original_price: originalPrice ? Number(originalPrice) : null,
      image_url: imageUrl || null,
      category,
      delivery_type: 'Entrega digital na plataforma',
      stock: stock ? Number(stock) : 0,
      allow_affiliates: allowAffiliates,
      default_commission: Number(defaultCommission || 0),
      status,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    resetForm()
    await onCreated()
    setMessage(status === 'active' ? 'Anuncio publicado.' : 'Anuncio enviado para moderacao.')
    setLoading(false)
  }

  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Titulo do produto</label>
        <input value={title} onChange={(event) => setTitle(event.target.value)} required className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue" />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Descricao</label>
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue resize-y" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Preco</label>
        <input type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Preco original</label>
        <input type="number" min="0" step="0.01" value={originalPrice} onChange={(event) => setOriginalPrice(event.target.value)} className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full h-10 px-3 border border-gray-300 rounded-sm bg-white focus:outline-none focus:border-ml-blue">
          {productCategoryOptions.map((item) => <option key={item.value} value={item.value}>{item.value}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Estoque</label>
        <input type="number" min="0" value={stock} onChange={(event) => setStock(event.target.value)} className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue" />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">URL da imagem</label>
        <input type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://..." className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Comissao padrao (%)</label>
        <input type="number" min="0" max="100" value={defaultCommission} onChange={(event) => setDefaultCommission(event.target.value)} className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue" />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={allowAffiliates} onChange={(event) => setAllowAffiliates(event.target.checked)} />
        Permitir afiliados
      </label>

      {showStatus && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select value={status} onChange={(event) => setStatus(event.target.value as ProductStatus)} className="w-full h-10 px-3 border border-gray-300 rounded-sm bg-white focus:outline-none focus:border-ml-blue">
            <option value="active">Ativo</option>
            <option value="draft">Rascunho / moderacao</option>
            <option value="paused">Pausado</option>
          </select>
        </div>
      )}

      <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
        {message && <span className={`text-sm ${message.includes('Anuncio') ? 'text-green-600' : 'text-red-600'}`}>{message}</span>}
        <Button type="submit" disabled={loading} className="rounded-sm">
          {loading ? 'Salvando...' : 'Salvar anuncio'}
        </Button>
      </div>
    </form>
  )
}
