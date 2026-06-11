import React, { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getBanners, type Banner } from '../lib/data'

export function Banners({ position = 'home_hero' }: { position?: 'home_hero' | 'home_middle' | 'home_bottom' }) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [current, setCurrent] = useState(0)
  const isHero = position === 'home_hero'

  useEffect(() => {
    getBanners().then((allBanners) => {
      setBanners(allBanners.filter((b) => b.position === position))
    }).catch(console.error)
  }, [position])

  useEffect(() => {
    if (banners.length < 2) return
    const timer = window.setInterval(() => {
      setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => window.clearInterval(timer)
  }, [banners.length])

  const next = () => setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1))
  const prev = () => setCurrent((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
  const hasText = (banner: Banner) => Boolean(banner.title?.trim() || banner.subtitle?.trim())

  return (
    <div className={`relative w-full overflow-hidden rounded-md border border-black/5 bg-white shadow-sm ${isHero ? 'min-h-[180px]' : ''}`}>
      <div className="relative flex w-full justify-center">
        <div className="group relative w-full overflow-hidden">
          <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${current * 100}%)` }}>
            {banners.length > 0 ? (
              banners.map((banner) => {
                const showText = hasText(banner)

                return (
                  <a
                    key={banner.id}
                    href={banner.link}
                    className={`relative flex w-full flex-shrink-0 items-center justify-center overflow-hidden ${showText || !banner.image ? 'h-[240px] md:h-[320px]' : ''}`}
                    style={{ backgroundColor: banner.color }}
                  >
                    {banner.image && (
                      <img
                        src={banner.image}
                        alt={banner.title || 'Banner principal'}
                        className={showText ? 'absolute inset-0 h-full w-full object-cover opacity-75' : 'relative block h-auto w-full object-contain'}
                      />
                    )}
                    {showText && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
                        <div className="z-20 mr-auto w-full max-w-3xl p-7 text-left text-white md:p-12">
                          {banner.title && <h2 className="mb-3 text-3xl font-bold leading-tight drop-shadow-md md:text-5xl">{banner.title}</h2>}
                          {banner.subtitle && <p className="mb-5 text-base font-normal opacity-95 md:text-lg">{banner.subtitle}</p>}
                          <span className="inline-flex rounded-sm bg-white px-6 py-3 text-sm font-bold text-ml-blue shadow-sm transition hover:bg-gray-100">Explorar agora</span>
                        </div>
                      </>
                    )}
                  </a>
                )
              })
            ) : (
              <div className="relative flex h-[220px] w-full flex-shrink-0 items-center justify-center overflow-hidden bg-gradient-to-r from-ml-blue to-blue-600">
                <div className="z-20 p-8 text-center text-white">
                  <h2 className="mb-2 text-3xl font-bold drop-shadow-md md:text-4xl">Bem-vindo a nossa loja</h2>
                  <p className="text-md opacity-90 md:text-lg">Navegue pelas ofertas verificadas abaixo.</p>
                </div>
              </div>
            )}
          </div>

          {banners.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ml-blue opacity-0 shadow-md transition-opacity hover:bg-white group-hover:opacity-100">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={next} className="absolute right-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ml-blue opacity-0 shadow-md transition-opacity hover:bg-white group-hover:opacity-100">
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
