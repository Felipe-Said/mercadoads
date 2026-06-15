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
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [themeFile, setThemeFile] = useState<File | null>(null)
  const [stock, setStock] = useState('')
  const [deliveryMethod, setDeliveryMethod] = useState<'ready' | 'dropservice'>('ready')
  const [profileHandle, setProfileHandle] = useState('')
  const [accountEmail, setAccountEmail] = useState('')
  const [accountPassword, setAccountPassword] = useState('')
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoveryPassword, setRecoveryPassword] = useState('')
  const [shopifyStoreUrl, setShopifyStoreUrl] = useState('')
  const [shopifyKeys, setShopifyKeys] = useState('')
  const [shopifyPaymentDelay, setShopifyPaymentDelay] = useState<'D1' | 'D2' | 'D3' | 'D7'>('D1')
  const [sellerNote, setSellerNote] = useState('')
  const [allowAffiliates, setAllowAffiliates] = useState(false)
  const [defaultCommission, setDefaultCommission] = useState('0')
  const [status, setStatus] = useState<ProductStatus>(defaultStatus)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isTikTokCategory = category.toLowerCase().includes('tiktok')
  const isShopifyTheme = category.toLowerCase().includes('shopify temas')
  const isShopifyPayments = category.toLowerCase().includes('shopify payments')

  useEffect(() => {
    if (deliveryMethod === 'dropservice' || isShopifyTheme) {
      setStock('1')
      setAccountEmail('')
      setAccountPassword('')
      setRecoveryEmail('')
      setRecoveryPassword('')
    }
  }, [deliveryMethod, isShopifyTheme])

  useEffect(() => {
    if (isShopifyTheme) {
      setDeliveryMethod('ready')
      setShopifyStoreUrl('')
      setShopifyKeys('')
    } else {
      setThemeFile(null)
    }
  }, [isShopifyTheme])

  useEffect(() => {
    if (!isShopifyPayments) {
      setShopifyStoreUrl('')
      setShopifyKeys('')
      setShopifyPaymentDelay('D1')
    }
  }, [isShopifyPayments])

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
    setImageFiles([])
    setThemeFile(null)
    setStock('')
    setDeliveryMethod('ready')
    setProfileHandle('')
    setAccountEmail('')
    setAccountPassword('')
    setRecoveryEmail('')
    setRecoveryPassword('')
    setShopifyStoreUrl('')
    setShopifyKeys('')
    setShopifyPaymentDelay('D1')
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
    const galleryUrls: string[] = finalImageUrl ? [finalImageUrl] : []

    if (imageFiles.length) {
      const invalidImage = imageFiles.find((file) => !allowedImageTypes.includes(file.type))
      if (invalidImage) {
        setMessage('Envie apenas imagens PNG, SVG ou JPEG.')
        setLoading(false)
        return
      }

      for (const file of imageFiles) {
        const fileExt = file.name.split('.').pop() || 'png'
        const path = `${sellerId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
        const { data, error: uploadError } = await supabase.storage.from('product_images').upload(path, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        })

        if (uploadError) {
          setMessage(`Erro no upload da imagem: ${uploadError.message}`)
          setLoading(false)
          return
        }

        const { data: publicData } = supabase.storage.from('product_images').getPublicUrl(data.path)
        galleryUrls.push(publicData.publicUrl)
      }

      finalImageUrl = galleryUrls[0] || ''
    }

    if (allowAffiliates && Number(defaultCommission || 0) <= 0) {
      setMessage('Informe a porcentagem de comissao para afiliados.')
      setLoading(false)
      return
    }

    let fileUrl: string | null = null
    if (isShopifyTheme) {
      if (!themeFile) {
        setMessage('Envie o arquivo do tema Shopify.')
        setLoading(false)
        return
      }

      const fileExt = themeFile.name.split('.').pop() || 'zip'
      const path = `${sellerId}/themes/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
      const { data, error: fileUploadError } = await supabase.storage.from('product_files').upload(path, themeFile, {
        cacheControl: '3600',
        upsert: true,
        contentType: themeFile.type || 'application/octet-stream',
      })

      if (fileUploadError) {
        setMessage(`Erro no upload do tema: ${fileUploadError.message}`)
        setLoading(false)
        return
      }

      fileUrl = data.path
    }

    const deliveryLines = [
      isTikTokCategory && profileHandle.trim() ? `Perfil vinculado: ${profileHandle.trim()}` : '',
      deliveryMethod === 'ready' && accountEmail.trim() ? `Email da conta: ${accountEmail.trim()}` : '',
      deliveryMethod === 'ready' && accountPassword.trim() ? `Senha da conta: ${accountPassword.trim()}` : '',
      deliveryMethod === 'ready' && recoveryEmail.trim() ? `Email vinculado: ${recoveryEmail.trim()}` : '',
      deliveryMethod === 'ready' && recoveryPassword.trim() ? `Senha do email vinculado: ${recoveryPassword.trim()}` : '',
      isShopifyPayments && shopifyStoreUrl.trim() ? `Loja Shopify: ${shopifyStoreUrl.trim()}` : '',
      isShopifyPayments ? `Payments: ${shopifyPaymentDelay}` : '',
      isShopifyPayments && shopifyKeys.trim() ? `Chaves Shopify:\n${shopifyKeys.trim()}` : '',
      isShopifyTheme && themeFile ? `Arquivo do tema: ${themeFile.name}` : '',
      sellerNote.trim() ? `Observacao: ${sellerNote.trim()}` : '',
    ].filter(Boolean)

    const { error } = await supabase.from('products').insert({
      seller_id: sellerId,
      title,
      description: description || null,
      price: Number(price),
      original_price: originalPrice ? Number(originalPrice) : null,
      image_url: finalImageUrl || null,
      image_gallery_json: galleryUrls,
      category,
      delivery_type: isShopifyTheme ? 'Arquivo digital na plataforma' : 'Entrega digital na plataforma',
      delivery_method: deliveryMethod,
      stock: isShopifyTheme ? null : deliveryMethod === 'dropservice' ? 1 : stock ? Number(stock) : 0,
      file_url: fileUrl,
      credentials_data: deliveryLines.length ? deliveryLines : [],
      seller_note: deliveryLines.join('\n') || null,
      allow_affiliates: allowAffiliates,
      default_commission: Number(defaultCommission || 0),
      status,
    })

    if (error) {
      setMessage(`Erro ao salvar produto: ${error.message}`)
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
          type={isShopifyTheme ? 'text' : 'number'}
          min="0"
          value={isShopifyTheme ? 'Ilimitado' : deliveryMethod === 'dropservice' ? '1' : stock}
          onChange={(event) => setStock(event.target.value)}
          disabled={deliveryMethod === 'dropservice' || isShopifyTheme}
          className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue disabled:bg-gray-100 disabled:text-gray-500"
        />
        {isShopifyTheme && <p className="mt-1 text-xs text-gray-500">Tema Shopify e arquivo digital: estoque ilimitado.</p>}
        {deliveryMethod === 'dropservice' && <p className="mt-1 text-xs text-gray-500">Dropservice sempre fica limitado a 1 unidade por anuncio.</p>}
      </div>

      <div className="md:col-span-2 grid gap-3 rounded-md border border-gray-100 bg-gray-50 p-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Imagem do produto</label>
          <p className="text-xs text-gray-500">Envie PNG, SVG ou JPEG direto pelo painel, ou use uma URL se preferir.</p>
        </div>
        <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-white p-4 text-center transition-colors hover:bg-gray-50">
          <ImagePlus className="mb-2 h-7 w-7 text-gray-400" />
          <span className="text-sm font-semibold text-ml-dark">{imageFiles.length ? `${imageFiles.length} imagem(ns) selecionada(s)` : 'Clique para enviar imagens'}</span>
          <span className="mt-1 text-xs text-gray-500">PNG, SVG ou JPEG. Voce pode selecionar mais de uma.</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            multiple
            className="hidden"
            onChange={(event) => setImageFiles(Array.from(event.target.files ?? []))}
          />
        </label>
        {imageFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {imageFiles.map((file) => (
              <span key={`${file.name}-${file.size}`} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm">
                {file.name}
              </span>
            ))}
          </div>
        )}
        <input type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://..." className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue" />
      </div>

      <div className="md:col-span-2 rounded-md border border-gray-100 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-ml-dark">{isShopifyTheme ? 'Arquivo do tema Shopify' : 'Dados de entrega da conta'}</h3>
        {!isShopifyTheme && (
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
        )}
        {isShopifyTheme && (
          <label className="mb-4 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center transition-colors hover:bg-gray-100">
            <ImagePlus className="mb-2 h-7 w-7 text-gray-400" />
            <span className="text-sm font-semibold text-ml-dark">{themeFile ? themeFile.name : 'Enviar arquivo do tema'}</span>
            <span className="mt-1 text-xs text-gray-500">Tema Shopify em ZIP ou arquivo compactado</span>
            <input
              type="file"
              accept=".zip,.rar,.7z,application/zip,application/x-zip-compressed"
              className="hidden"
              onChange={(event) => setThemeFile(event.target.files?.[0] ?? null)}
            />
          </label>
        )}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {isTikTokCategory && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">@ do perfil vinculado</label>
              <input value={profileHandle} onChange={(event) => setProfileHandle(event.target.value)} placeholder="@perfil" className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue" />
            </div>
          )}
          {!isShopifyTheme && deliveryMethod === 'ready' && (
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
          {!isShopifyTheme && isShopifyPayments && deliveryMethod === 'ready' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL da loja Shopify</label>
                <input value={shopifyStoreUrl} onChange={(event) => setShopifyStoreUrl(event.target.value)} placeholder="https://loja.myshopify.com" className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prazo da Payments</label>
                <select value={shopifyPaymentDelay} onChange={(event) => setShopifyPaymentDelay(event.target.value as 'D1' | 'D2' | 'D3' | 'D7')} className="w-full h-10 px-3 border border-gray-300 rounded-sm bg-white focus:outline-none focus:border-ml-blue">
                  <option value="D1">D1</option>
                  <option value="D2">D2</option>
                  <option value="D3">D3</option>
                  <option value="D7">D7</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Chaves / dados da Shopify</label>
                <textarea value={shopifyKeys} onChange={(event) => setShopifyKeys(event.target.value)} rows={3} placeholder="Cole aqui as keys, backup codes ou dados necessarios para operacao." className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue resize-y" />
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

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={allowAffiliates} onChange={(event) => setAllowAffiliates(event.target.checked)} />
        Permitir afiliados
      </label>

      {allowAffiliates && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comissao do afiliado (%)</label>
          <input type="number" min="1" max="100" value={defaultCommission} onChange={(event) => setDefaultCommission(event.target.value)} required className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue" />
        </div>
      )}

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
