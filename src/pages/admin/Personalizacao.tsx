import React, { useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Upload, Trash2, Plus, Image as ImageIcon } from 'lucide-react'

export function Personalizacao() {
  const [primaryColor, setPrimaryColor] = useState('#fff159')
  const [secondaryColor, setSecondaryColor] = useState('#3483fa')
  const [desktopLogoSize, setDesktopLogoSize] = useState(130)
  const [mobileLogoSize, setMobileLogoSize] = useState(80)

  const [banners, setBanners] = useState([
    { id: 1, desktopImage: "https://http2.mlstatic.com/D_NQ_858591-MLA76953259972_062024-OO.webp", mobileImage: "https://http2.mlstatic.com/D_NQ_858591-MLA76953259972_062024-OO.webp", link: "/ofertas" },
    { id: 2, desktopImage: "https://http2.mlstatic.com/D_NQ_709295-MLA76868512521_062024-OO.webp", mobileImage: "https://http2.mlstatic.com/D_NQ_709295-MLA76868512521_062024-OO.webp", link: "/groups" }
  ])

  const [headerPromo, setHeaderPromo] = useState({
    gifUrl: "https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.19.1/mercadolibre/mplus-icon.svg",
    text: "Assine o Meli+",
    link: "/meliplus"
  })

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <h2 className="text-xl font-light text-ml-dark mb-4">Layout da Plataforma (White-label)</h2>

        {/* Logo Section */}
        <Card className="bg-white border-none shadow-sm rounded-md">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-lg font-medium text-ml-dark">Logotipo</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload da Logo (PNG/SVG)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer text-center h-32">
                  <Upload className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500 font-medium">Trocar Imagem</span>
                </div>
              </div>

              <div className="md:w-2/3 space-y-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700">Tamanho no Desktop (Pixels)</label>
                    <span className="text-sm text-ml-blue font-bold">{desktopLogoSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="50" max="300" 
                    value={desktopLogoSize} 
                    onChange={(e) => setDesktopLogoSize(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-ml-blue"
                  />
                  <p className="text-xs text-gray-400 mt-1">Recomendado: 120px a 160px</p>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700">Tamanho no Mobile (Pixels)</label>
                    <span className="text-sm text-ml-blue font-bold">{mobileLogoSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="30" max="200" 
                    value={mobileLogoSize} 
                    onChange={(e) => setMobileLogoSize(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-ml-blue"
                  />
                  <p className="text-xs text-gray-400 mt-1">Recomendado: 60px a 100px</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Colors Section */}
        <Card className="bg-white border-none shadow-sm rounded-md">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-lg font-medium text-ml-dark">Tons de Cores</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Cor Principal (Fundo do Cabeçalho)</label>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-sm border border-gray-200 overflow-hidden shadow-sm relative">
                    <input 
                      type="color" 
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="absolute inset-0 w-full h-full cursor-pointer scale-150"
                    />
                  </div>
                  <input 
                    type="text" 
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue uppercase w-28 text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Cor Secundária (Botões e Links)</label>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-sm border border-gray-200 overflow-hidden shadow-sm relative">
                    <input 
                      type="color" 
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="absolute inset-0 w-full h-full cursor-pointer scale-150"
                    />
                  </div>
                  <input 
                    type="text" 
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue uppercase w-28 text-sm font-medium"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Header Promo Section */}
        <Card className="bg-white border-none shadow-sm rounded-md">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-lg font-medium text-ml-dark">Promoção do Cabeçalho (Canto Superior Direito)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL do GIF/Ícone</label>
                <input 
                  type="text" 
                  value={headerPromo.gifUrl}
                  onChange={(e) => setHeaderPromo({...headerPromo, gifUrl: e.target.value})}
                  className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue text-sm"
                  placeholder="https://exemplo.com/icone.gif"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texto de Chamada</label>
                <input 
                  type="text" 
                  value={headerPromo.text}
                  onChange={(e) => setHeaderPromo({...headerPromo, text: e.target.value})}
                  className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue text-sm"
                  placeholder="Ex: Assine o Meli+"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Link de Redirecionamento</label>
                <input 
                  type="text" 
                  value={headerPromo.link}
                  onChange={(e) => setHeaderPromo({...headerPromo, link: e.target.value})}
                  className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue text-sm"
                  placeholder="Ex: /meliplus"
                />
              </div>
            </div>
            
            {/* Preview */}
            <div className="mt-6 p-4 bg-ml-yellow rounded-md flex justify-end items-center border border-yellow-400">
              <a href={headerPromo.link} className="flex items-center gap-2 text-ml-dark font-medium text-sm hover:opacity-80 transition-opacity">
                {headerPromo.gifUrl && <img src={headerPromo.gifUrl} alt="Promo Icon" className="h-6 object-contain" />}
                <span>{headerPromo.text}</span>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Banners Section */}
        <Card className="bg-white border-none shadow-sm rounded-md">
          <CardHeader className="border-b border-gray-100 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium text-ml-dark">Banners da Home</CardTitle>
            <Button className="bg-ml-blue/10 text-ml-blue hover:bg-ml-blue hover:text-white font-semibold px-4 py-1.5 h-auto text-sm transition-colors rounded-sm shadow-none flex items-center gap-1">
              <Plus className="w-4 h-4" /> Novo Banner
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {banners.map((banner, idx) => (
                <div key={banner.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="w-32 h-16 bg-gray-200 rounded-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {banner.desktopImage ? (
                      <img src={banner.desktopImage} alt={`Banner ${idx + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-grow space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">URL da Imagem (Desktop)</label>
                      <input 
                        type="text" 
                        value={banner.desktopImage}
                        className="w-full h-8 px-2 border border-gray-200 rounded-sm focus:outline-none focus:border-ml-blue text-sm text-gray-600"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">URL da Imagem (Mobile)</label>
                      <input 
                        type="text" 
                        value={banner.mobileImage}
                        className="w-full h-8 px-2 border border-gray-200 rounded-sm focus:outline-none focus:border-ml-blue text-sm text-gray-600"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Link de Redirecionamento</label>
                      <input 
                        type="text" 
                        value={banner.link}
                        className="w-full h-8 px-2 border border-gray-200 rounded-sm focus:outline-none focus:border-ml-blue text-sm text-gray-600"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="flex-shrink-0 px-2">
                    <button className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save Bar */}
        <div className="flex justify-end pt-4">
          <Button className="bg-ml-blue text-white hover:bg-ml-hover font-semibold py-6 px-10 text-base rounded-sm shadow-md">
            Publicar Alterações
          </Button>
        </div>

      </div>
    </AdminLayout>
  )
}
