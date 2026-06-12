import React, { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getBanners, type Banner, type BannerPosition } from '../lib/data'

type BannerSlotProps = {
  position: BannerPosition
  className?: string
  imageClassName?: string
  fallbackTitle?: string
  fallbackSubtitle?: string
  compact?: boolean
}

export function BannerSlot({
  position,
  className = '',
  imageClassName = '',
  fallbackTitle = 'Espaco para banner',
  fallbackSubtitle = 'Adicione esta peca no painel de personalizacao.',
  compact = false,
}: BannerSlotProps) {
  const [banner, setBanner] = useState<Banner | null>(null)

  useEffect(() => {
    getBanners(position)
      .then((items) => setBanner(items[0] ?? null))
      .catch(console.error)
  }, [position])

  const title = banner?.title?.trim()
  const subtitle = banner?.subtitle?.trim()
  const hasText = Boolean(title || subtitle)
  const content = banner ? (
    <>
      {banner.image || banner.mobile_image ? (
        <picture>
          {banner.mobile_image && <source media="(max-width: 767px)" srcSet={banner.mobile_image} />}
          <img
            src={banner.image || banner.mobile_image || ''}
            alt={title || 'Banner'}
            className={`h-full w-full object-contain ${imageClassName}`}
          />
        </picture>
      ) : (
        <div className="h-full w-full" style={{ backgroundColor: banner.color }} />
      )}
      {hasText && (
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/25 to-transparent p-4 text-white">
          <div>
            {title && <p className={`${compact ? 'text-sm' : 'text-xl'} font-bold leading-tight`}>{title}</p>}
            {subtitle && <p className="mt-1 line-clamp-2 text-xs font-medium opacity-90">{subtitle}</p>}
          </div>
        </div>
      )}
    </>
  ) : (
    <div className="flex h-full w-full flex-col justify-between bg-[var(--layout-dashboard-sidebar-bg)] p-4 text-[var(--layout-dashboard-sidebar-text)]">
      <span className="w-max rounded-sm bg-[var(--layout-accent-color)] px-2 py-1 text-[11px] font-bold text-[var(--layout-accent-text-color)]">Cookie market</span>
      <div>
        <p className={`${compact ? 'text-base' : 'text-2xl'} font-bold leading-tight`}>{fallbackTitle}</p>
        <p className="mt-1 text-xs text-white/75">{fallbackSubtitle}</p>
      </div>
    </div>
  )

  return (
    <a
      href={banner?.link || '/'}
      className={`group relative block overflow-hidden rounded-sm border border-black/10 bg-white shadow-sm ${className}`}
      data-banner-position={position}
    >
      {content}
    </a>
  )
}

export function Banners({ position = 'home_hero' }: { position?: BannerPosition }) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [current, setCurrent] = useState(0)
  const isHero = position === 'home_hero'

  useEffect(() => {
    setCurrent(0)
    getBanners(position).then(setBanners).catch(console.error)
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
                    {(banner.image || banner.mobile_image) && (
                      <picture>
                        {banner.mobile_image && <source media="(max-width: 767px)" srcSet={banner.mobile_image} />}
                        <img
                          src={banner.image || banner.mobile_image || ''}
                          alt={banner.title || 'Banner principal'}
                          className={showText ? 'absolute inset-0 h-full w-full object-cover opacity-75' : 'relative block h-auto w-full object-contain'}
                        />
                      </picture>
                    )}
                    {showText && (
                      <>
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent" />
                <div className="z-20 mr-auto w-full max-w-3xl p-7 text-left text-white md:p-12">
                  {banner.title && <h2 className="mb-3 text-3xl font-bold leading-tight drop-shadow-md md:text-5xl">{banner.title}</h2>}
                  {banner.subtitle && <p className="mb-5 text-base font-normal opacity-95 md:text-lg">{banner.subtitle}</p>}
                  <span className="inline-flex rounded-sm bg-[var(--layout-button-primary-bg)] px-6 py-3 text-sm font-bold text-[var(--layout-button-primary-text)] shadow-sm transition hover:bg-[var(--layout-button-primary-hover)]">Explorar agora</span>
                </div>
              </>
                    )}
                  </a>
                )
              })
            ) : (
              <div className="relative flex h-[220px] w-full flex-shrink-0 items-center justify-center overflow-hidden bg-[var(--layout-dashboard-sidebar-bg)]">
                <div className="z-20 p-8 text-center text-white">
                  <h2 className="mb-2 text-3xl font-bold drop-shadow-md md:text-4xl">Cookie market</h2>
                  <p className="text-md opacity-90 md:text-lg">Navegue pelas ofertas verificadas abaixo.</p>
                </div>
              </div>
            )}
          </div>

          {banners.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--layout-surface-background)]/90 text-[var(--layout-link-color)] opacity-0 shadow-md transition-opacity hover:bg-[var(--layout-surface-background)] group-hover:opacity-100">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={next} className="absolute right-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--layout-surface-background)]/90 text-[var(--layout-link-color)] opacity-0 shadow-md transition-opacity hover:bg-[var(--layout-surface-background)] group-hover:opacity-100">
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
