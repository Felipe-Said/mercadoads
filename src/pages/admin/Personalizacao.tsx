import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { getBanners, type Banner } from '../../lib/data'
import { supabase } from '../../lib/supabase'

type BannerForm = {
  title: string
  subtitle: string
  image_url: string
  mobile_image_url: string
  link_url: string
  background_color: string
  position: Banner['position']
  sort_order: number
}

const emptyBannerForm: BannerForm = {
  title: '',
  subtitle: '',
  image_url: '',
  mobile_image_url: '',
  link_url: '/',
  background_color: '#1E1E1E',
  position: 'home_hero',
  sort_order: 0,
}

export function Personalizacao() {
  const [primaryColor, setPrimaryColor] = useState('#fff159')
  const [secondaryColor, setSecondaryColor] = useState('#3483fa')
  const [logoUrl, setLogoUrl] = useState('')
  const [desktopLogoSize, setDesktopLogoSize] = useState(130)
  const [mobileLogoSize, setMobileLogoSize] = useState(80)
  const [headerPromo, setHeaderPromo] = useState({ gifUrl: '', text: '', link: '' })
  const [banners, setBanners] = useState<Banner[]>([])
  const [bannerForm, setBannerForm] = useState<BannerForm>(emptyBannerForm)
  const [bannerMessage, setBannerMessage] = useState<string | null>(null)
  const [bannerLoading, setBannerLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      supabase.from('platform_settings').select('*').eq('id', 1).maybeSingle(),
      getBanners(),
    ])
      .then(([settingsResult, bannerData]) => {
        if (settingsResult.error) throw settingsResult.error
        const settings = settingsResult.data
        setPrimaryColor(settings?.primary_color ?? '#fff159')
        setSecondaryColor(settings?.secondary_color ?? '#3483fa')
        setLogoUrl(settings?.logo_url ?? '')
        setDesktopLogoSize(Number(settings?.logo_desktop_size ?? 130))
        setMobileLogoSize(Number(settings?.logo_mobile_size ?? 80))
        setHeaderPromo({
          gifUrl: settings?.header_promo_json?.gifUrl ?? '',
          text: settings?.header_promo_json?.text ?? '',
          link: settings?.header_promo_json?.link ?? '',
        })
        setBanners(bannerData)
      })
      .catch(console.error)
  }, [])

  const save = async () => {
    setSaveMessage(null)

    const { error } = await supabase.from('platform_settings').upsert({
      id: 1,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      logo_url: logoUrl || null,
      logo_desktop_size: desktopLogoSize,
      logo_mobile_size: mobileLogoSize,
      header_promo_json: {
        gifUrl: headerPromo.gifUrl,
        text: headerPromo.text,
        link: headerPromo.link,
      },
    }, { onConflict: 'id' }).select('id').single()

    if (error) {
      setSaveMessage(error.message)
      return
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const refreshBanners = async () => {
    const bannerData = await getBanners()
    setBanners(bannerData)
  }

  const addBanner = async (event: React.FormEvent) => {
    event.preventDefault()
    setBannerMessage(null)
    setBannerLoading(true)

    const { error } = await supabase.from('marketing_banners').insert({
      title: bannerForm.title,
      subtitle: bannerForm.subtitle || null,
      image_url: bannerForm.image_url || null,
      mobile_image_url: bannerForm.mobile_image_url || null,
      link_url: bannerForm.link_url || '/',
      background_color: bannerForm.background_color,
      position: bannerForm.position,
      sort_order: bannerForm.sort_order,
      is_active: true,
    })

    if (error) {
      setBannerMessage(error.message)
      setBannerLoading(false)
      return
    }

    setBannerForm(emptyBannerForm)
    await refreshBanners()
    setBannerMessage('Banner adicionado.')
    setBannerLoading(false)
  }

  const deactivateBanner = async (id: string) => {
    const { error } = await supabase.from('marketing_banners').update({ is_active: false }).eq('id', id)
    if (error) {
      setBannerMessage(error.message)
      return
    }

    await refreshBanners()
    setBannerMessage('Banner removido da home.')
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <h2 className="text-xl font-light text-ml-dark mb-4">Layout da Plataforma</h2>

        <Card className="bg-white border-none shadow-sm rounded-md">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-ml-dark mb-4">Logotipo</h3>
            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6">
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 flex items-center justify-center bg-gray-50 min-h-32">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo da plataforma" className="max-w-full max-h-24 object-contain" />
                ) : (
                  <span className="text-sm text-gray-400 text-center">Preview da logo</span>
                )}
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL da logo (PNG/SVG)</label>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(event) => setLogoUrl(event.target.value)}
                    placeholder="https://..."
                    className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue"
                  />
                  <p className="text-xs text-gray-400 mt-1">Use uma URL publica da imagem. O tamanho visual e controlado abaixo.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo desktop ({desktopLogoSize}px)</label>
                  <input type="range" min="50" max="300" value={desktopLogoSize} onChange={(event) => setDesktopLogoSize(Number(event.target.value))} className="w-full accent-ml-blue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo mobile ({mobileLogoSize}px)</label>
                  <input type="range" min="30" max="200" value={mobileLogoSize} onChange={(event) => setMobileLogoSize(Number(event.target.value))} className="w-full accent-ml-blue" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm rounded-md">
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cor principal</label>
              <input type="color" value={primaryColor} onChange={(event) => setPrimaryColor(event.target.value)} className="w-16 h-12" />
              <input type="text" value={primaryColor} onChange={(event) => setPrimaryColor(event.target.value)} className="ml-3 h-10 px-3 border border-gray-300 rounded-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cor secundaria</label>
              <input type="color" value={secondaryColor} onChange={(event) => setSecondaryColor(event.target.value)} className="w-16 h-12" />
              <input type="text" value={secondaryColor} onChange={(event) => setSecondaryColor(event.target.value)} className="ml-3 h-10 px-3 border border-gray-300 rounded-sm" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm rounded-md">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-ml-dark mb-4">Promocao do cabecalho</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL do icone/GIF</label>
                <input
                  type="url"
                  value={headerPromo.gifUrl}
                  onChange={(event) => setHeaderPromo((current) => ({ ...current, gifUrl: event.target.value }))}
                  placeholder="https://..."
                  className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texto</label>
                <input
                  type="text"
                  value={headerPromo.text}
                  onChange={(event) => setHeaderPromo((current) => ({ ...current, text: event.target.value }))}
                  placeholder="Ex: Assine o Meli+"
                  className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                <input
                  type="text"
                  value={headerPromo.link}
                  onChange={(event) => setHeaderPromo((current) => ({ ...current, link: event.target.value }))}
                  placeholder="/ofertas"
                  className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue"
                />
              </div>
            </div>
            {(headerPromo.text || headerPromo.gifUrl) && (
              <div className="mt-5 p-4 rounded-md flex justify-end items-center" style={{ backgroundColor: primaryColor }}>
                <span className="flex items-center gap-2 text-ml-dark font-medium text-sm">
                  {headerPromo.gifUrl && <img src={headerPromo.gifUrl} alt="" className="h-6 object-contain" />}
                  {headerPromo.text}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-lg font-medium text-ml-dark">Banners ativos</h3>
            <span className="text-xs text-gray-500">{banners.length} cadastrados</span>
          </div>
          <div className="divide-y divide-gray-100">
            {banners.map((banner) => (
              <div key={banner.id} className="p-4 flex items-center gap-4">
                <div className="w-32 h-16 bg-gray-100 rounded-sm overflow-hidden flex items-center justify-center">
                  {banner.image ? <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" /> : <span className="text-xs text-gray-400">Sem imagem</span>}
                </div>
                <div className="flex-grow">
                  <p className="font-medium text-ml-dark">{banner.title}</p>
                  <p className="text-xs text-gray-500">{banner.position} | {banner.link}</p>
                </div>
                <Button type="button" variant="outline" onClick={() => deactivateBanner(banner.id)} className="border-red-200 text-red-600 hover:bg-red-50 rounded-sm">
                  Remover
                </Button>
              </div>
            ))}
            {banners.length === 0 && <p className="p-6 text-sm text-gray-500">Nenhum banner cadastrado.</p>}
          </div>
        </Card>

        <Card className="bg-white border-none shadow-sm rounded-md">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-ml-dark mb-4">Adicionar banner</h3>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={addBanner}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titulo</label>
                <input
                  type="text"
                  value={bannerForm.title}
                  onChange={(event) => setBannerForm((current) => ({ ...current, title: event.target.value }))}
                  className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitulo</label>
                <input
                  type="text"
                  value={bannerForm.subtitle}
                  onChange={(event) => setBannerForm((current) => ({ ...current, subtitle: event.target.value }))}
                  className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL da imagem desktop</label>
                <input
                  type="url"
                  value={bannerForm.image_url}
                  onChange={(event) => setBannerForm((current) => ({ ...current, image_url: event.target.value }))}
                  className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL da imagem mobile</label>
                <input
                  type="url"
                  value={bannerForm.mobile_image_url}
                  onChange={(event) => setBannerForm((current) => ({ ...current, mobile_image_url: event.target.value }))}
                  className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link de destino</label>
                <input
                  type="text"
                  value={bannerForm.link_url}
                  onChange={(event) => setBannerForm((current) => ({ ...current, link_url: event.target.value }))}
                  className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Posicao</label>
                <select
                  value={bannerForm.position}
                  onChange={(event) => setBannerForm((current) => ({ ...current, position: event.target.value as Banner['position'] }))}
                  className="w-full h-10 px-3 border border-gray-300 rounded-sm bg-white focus:outline-none focus:border-ml-blue"
                >
                  <option value="home_hero">Banner central da home</option>
                  <option value="left_flyer">Flyer lateral esquerdo</option>
                  <option value="right_flyer">Flyer lateral direito</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cor de fundo</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={bannerForm.background_color}
                    onChange={(event) => setBannerForm((current) => ({ ...current, background_color: event.target.value }))}
                    className="w-12 h-10"
                  />
                  <input
                    type="text"
                    value={bannerForm.background_color}
                    onChange={(event) => setBannerForm((current) => ({ ...current, background_color: event.target.value }))}
                    className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
                <input
                  type="number"
                  value={bannerForm.sort_order}
                  onChange={(event) => setBannerForm((current) => ({ ...current, sort_order: Number(event.target.value) }))}
                  className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue"
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
                {bannerMessage && <span className={`text-sm ${bannerMessage.includes('adicionado') || bannerMessage.includes('removido') ? 'text-green-600' : 'text-red-600'}`}>{bannerMessage}</span>}
                <Button type="submit" disabled={bannerLoading} className="bg-ml-blue text-white hover:bg-ml-hover rounded-sm">
                  {bannerLoading ? 'Salvando...' : 'Adicionar banner'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          {saveMessage && <span className="text-sm text-red-600">{saveMessage}</span>}
          {saved && <span className="text-sm text-green-600">Publicado.</span>}
          <Button onClick={save} className="bg-ml-blue text-white hover:bg-ml-hover font-semibold py-6 px-10 text-base rounded-sm shadow-md">Publicar alteracoes</Button>
        </div>
      </div>
    </AdminLayout>
  )
}
