import React, { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getBanners, type Banner } from '../lib/data'

export function Banners({ position = 'home_hero' }: { position?: 'home_hero' | 'home_middle' | 'home_bottom' }) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    getBanners().then((allBanners) => {
      setBanners(allBanners.filter((b) => b.position === position))
    }).catch(console.error)
  }, [position])

  useEffect(() => {
    if (banners.length < 2) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(timer)
  }, [banners.length])

  const next = () => setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1))
  const prev = () => setCurrent((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
  const hasText = (banner: Banner) => Boolean(banner.title?.trim() || banner.subtitle?.trim())

  return (
    <div className="relative w-full mb-0 rounded-2xl overflow-hidden shadow-sm">
      <div className="w-full relative flex justify-center">

        <div className="relative w-full overflow-hidden group">
          <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${current * 100}%)` }}>
            {banners.length > 0 ? (
              banners.map((banner) => {
                const showText = hasText(banner)

                return (
                  <a
                    key={banner.id}
                    href={banner.link}
                    className={`w-full flex-shrink-0 relative flex items-center justify-center overflow-hidden ${showText || !banner.image ? 'h-[300px] md:h-[380px]' : ''}`}
                    style={{ backgroundColor: banner.color }}
                  >
                    {banner.image && (
                      <img
                        src={banner.image}
                        alt={banner.title || 'Banner principal'}
                        className={showText ? 'absolute inset-0 w-full h-full object-cover opacity-70' : 'relative block w-full h-auto object-contain'}
                      />
                    )}
                    {showText && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                      <div className="z-20 text-white text-left p-8 md:p-16 w-full max-w-3xl mr-auto">
                        {banner.title && <h2 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-md leading-tight">{banner.title}</h2>}
                        {banner.subtitle && <p className="text-lg md:text-xl mb-6 font-light opacity-90">{banner.subtitle}</p>}
                        <span className="inline-flex bg-white text-ml-blue font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition-all hover:scale-105 shadow-lg">Explorar Agora</span>
                      </div>
                    </>
                    )}
                  </a>
                )
              })
            ) : (
              <div className="w-full flex-shrink-0 relative flex items-center justify-center overflow-hidden h-[240px] bg-gradient-to-r from-blue-600 to-ml-blue rounded-2xl">
                <div className="z-20 text-white text-center p-8">
                  <h2 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-md">Bem-vindo(a) à nossa loja!</h2>
                  <p className="text-md md:text-lg opacity-90">Navegue pelas nossas ofertas abaixo.</p>
                </div>
              </div>
            )}
          </div>



          {banners.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-ml-blue p-4 shadow-md rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity z-30">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-ml-blue p-4 shadow-md rounded-l-full opacity-0 group-hover:opacity-100 transition-opacity z-30">
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
