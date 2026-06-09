import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { getBanners, type Banner } from '../../lib/data'
import { supabase } from '../../lib/supabase'

export function Personalizacao() {
  const [primaryColor, setPrimaryColor] = useState('#fff159')
  const [secondaryColor, setSecondaryColor] = useState('#3483fa')
  const [desktopLogoSize, setDesktopLogoSize] = useState(130)
  const [mobileLogoSize, setMobileLogoSize] = useState(80)
  const [banners, setBanners] = useState<Banner[]>([])
  const [saved, setSaved] = useState(false)

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
        setDesktopLogoSize(Number(settings?.logo_desktop_size ?? 130))
        setMobileLogoSize(Number(settings?.logo_mobile_size ?? 80))
        setBanners(bannerData)
      })
      .catch(console.error)
  }, [])

  const save = async () => {
    const { error } = await supabase.from('platform_settings').update({
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      logo_desktop_size: desktopLogoSize,
      logo_mobile_size: mobileLogoSize,
    }).eq('id', 1)

    if (error) throw error
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <h2 className="text-xl font-light text-ml-dark mb-4">Layout da Plataforma</h2>

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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo desktop ({desktopLogoSize}px)</label>
              <input type="range" min="50" max="300" value={desktopLogoSize} onChange={(event) => setDesktopLogoSize(Number(event.target.value))} className="w-full accent-ml-blue" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo mobile ({mobileLogoSize}px)</label>
              <input type="range" min="30" max="200" value={mobileLogoSize} onChange={(event) => setMobileLogoSize(Number(event.target.value))} className="w-full accent-ml-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-ml-dark">Banners ativos</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {banners.map((banner) => (
              <div key={banner.id} className="p-4 flex items-center gap-4">
                <div className="w-32 h-16 bg-gray-100 rounded-sm overflow-hidden flex items-center justify-center">
                  {banner.image ? <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" /> : <span className="text-xs text-gray-400">Sem imagem</span>}
                </div>
                <div>
                  <p className="font-medium text-ml-dark">{banner.title}</p>
                  <p className="text-xs text-gray-500">{banner.position} | {banner.link}</p>
                </div>
              </div>
            ))}
            {banners.length === 0 && <p className="p-6 text-sm text-gray-500">Nenhum banner cadastrado.</p>}
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          {saved && <span className="text-sm text-green-600">Publicado.</span>}
          <Button onClick={save} className="bg-ml-blue text-white hover:bg-ml-hover font-semibold py-6 px-10 text-base rounded-sm shadow-md">Publicar alteracoes</Button>
        </div>
      </div>
    </AdminLayout>
  )
}
