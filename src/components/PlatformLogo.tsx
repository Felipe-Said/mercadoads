import { useEffect, useState } from 'react'
import { DEFAULT_PLATFORM_SETTINGS, loadPlatformSettings, readCachedPlatformSettings } from '../lib/platformSettings'

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
  logoUrl: DEFAULT_PLATFORM_SETTINGS.logoUrl,
  logoDesktopSize: DEFAULT_PLATFORM_SETTINGS.logoDesktopSize,
  logoMobileSize: DEFAULT_PLATFORM_SETTINGS.logoMobileSize,
}

function getInitialLogoSettings(): LogoSettings {
  const settings = readCachedPlatformSettings()
  if (!settings) return DEFAULT_LOGO_SETTINGS

  return {
    logoUrl: settings.logoUrl,
    logoDesktopSize: settings.logoDesktopSize,
    logoMobileSize: settings.logoMobileSize,
  }
}

export function PlatformLogo({ className = '', imageClassName = '', fallbackClassName = '' }: PlatformLogoProps) {
  const [settings, setSettings] = useState<LogoSettings>(getInitialLogoSettings)

  useEffect(() => {
    let mounted = true

    const loadLogo = async () => {
      const data = await loadPlatformSettings({ force: true })
      if (!mounted) return

      setSettings({
        logoUrl: data.logoUrl,
        logoDesktopSize: data.logoDesktopSize,
        logoMobileSize: data.logoMobileSize,
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
      <span className="mr-1 text-[var(--layout-accent-color)]">Cookie</span>
      <span className="text-[var(--layout-text-primary)]">market</span>
    </span>
  )
}
