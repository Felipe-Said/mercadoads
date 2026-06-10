import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type PlatformLogoProps = {
  className?: string
  imageClassName?: string
  fallbackClassName?: string
}

type LogoSettings = {
  logoUrl: string
  logoDesktopSize: number
  logoMobileSize: number
}

const DEFAULT_LOGO_SETTINGS: LogoSettings = {
  logoUrl: '',
  logoDesktopSize: 130,
  logoMobileSize: 80,
}

export function PlatformLogo({ className = '', imageClassName = '', fallbackClassName = '' }: PlatformLogoProps) {
  const [settings, setSettings] = useState<LogoSettings>(DEFAULT_LOGO_SETTINGS)

  useEffect(() => {
    let mounted = true

    const loadLogo = async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('logo_url, logo_desktop_size, logo_mobile_size')
        .eq('id', 1)
        .maybeSingle()

      if (error || !mounted) return

      setSettings({
        logoUrl: data?.logo_url ?? '',
        logoDesktopSize: Number(data?.logo_desktop_size ?? DEFAULT_LOGO_SETTINGS.logoDesktopSize),
        logoMobileSize: Number(data?.logo_mobile_size ?? DEFAULT_LOGO_SETTINGS.logoMobileSize),
      })
    }

    const handleSettingsUpdated = () => {
      loadLogo().catch(console.error)
    }

    loadLogo().catch(console.error)
    window.addEventListener('platform-settings-updated', handleSettingsUpdated)

    return () => {
      mounted = false
      window.removeEventListener('platform-settings-updated', handleSettingsUpdated)
    }
  }, [])

  if (settings.logoUrl) {
    return (
      <img
        src={settings.logoUrl}
        alt="Logo da plataforma"
        className={`object-contain ${imageClassName}`}
        style={{ width: `clamp(${settings.logoMobileSize}px, 12vw, ${settings.logoDesktopSize}px)` }}
      />
    )
  }

  return (
    <span className={`inline-flex items-center font-bold tracking-tight ${className} ${fallbackClassName}`}>
      <span className="text-ml-blue mr-1">Mercado</span>
      <span className="text-ml-dark">Ads</span>
    </span>
  )
}
