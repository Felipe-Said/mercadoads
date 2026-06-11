import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { supabase } from '../../lib/supabase'
import { Plus, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react'

type Tab = 'taxas' | 'banners' | 'grupos'

interface Banner {
  id: number
  title: string
  subtitle: string | null
  image_url: string | null
  link_url: string
  background_color: string
  position: string
  is_active: boolean
}

interface Group {
  id: number
  name: string
  members: number
  category: string
  link: string
  image_url: string | null
  sponsored: boolean
  is_active: boolean
}

const bannerPositionOptions = [
  { value: 'home_hero', label: 'Home | Banner principal' },
  { value: 'home_side_top', label: 'Home | Lateral superior' },
  { value: 'home_side_middle', label: 'Home | Lateral central' },
  { value: 'home_side_bottom', label: 'Home | Lateral inferior' },
  { value: 'home_deals_top', label: 'Home | Ofertas esquerda' },
  { value: 'home_deals_bottom', label: 'Home | Ofertas direita' },
  { value: 'home_grid_1', label: 'Home | Grade 1' },
  { value: 'home_grid_2', label: 'Home | Grade 2' },
  { value: 'home_grid_3', label: 'Home | Grade 3' },
  { value: 'home_grid_4', label: 'Home | Grade 4' },
  { value: 'home_middle', label: 'Home | Banner central' },
  { value: 'home_bottom', label: 'Home | Banner inferior' },
  { value: 'left_flyer', label: 'Flyer esquerdo' },
  { value: 'right_flyer', label: 'Flyer direito' },
]

const getBannerPositionLabel = (position: string) => (
  bannerPositionOptions.find((option) => option.value === position)?.label ?? position
)

export function AdsManagerAdmin() {
  const [activeTab, setActiveTab] = useState<Tab>('taxas')
  
  // Taxas state
  const [productPrice, setProductPrice] = useState(5)
  const [groupPrice, setGroupPrice] = useState(10)
  const [leftFlyerPrice, setLeftFlyerPrice] = useState(50)
  const [rightFlyerPrice, setRightFlyerPrice] = useState(50)
  const [savedTaxas, setSavedTaxas] = useState(false)

  // Banners state
  const [banners, setBanners] = useState<Banner[]>([])
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null)

  // Groups state
  const [groups, setGroups] = useState<Group[]>([])
  const [editingGroup, setEditingGroup] = useState<Partial<Group> | null>(null)

  useEffect(() => {
    fetchTaxas()
    fetchBanners()
    fetchGroups()
  }, [])

  const fetchTaxas = async () => {
    const { data } = await supabase.from('platform_settings').select('*').eq('id', 1).maybeSingle()
    if (data) {
      setProductPrice(Number(data.ads_product_daily_price ?? 5))
      setGroupPrice(Number(data.ads_group_daily_price ?? 10))
      setLeftFlyerPrice(Number(data.ads_left_flyer_daily_price ?? 50))
      setRightFlyerPrice(Number(data.ads_right_flyer_daily_price ?? 50))
    }
  }

  const fetchBanners = async () => {
    const { data } = await supabase.from('marketing_banners').select('*').order('created_at', { ascending: false })
    if (data) setBanners(data)
  }

  const fetchGroups = async () => {
    const { data } = await supabase.from('network_groups').select('*').order('created_at', { ascending: false })
    if (data) setGroups(data)
  }

  const saveTaxas = async () => {
    await supabase.from('platform_settings').update({
      ads_product_daily_price: productPrice,
      ads_group_daily_price: groupPrice,
      ads_left_flyer_daily_price: leftFlyerPrice,
      ads_right_flyer_daily_price: rightFlyerPrice,
    }).eq('id', 1)
    setSavedTaxas(true)
    setTimeout(() => setSavedTaxas(false), 2000)
  }

  const saveBanner = async () => {
    if (!editingBanner) return
    const payload = { ...editingBanner }
    delete payload.id

    if (editingBanner.id) {
      await supabase.from('marketing_banners').update(payload).eq('id', editingBanner.id)
    } else {
      await supabase.from('marketing_banners').insert(payload)
    }
    setEditingBanner(null)
    fetchBanners()
  }

  const deleteBanner = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir?')) return
    await supabase.from('marketing_banners').delete().eq('id', id)
    fetchBanners()
  }

  const toggleBannerStatus = async (banner: Banner) => {
    await supabase.from('marketing_banners').update({ is_active: !banner.is_active }).eq('id', banner.id)
    fetchBanners()
  }

  const saveGroup = async () => {
    if (!editingGroup) return
    const payload = { ...editingGroup }
    delete payload.id

    // Auto-fetch WhatsApp group image
    if (payload.link && payload.link.includes('chat.whatsapp.com')) {
      try {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(payload.link)}`)
        const data = await response.json()
        const html = data.contents
        const match = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)
        if (match && match[1]) {
          payload.image_url = match[1]
        }
      } catch (error) {
        console.error('Failed to fetch WhatsApp group image:', error)
      }
    }

    if (editingGroup.id) {
      await supabase.from('network_groups').update(payload).eq('id', editingGroup.id)
    } else {
      await supabase.from('network_groups').insert(payload)
    }
    setEditingGroup(null)
    fetchGroups()
  }

  const deleteGroup = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir?')) return
    await supabase.from('network_groups').delete().eq('id', id)
    fetchGroups()
  }

  const toggleGroupStatus = async (group: Group) => {
    await supabase.from('network_groups').update({ is_active: !group.is_active }).eq('id', group.id)
    fetchGroups()
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-light text-ml-dark">Ads Manager</h2>
        </div>

        <div className="flex gap-1 bg-white p-1 rounded-md shadow-sm w-max border border-gray-100">
          <button
            onClick={() => setActiveTab('taxas')}
            className={`px-6 py-2 text-sm font-medium rounded-sm transition-colors ${activeTab === 'taxas' ? 'bg-ml-blue/10 text-ml-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Tabela de Preços
          </button>
          <button
            onClick={() => setActiveTab('banners')}
            className={`px-6 py-2 text-sm font-medium rounded-sm transition-colors ${activeTab === 'banners' ? 'bg-ml-blue/10 text-ml-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Banners e Flyers
          </button>
          <button
            onClick={() => setActiveTab('grupos')}
            className={`px-6 py-2 text-sm font-medium rounded-sm transition-colors ${activeTab === 'grupos' ? 'bg-ml-blue/10 text-ml-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Grupos de Network
          </button>
        </div>

        {activeTab === 'taxas' && (
          <Card className="bg-white border-none shadow-sm rounded-md animate-in fade-in duration-300">
            <CardContent className="p-8">
              <h3 className="text-lg font-medium text-ml-dark mb-2">Tabela de Preços</h3>
              <p className="text-sm text-gray-500 mb-8">Defina o valor cobrado por dia para cada tipo de impulsionamento.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PriceInput label="Produto patrocinado" helper="Destaca o produto nas primeiras posições da home." value={productPrice} onChange={setProductPrice} />
                <PriceInput label="Grupo de WhatsApp" helper="Destaca o grupo nos stories e na página de grupos." value={groupPrice} onChange={setGroupPrice} />
                <PriceInput label="Flyer lateral esquerdo" helper="Banner vertical ao lado esquerdo do carrossel." value={leftFlyerPrice} onChange={setLeftFlyerPrice} />
                <PriceInput label="Flyer lateral direito" helper="Banner vertical ao lado direito do carrossel." value={rightFlyerPrice} onChange={setRightFlyerPrice} />
              </div>

              <div className="flex items-center justify-end gap-3 pt-8">
                {savedTaxas && <span className="text-sm text-green-600">Salvo.</span>}
                <Button onClick={saveTaxas} className="bg-ml-blue text-white hover:bg-ml-hover rounded-sm">Salvar tabela de preços</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'banners' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {editingBanner ? (
              <Card className="bg-white border-none shadow-sm rounded-md">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-ml-dark mb-4">{editingBanner.id ? 'Editar Banner' : 'Novo Banner'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Título" value={editingBanner.title || ''} onChange={v => setEditingBanner({...editingBanner, title: v})} />
                    <InputField label="Subtítulo" value={editingBanner.subtitle || ''} onChange={v => setEditingBanner({...editingBanner, subtitle: v})} />
                    <InputField label="Link (URL destino)" value={editingBanner.link_url || ''} onChange={v => setEditingBanner({...editingBanner, link_url: v})} />
                    <InputField label="URL da Imagem" value={editingBanner.image_url || ''} onChange={v => setEditingBanner({...editingBanner, image_url: v})} />
                    <InputField label="Cor de Fundo (Hex)" value={editingBanner.background_color || ''} onChange={v => setEditingBanner({...editingBanner, background_color: v})} />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Posição</label>
                      <select 
                        className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue"
                        value={editingBanner.position || 'home_hero'}
                        onChange={e => setEditingBanner({...editingBanner, position: e.target.value})}
                      >
                        {bannerPositionOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => setEditingBanner(null)}>Cancelar</Button>
                    <Button onClick={saveBanner} className="bg-ml-blue text-white hover:bg-ml-hover">Salvar</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex justify-end">
                  <Button onClick={() => setEditingBanner({ is_active: true, position: 'home_hero', background_color: '#ebebeb', link_url: '/' })} className="bg-ml-blue text-white hover:bg-ml-hover gap-2">
                    <Plus className="w-4 h-4" /> Novo Banner
                  </Button>
                </div>
                <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                      <tr>
                        <th className="px-6 py-3">Banner</th>
                        <th className="px-6 py-3">Posição</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {banners.map(banner => (
                        <tr key={banner.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {banner.image_url ? (
                                <img src={banner.image_url} alt="" className="w-12 h-8 object-cover rounded-sm border" />
                              ) : (
                                <div className="w-12 h-8 rounded-sm flex items-center justify-center text-xs text-white" style={{backgroundColor: banner.background_color || '#ccc'}}>Cor</div>
                              )}
                              <div>
                                <p className="font-medium text-gray-900">{banner.title || 'Sem título'}</p>
                                <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="text-xs text-ml-blue hover:underline line-clamp-1">{banner.link_url}</a>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {getBannerPositionLabel(banner.position)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button onClick={() => toggleBannerStatus(banner)} className="flex items-center gap-1">
                              {banner.is_active ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-gray-300" />}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingBanner(banner)} className="p-2 text-gray-400 hover:text-ml-blue transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => deleteBanner(banner.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {banners.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Nenhum banner cadastrado.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'grupos' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {editingGroup ? (
              <Card className="bg-white border-none shadow-sm rounded-md">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-ml-dark mb-4">{editingGroup.id ? 'Editar Grupo' : 'Novo Grupo'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Nome do Grupo" value={editingGroup.name || ''} onChange={v => setEditingGroup({...editingGroup, name: v})} />
                    <InputField label="Categoria" value={editingGroup.category || ''} onChange={v => setEditingGroup({...editingGroup, category: v})} />
                    <div className="col-span-1 md:col-span-2">
                      <InputField label="Link de Convite (WhatsApp)" value={editingGroup.link || ''} onChange={v => setEditingGroup({...editingGroup, link: v})} />
                      <p className="text-xs text-gray-400 mt-1">A imagem do grupo será puxada automaticamente do link.</p>
                    </div>
                    <div className="flex flex-col justify-center pt-2 md:col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer w-max">
                        <input type="checkbox" checked={editingGroup.sponsored || false} onChange={e => setEditingGroup({...editingGroup, sponsored: e.target.checked})} className="rounded text-ml-blue focus:ring-ml-blue w-4 h-4" />
                        <span className="text-sm font-medium text-gray-700">Destacar como Patrocinado</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => setEditingGroup(null)}>Cancelar</Button>
                    <Button onClick={saveGroup} className="bg-ml-blue text-white hover:bg-ml-hover">Salvar</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex justify-end">
                  <Button onClick={() => setEditingGroup({ is_active: true, sponsored: false })} className="bg-ml-blue text-white hover:bg-ml-hover gap-2">
                    <Plus className="w-4 h-4" /> Novo Grupo
                  </Button>
                </div>
                <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                      <tr>
                        <th className="px-6 py-3">Grupo</th>
                        <th className="px-6 py-3">Categoria</th>
                        <th className="px-6 py-3">Patrocinado</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groups.map(group => (
                        <tr key={group.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {group.image_url ? (
                                <img src={group.image_url} alt="" className="w-10 h-10 object-cover rounded-full border" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">G</div>
                              )}
                              <div>
                                <p className="font-medium text-gray-900">{group.name}</p>
                                <a href={group.link} target="_blank" rel="noopener noreferrer" className="text-xs text-ml-blue hover:underline line-clamp-1">{group.link}</a>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{group.category}</td>
                          <td className="px-6 py-4">
                            {group.sponsored ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">Sim</span> : <span className="text-gray-400">-</span>}
                          </td>
                          <td className="px-6 py-4">
                            <button onClick={() => toggleGroupStatus(group)} className="flex items-center gap-1">
                              {group.is_active ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-gray-300" />}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingGroup(group)} className="p-2 text-gray-400 hover:text-ml-blue transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => deleteGroup(group.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {groups.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Nenhum grupo cadastrado.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

function PriceInput({ label, helper, value, onChange }: { label: string; helper: string; value: number; onChange: (value: number) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <p className="text-xs text-gray-400 mb-3">{helper}</p>
      <div className="relative">
        <span className="absolute left-4 top-3 text-gray-500">R$</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full h-12 pl-10 pr-14 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue transition-all"
        />
        <span className="absolute right-4 top-3 text-gray-400">/dia</span>
      </div>
    </div>
  )
}

function InputField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue transition-colors"
      />
    </div>
  )
}
