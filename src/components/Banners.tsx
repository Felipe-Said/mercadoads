import React, { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getBanners, type Banner } from '../lib/data'

export function Banners() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    getBanners().then(setBanners).catch(console.error)
  }, [])

  const heroBanners = useMemo(() => banners.filter((banner) => banner.position === 'home_hero'), [banners])
  const leftFlyer = banners.find((banner) => banner.position === 'left_flyer')
  const rightFlyer = banners.find((banner) => banner.position === 'right_flyer')

  useEffect(() => {
    if (heroBanners.length < 2) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === heroBanners.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(timer)
  }, [heroBanners.length])

  if (heroBanners.length === 0) return null

  const next = () => setCurrent((prev) => (prev === heroBanners.length - 1 ? 0 : prev + 1))
  const prev = () => setCurrent((prev) => (prev === 0 ? heroBanners.length - 1 : prev - 1))
  const hasText = (banner: Banner) => Boolean(banner.title?.trim() || banner.subtitle?.trim())

  return (
    <div className="relative w-full mb-0">
      <div className="max-w-[1600px] mx-auto relative flex justify-center">
        
        {leftFlyer && (
          <a href={leftFlyer.link} className="hidden 2xl:flex absolute left-0 top-0 h-[400px] md:h-[500px] w-[150px] rounded-sm flex-col justify-center items-center overflow-hidden z-10" style={{ backgroundColor: leftFlyer.color }}>
            {leftFlyer.image ? <img src={leftFlyer.image} alt={leftFlyer.title || 'Banner lateral'} className="absolute inset-0 w-full h-full object-cover object-top" /> : <span className="relative z-10 bg-white text-ml-dark px-3 py-1 font-bold rounded-sm shadow-sm rotate-[-90deg] whitespace-nowrap">{leftFlyer.title || 'Banner'}</span>}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#ebebeb] to-transparent pointer-events-none z-10" />
          </a>
        )}

        <div className="relative w-full overflow-hidden group">
          <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${current * 100}%)` }}>
            {heroBanners.map((banner) => {
              const showText = hasText(banner)

              return (
                <a
                  key={banner.id}
                  href={banner.link}
                  className={`w-full flex-shrink-0 relative flex items-center justify-center overflow-hidden h-[400px] md:h-[500px]`}
                  style={{ backgroundColor: banner.color }}
                >
                  {banner.image && (
                    <img
                      src={banner.image}
                      alt={banner.title || 'Banner principal'}
                      className={`absolute inset-0 w-full h-full object-cover object-top ${showText ? 'opacity-70' : ''}`}
                    />
                  )}
                  {showText && (
                  <>
                    <div className="absolute inset-0 bg-black/25" />
                    <div className="z-20 text-white text-center p-8 mb-16">
                      {banner.title && <h2 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">{banner.title}</h2>}
                      {banner.subtitle && <p className="text-lg md:text-2xl mb-6">{banner.subtitle}</p>}
                      <span className="inline-flex bg-white text-ml-blue font-bold px-6 py-3 rounded-md hover:bg-gray-100 transition-colors shadow-lg">Ver ofertas</span>
                    </div>
                  </>
                  )}
                </a>
              )
            })}
          </div>

          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#ebebeb] to-transparent pointer-events-none z-10" />

          {heroBanners.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-4 top-1/3 -translate-y-1/2 bg-white/80 hover:bg-white text-ml-blue p-4 shadow-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-30">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={next} className="absolute right-4 top-1/3 -translate-y-1/2 bg-white/80 hover:bg-white text-ml-blue p-4 shadow-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-30">
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {rightFlyer && (
          <a href={rightFlyer.link} className="hidden 2xl:flex absolute right-0 top-0 h-[400px] md:h-[500px] w-[150px] rounded-sm flex-col justify-center items-center overflow-hidden z-10" style={{ backgroundColor: rightFlyer.color }}>
            {rightFlyer.image ? <img src={rightFlyer.image} alt={rightFlyer.title || 'Banner lateral'} className="absolute inset-0 w-full h-full object-cover object-top" /> : <span className="relative z-10 bg-white text-ml-dark px-3 py-1 font-bold rounded-sm shadow-sm rotate-90 whitespace-nowrap">{rightFlyer.title || 'Banner'}</span>}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#ebebeb] to-transparent pointer-events-none z-10" />
          </a>
        )}
      </div>
    </div>
  )
}
