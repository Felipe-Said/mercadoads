import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Search, Plus, Filter, Edit, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../lib/data'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/dialog'
import { productCategoryOptions } from '../../lib/productTaxonomy'

type AdminProduct = {
  id: string
  title: string
  price: number
  image_url: string | null
  stock: number | null
  status: string
  category: string
  description: string
  delivery_type: string
  credentials_data: string[] | null
  file_url: string | null
  seller_note: string | null
}

export function MeusAnunciosAdmin() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [activeTab, setActiveTab] = useState<'com-estoque' | 'sem-estoque'>('com-estoque')
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Partial<AdminProduct> | null>(null)
  
  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState(0)
  const [imageUrl, setImageUrl] = useState('')
  const [category, setCategory] = useState('')
  const [deliveryMode, setDeliveryMode] = useState<'bms' | 'files'>('bms')
  const [stockInput, setStockInput] = useState(0)
  const [credentialsText, setCredentialsText] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [sellerNote, setSellerNote] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = () => {
    supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setProducts((data ?? []).map((product) => ({
            ...product,
            id: String(product.id),
            price: Number(product.price ?? 0),
            stock: product.stock == null ? null : Number(product.stock),
            credentials_data: product.credentials_data ? (Array.isArray(product.credentials_data) ? product.credentials_data : JSON.parse(product.credentials_data as string)) : [],
          })) as AdminProduct[])
        }
      })
  }

  const openNewModal = () => {
    setEditingProduct(null)
    setTitle('')
    setDescription('')
    setPrice(0)
    setImageUrl('')
    setCategory(productCategoryOptions[0]?.value ?? '')
    setDeliveryMode('bms')
    setStockInput(0)
    setCredentialsText('')
    setFileUrl('')
    setSelectedFile(null)
    setSellerNote('')
    setIsModalOpen(true)
  }

  const openEditModal = (p: AdminProduct) => {
    setEditingProduct(p)
    setTitle(p.title)
    setDescription(p.description || '')
    setPrice(p.price)
    setImageUrl(p.image_url || '')
    setCategory(p.category || '')
    const isFile = p.stock === null
    setDeliveryMode(isFile ? 'files' : 'bms')
    setStockInput(p.stock || 0)
    setCredentialsText(p.credentials_data ? p.credentials_data.join('\n') : '')
    setFileUrl(p.file_url || '')
    setSelectedFile(null)
    setSellerNote(p.seller_note || '')
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    let finalStock: number | null = null
    let finalCredentials: string[] = []

    if (deliveryMode === 'bms') {
      const lines = credentialsText.split('\n').map(l => l.trim()).filter(l => l.length > 0)
      if (lines.length !== stockInput) {
        alert(`O estoque informado é ${stockInput}, mas você forneceu ${lines.length} credenciais. Eles precisam ser iguais.`)
        return
      }
      finalStock = stockInput
      finalCredentials = lines
    } else {
      finalStock = null // Sem estoque
      if (!fileUrl.trim() && !selectedFile) {
        alert('Você precisa anexar um arquivo para este tema/produto.')
        return
      }
    }

    setIsUploading(true)
    let finalFileUrl = fileUrl

    if (deliveryMode === 'files' && selectedFile) {
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const { data, error } = await supabase.storage.from('product_files').upload(`uploads/${fileName}`, selectedFile)
      
      if (error) {
        alert('Erro ao fazer upload. Verifique se o armazenamento de arquivos foi configurado.')
        setIsUploading(false)
        return
      }
      finalFileUrl = data.path
    }

    const payload = {
      title,
      description,
      price,
      image_url: imageUrl,
      category,
      stock: finalStock,
      credentials_data: finalCredentials,
      file_url: deliveryMode === 'files' ? finalFileUrl : null,
      seller_note: sellerNote,
      status: 'active' // Admin products auto-approve
    }

    if (editingProduct?.id) {
      await supabase.from('products').update(payload).eq('id', editingProduct.id)
    } else {
      // User is admin, but we need their seller_id
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('products').insert({ ...payload, seller_id: user?.id })
    }

    setIsUploading(false)
    setIsModalOpen(false)
    fetchProducts()
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja apagar este produto? Esta ação não pode ser desfeita.')) return
    
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      alert('Erro ao apagar produto: ' + error.message)
    } else {
      fetchProducts()
    }
  }

  const filteredProducts = products.filter(p => {
    if (activeTab === 'com-estoque') return p.stock !== null
    return p.stock === null
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-light text-ml-dark">Meus Produtos (Admin)</h2>
          <Button onClick={openNewModal} className="bg-ml-blue hover:bg-ml-hover text-white font-semibold rounded-sm shadow-sm transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Novo Produto
          </Button>
        </div>

        <div className="flex gap-1 bg-white p-1 rounded-md shadow-sm w-max border border-gray-100">
          <button
            onClick={() => setActiveTab('com-estoque')}
            className={`px-6 py-2 text-sm font-medium rounded-sm transition-colors ${activeTab === 'com-estoque' ? 'bg-ml-blue/10 text-ml-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Com Estoque (Contas/BMs)
          </button>
          <button
            onClick={() => setActiveTab('sem-estoque')}
            className={`px-6 py-2 text-sm font-medium rounded-sm transition-colors ${activeTab === 'sem-estoque' ? 'bg-ml-blue/10 text-ml-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Sem Estoque (Arquivos/Temas)
          </button>
        </div>

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden animate-in fade-in duration-300">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/50">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar por título ou ID..." 
                className="w-full h-10 pl-9 pr-4 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-ml-blue text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Produto</th>
                  <th className="px-6 py-4 font-medium">Preço</th>
                  <th className="px-6 py-4 font-medium">Estoque / Tipo</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-sm overflow-hidden flex-shrink-0">
                          <img src={product.image_url || '/favicon.svg'} alt="Produto" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-ml-dark line-clamp-1">{product.title}</p>
                          <p className="text-xs text-gray-500">ID: #{product.id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-ml-dark font-medium">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {product.stock !== null ? (
                        <span className="font-medium">{product.stock} unidades</span>
                      ) : (
                        <span className="text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-sm text-xs">Ilimitado (Arquivo)</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-sm text-xs font-semibold ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {product.status === 'active' ? 'Ativo' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => openEditModal(product)} className="text-ml-blue hover:text-ml-hover font-medium text-sm transition-colors">
                          Editar
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors">
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td className="px-6 py-8 text-center text-gray-500" colSpan={5}>Nenhum produto cadastrado nesta categoria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
            <DialogDescription>Preencha os detalhes do produto e configure o método de entrega.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input value={title} onChange={e => setTitle(e.target.value)} type="text" className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                <input value={price} onChange={e => setPrice(Number(e.target.value))} type="number" step="0.01" className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-10 px-3 border border-gray-300 rounded-sm bg-white focus:outline-none focus:border-ml-blue">
                  {category && !productCategoryOptions.some((item) => item.value === category) && (
                    <option value={category}>{category}</option>
                  )}
                  {productCategoryOptions.map((item) => (
                    <option key={item.value} value={item.value}>{item.value}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
                <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} type="text" className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue" />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-6">
              <h3 className="text-md font-semibold text-gray-900 mb-4">Configuração de Entrega</h3>
              
              <div className="flex gap-4 mb-6">
                <label className={`flex-1 border p-4 rounded-md cursor-pointer transition-colors ${deliveryMode === 'bms' ? 'border-ml-blue bg-blue-50/30 ring-1 ring-ml-blue' : 'border-gray-200'}`}>
                  <input type="radio" name="deliveryMode" checked={deliveryMode === 'bms'} onChange={() => setDeliveryMode('bms')} className="hidden" />
                  <div className="font-semibold text-sm mb-1 text-ml-dark">Contas e BMs</div>
                  <div className="text-xs text-gray-500">Exige estoque. O cliente recebe 1 login por unidade comprada.</div>
                </label>
                <label className={`flex-1 border p-4 rounded-md cursor-pointer transition-colors ${deliveryMode === 'files' ? 'border-ml-blue bg-blue-50/30 ring-1 ring-ml-blue' : 'border-gray-200'}`}>
                  <input type="radio" name="deliveryMode" checked={deliveryMode === 'files'} onChange={() => setDeliveryMode('files')} className="hidden" />
                  <div className="font-semibold text-sm mb-1 text-ml-dark">Temas e Arquivos</div>
                  <div className="text-xs text-gray-500">Estoque infinito. O cliente recebe o link de download fixo.</div>
                </label>
              </div>

              {deliveryMode === 'bms' && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-md border border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Disponível (Unidades)</label>
                    <input value={stockInput} onChange={e => setStockInput(Number(e.target.value))} type="number" min="0" className="w-full max-w-[200px] h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">Lista de Credenciais</label>
                      <span className="text-xs font-semibold text-ml-blue">Insira 1 credencial por linha</span>
                    </div>
                    <textarea 
                      value={credentialsText} 
                      onChange={e => setCredentialsText(e.target.value)} 
                      rows={5} 
                      placeholder={`email1@gmail.com:senha1:2FA\nemail2@gmail.com:senha2:2FA`}
                      className="w-full p-3 font-mono text-sm border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue" 
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      A quantidade de linhas preenchidas acima deve ser <strong>exatamente igual</strong> ao estoque de {stockInput} unidades.
                    </p>
                  </div>
                </div>
              )}

              {deliveryMode === 'files' && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-md border border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Arquivo do Produto (.zip, .rar, etc)</label>
                    
                    {fileUrl && !selectedFile && (
                      <div className="mb-3 p-3 bg-white border border-gray-200 rounded-sm flex items-center justify-between">
                        <span className="text-sm text-gray-600 truncate max-w-xs">Arquivo salvo: {fileUrl}</span>
                        <Button variant="outline" size="sm" onClick={() => setFileUrl('')} className="h-7 text-xs text-red-500 border-red-200 hover:bg-red-50">Remover</Button>
                      </div>
                    )}

                    {(!fileUrl || selectedFile) && (
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-md cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-3 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p className="mb-1 text-sm text-gray-500"><span className="font-semibold">Clique para enviar</span> ou arraste o arquivo</p>
                            <p className="text-xs text-gray-500">ZIP, RAR, PDF (Max. 50MB)</p>
                          </div>
                          <input type="file" className="hidden" onChange={e => e.target.files && setSelectedFile(e.target.files[0])} />
                        </label>
                      </div>
                    )}
                    {selectedFile && (
                      <p className="mt-2 text-sm text-green-600 font-medium">Arquivo selecionado: {selectedFile.name}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Observação Adicional do Vendedor</label>
                <textarea 
                  value={sellerNote} 
                  onChange={e => setSellerNote(e.target.value)} 
                  rows={2} 
                  placeholder="Ex: Não altere o email principal da conta nos primeiros 3 dias."
                  className="w-full p-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue" 
                />
                <p className="text-xs text-gray-500 mt-1">Enviado junto com o acesso ao cliente.</p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isUploading}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isUploading} className="bg-ml-blue text-white hover:bg-ml-hover">
              {isUploading ? 'Salvando...' : 'Salvar Produto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
