const DEFAULT_PRIMARY = '#ffe600'
const DEFAULT_SECONDARY = '#3483fa'

type PlatformTheme = {
  primaryColor?: string | null
  secondaryColor?: string | null
  faviconUrl?: string | null
  browserTitle?: string | null
  browserTitleInactive?: string | null
}

function normalizeHex(value: string | null | undefined, fallback: string) {
  if (!value) return fallback
  const trimmed = value.trim()
  if (/^#[0-9a-f]{6}$/i.test(trimmed)) return trimmed
  if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
    return `#${trimmed.slice(1).split('').map((char) => `${char}${char}`).join('')}`
  }
  return fallback
}

function darken(hex: string, amount: number) {
  const color = normalizeHex(hex, DEFAULT_SECONDARY).slice(1)
  const channels = [0, 2, 4].map((start) => {
    const next = Math.round(parseInt(color.slice(start, start + 2), 16) * (1 - amount))
    return next.toString(16).padStart(2, '0')
  })
  return `#${channels.join('')}`
}

function getFallbackTitle(title: string | null | undefined) {
  return title?.trim() || 'Mercado Ads'
}

export function setBrowserTitle(activeTitle?: string | null, inactiveTitle?: string | null) {
  const isHidden = document.visibilityState === 'hidden'
  document.title = isHidden ? getFallbackTitle(inactiveTitle ?? activeTitle) : getFallbackTitle(activeTitle)
}

export function bindBrowserTitle(activeTitle?: string | null, inactiveTitle?: string | null) {
  const updateTitle = () => setBrowserTitle(activeTitle, inactiveTitle)

  updateTitle()
  document.addEventListener('visibilitychange', updateTitle)
  window.addEventListener('focus', updateTitle)
  window.addEventListener('blur', updateTitle)

  return () => {
    document.removeEventListener('visibilitychange', updateTitle)
    window.removeEventListener('focus', updateTitle)
    window.removeEventListener('blur', updateTitle)
  }
}

export function applyPlatformTheme(theme: PlatformTheme) {
  const primary = normalizeHex(theme.primaryColor, DEFAULT_PRIMARY)
  const secondary = normalizeHex(theme.secondaryColor, DEFAULT_SECONDARY)
  const secondaryHover = darken(secondary, 0.18)
  const root = document.documentElement

  root.style.setProperty('--platform-primary', primary)
  root.style.setProperty('--platform-secondary', secondary)
  root.style.setProperty('--platform-secondary-hover', secondaryHover)

  root.style.setProperty('--color-primary', primary)
  root.style.setProperty('--color-ml-yellow', primary)
  root.style.setProperty('--color-ml-blue', secondary)
  root.style.setProperty('--color-ml-hover', secondaryHover)

  if (theme.faviconUrl !== undefined) {
    const faviconUrl = theme.faviconUrl?.trim() || '/favicon.svg'
    let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')

    if (!favicon) {
      favicon = document.createElement('link')
      favicon.rel = 'icon'
      document.head.appendChild(favicon)
    }

    favicon.href = faviconUrl
    favicon.type = faviconUrl.endsWith('.svg') ? 'image/svg+xml' : 'image/png'
  }

  if (theme.browserTitle !== undefined) {
    setBrowserTitle(theme.browserTitle, theme.browserTitleInactive)
  }
}
