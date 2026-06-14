import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { supabase } from '../lib/supabase'
import { productCategoryOptions } from '../lib/productTaxonomy'
import { ImagePlus } from 'lucide-react'

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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [stock, setStock] = useState('')
  const [deliveryMethod, setDeliveryMethod] = useState<'ready' | 'dropservice'>('ready')
  const [profileHandle, setProfileHandle] = useState('')
  const [accountEmail, setAccountEmail] = useState('')
  const [accountPassword, setAccountPassword] = useState('')
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoveryPassword, setRecoveryPassword] = useState('')
  const [sellerNote, setSellerNote] = useState('')
  const [allowAffiliates, setAllowAffiliates] = useState(false)
  const [defaultCommission, setDefaultCommission] = useState('0')
  const [status, setStatus] = useState<ProductStatus>(defaultStatus)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isTikTokCategory = category.toLowerCase().includes('tiktok')

  useEffect(() => {
    if (deliveryMethod === 'dropservice') {
      setStock('1')
      setAccountEmail('')
      setAccountPassword('')
      setRecoveryEmail('')
      setRecoveryPassword('')
    }
  }, [deliveryMethod])

  useEffect(() => {
    if (!isTikTokCategory) setProfileHandle('')
  }, [isTikTokCategory])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setPrice('')
    setOriginalPrice('')
    setCategory(productCategoryOptions[0]?.value ?? '')
    setImageUrl('')
    setImageFile(null)
    setStock('')
    setDeliveryMethod('ready')
    setProfileHandle('')
    setAccountEmail('')
    setAccountPassword('')
    setRecoveryEmail('')
    setRecoveryPassword('')
    setSellerNote('')
    setAllowAffiliates(false)
    setDefaultCommission('0')
    setStatus(defaultStatus)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage(null)
    setLoading(true)

    const allowedImageTypes = ['image/png', 'image/jpeg', 'image/svg+xml']
    let finalImageUrl = imageUrl.trim()

    if (imageFile) {
      if (!allowedImageTypes.includes(imageFile.type)) {
        setMessage('Envie imagem PNG, SVG ou JPEG.')
        setLoading(false)
        return
      }

      const fileExt = imageFile.name.split('.').pop() || 'png'
      const path = `${sellerId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
      const { data, error: uploadError } = await supabase.storage.from('product_images').upload(path, imageFile, {
        cacheControl: '3600',
        upsert: true,
        contentType: imageFile.type,
      })

      if (uploadError) {
        setMessage(uploadError.message)
        setLoading(false)
        return
      }

      const { data: publicData } = supabase.storage.from('product_images').getPublicUrl(data.path)
      finalImageUrl = publicData.publicUrl
    }

    const deliveryLines = [
      isTikTokCategory && profileHandle.trim() ? `Perfil vinculado: ${profileHandle.trim()}` : '',
      deliveryMethod === 'ready' && accountEmail.trim() ? `Email da conta: ${accountEmail.trim()}` : '',
      deliveryMethod === 'ready' && accountPassword.trim() ? `Senha da conta: ${accountPassword.trim()}` : '',
      deliveryMethod === 'ready' && recoveryEmail.trim() ? `Email vinculado: ${recoveryEmail.trim()}` : '',
      deliveryMethod === 'ready' && recoveryPassword.trim() ? `Senha do email vinculado: ${recoveryPassword.trim()}` : '',
      sellerNote.trim() ? `Observacao: ${sellerNote.trim()}` : '',
    ].filter(Boolean)

    const { error } = await supabase.from('products').insert({
      seller_id: sellerId,
      title,
      description: description || null,
      price: Number(price),
      original_price: originalPrice ? Number(originalPrice) : null,
      image_url: finalImageUrl || null,
      category,
      delivery_type: 'Entrega digital na plataforma',
      delivery_method: deliveryMethod,
      stock: deliveryMethod === 'dropservice' ? 1 : stock ? Number(stock) : 0,
      credentials_data: deliveryLines.length ? deliveryLines : [],
      seller_note: deliveryLines.join('\n') || null,
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
        <input
          type="number"
          min="0"
          value={deliveryMethod === 'dropservice' ? '1' : stock}
          onChange={(event) => setStock(event.target.value)}
          disabled={deliveryMethod === 'dropservice'}
          className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue disabled:bg-gray-100 disabled:text-gray-500"
        />
        {deliveryMethod === 'dropservice' && <p className="mt-1 text-xs text-gray-500">Dropservice sempre fica limitado a 1 unidade por anuncio.</p>}
      </div>

      <div className="md:col-span-2 grid gap-3 rounded-md border border-gray-100 bg-gray-50 p-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Imagem do produto</label>
          <p className="text-xs text-gray-500">Envie PNG, SVG ou JPEG direto pelo painel, ou use uma URL se preferir.</p>
        </div>
        <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-white p-4 text-center transition-colors hover:bg-gray-50">
          <ImagePlus className="mb-2 h-7 w-7 text-gray-400" />
          <span className="text-sm font-semibold text-ml-dark">{imageFile ? imageFile.name : 'Clique para enviar imagem'}</span>
          <span className="mt-1 text-xs text-gray-500">PNG, SVG ou JPEG</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            className="hidden"
            onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
          />
        </label>
        <input type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://..." className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue" />
      </div>

      <div className="md:col-span-2 rounded-md border border-gray-100 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-ml-dark">Dados de entrega da conta</h3>
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <label className={`rounded-md border p-3 text-sm ${deliveryMethod === 'ready' ? 'border-ml-blue bg-blue-50/40' : 'border-gray-200'}`}>
            <input type="radio" checked={deliveryMethod === 'ready'} onChange={() => setDeliveryMethod('ready')} className="mr-2" />
            Pronta entrega
          </label>
          <label className={`rounded-md border p-3 text-sm ${deliveryMethod === 'dropservice' ? 'border-ml-blue bg-blue-50/40' : 'border-gray-200'}`}>
            <input type="radio" checked={deliveryMethod === 'dropservice'} onChange={() => setDeliveryMethod('dropservice')} className="mr-2" />
            Dropservice
          </label>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {isTikTokCategory && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">@ do perfil vinculado</label>
              <input value={profileHandle} onChange={(event) => setProfileHandle(event.target.value)} placeholder="@perfil" className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue" />
            </div>
          )}
          {deliveryMethod === 'ready' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email da conta</label>
                <input value={accountEmail} onChange={(event) => setAccountEmail(event.target.value)} className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha da conta</label>
                <input value={accountPassword} onChange={(event) => setAccountPassword(event.target.value)} className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email vinculado</label>
                <input value={recoveryEmail} onChange={(event) => setRecoveryEmail(event.target.value)} className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha do email vinculado</label>
                <input value={recoveryPassword} onChange={(event) => setRecoveryPassword(event.target.value)} className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue" />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observacao para o comprador</label>
            <input value={sellerNote} onChange={(event) => setSellerNote(event.target.value)} className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue" />
          </div>
        </div>
        {deliveryMethod === 'dropservice' && (
          <p className="mt-3 text-xs text-gray-500">No dropservice, os logins nao ficam cadastrados antes da venda. O acesso deve ser entregue depois pelo vendedor.</p>
        )}
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
