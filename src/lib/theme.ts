const DEFAULT_PRIMARY = '#ffe600'
const DEFAULT_SECONDARY = '#3483fa'

type PlatformTheme = {
  primaryColor?: string | null
  secondaryColor?: string | null
  faviconUrl?: string | null
  browserTitle?: string | null
  browserTitleInactive?: string | null
  layoutTheme?: Partial<LayoutTheme> | null
}

export type LayoutTheme = {
  pageBackground: string
  surfaceBackground: string
  subtleBackground: string
  borderColor: string
  textPrimary: string
  textMuted: string
  linkColor: string
  linkHoverColor: string
  buttonPrimaryBg: string
  buttonPrimaryText: string
  buttonPrimaryHover: string
  buttonSecondaryBg: string
  buttonSecondaryText: string
  buttonSecondaryHover: string
  accentColor: string
  accentTextColor: string
  successColor: string
  priceColor: string
  ratingColor: string
  dashboardSidebarBg: string
  dashboardSidebarHeaderBg: string
  dashboardSidebarText: string
  dashboardSidebarMutedText: string
  dashboardSidebarKickerText: string
  dashboardSidebarBorder: string
  dashboardSidebarHoverBg: string
  dashboardSidebarHoverText: string
  dashboardSidebarActiveBg: string
  dashboardSidebarActiveText: string
  headerAccountLinkColor: string
  headerLogoutColor: string
  homeDepartmentsBg: string
  homeDepartmentsText: string
  homeDepartmentsMutedText: string
  homeDepartmentsBorder: string
  homeDepartmentsHoverBg: string
  homeDepartmentsHoverText: string
  homeDepartmentsIcon: string
  whatsappGroupsBg: string
  whatsappGroupsText: string
  whatsappGroupsMutedText: string
  whatsappGroupsBorder: string
  whatsappGroupsLink: string
  whatsappGroupsEmptyBg: string
  whatsappGroupsEmptyText: string
  whatsappGroupsEmptyIcon: string
  whatsappGroupsStoryRingStart: string
  whatsappGroupsStoryRingMiddle: string
  whatsappGroupsStoryRingEnd: string
  categoryMenuBg: string
  categoryMenuHeaderBg: string
  categoryMenuText: string
  categoryMenuMutedText: string
  categoryMenuBorder: string
  categoryMenuLink: string
  categoryMenuHoverBg: string
  categoryMenuHoverText: string
  categoryMenuIconBg: string
}

export const DEFAULT_LAYOUT_THEME: LayoutTheme = {
  pageBackground: '#e3e6e6',
  surfaceBackground: '#ffffff',
  subtleBackground: '#f8fafc',
  borderColor: '#e5e7eb',
  textPrimary: '#111827',
  textMuted: '#6b7280',
  linkColor: '#007185',
  linkHoverColor: '#c7511f',
  buttonPrimaryBg: '#ff9900',
  buttonPrimaryText: '#131921',
  buttonPrimaryHover: '#ffb84d',
  buttonSecondaryBg: '#ffd814',
  buttonSecondaryText: '#111827',
  buttonSecondaryHover: '#f7ca00',
  accentColor: '#ff9900',
  accentTextColor: '#131921',
  successColor: '#007600',
  priceColor: '#b12704',
  ratingColor: '#ffa41c',
  dashboardSidebarBg: '#131921',
  dashboardSidebarHeaderBg: '#232f3e',
  dashboardSidebarText: '#ffffff',
  dashboardSidebarMutedText: '#cbd5e1',
  dashboardSidebarKickerText: '#ff9900',
  dashboardSidebarBorder: '#0f172a',
  dashboardSidebarHoverBg: '#263241',
  dashboardSidebarHoverText: '#ffffff',
  dashboardSidebarActiveBg: '#ff9900',
  dashboardSidebarActiveText: '#131921',
  headerAccountLinkColor: '#007185',
  headerLogoutColor: '#ef4444',
  homeDepartmentsBg: '#ffffff',
  homeDepartmentsText: '#111827',
  homeDepartmentsMutedText: '#6b7280',
  homeDepartmentsBorder: '#e5e7eb',
  homeDepartmentsHoverBg: '#f8fafc',
  homeDepartmentsHoverText: '#007185',
  homeDepartmentsIcon: '#9ca3af',
  whatsappGroupsBg: '#ffffff',
  whatsappGroupsText: '#111827',
  whatsappGroupsMutedText: '#6b7280',
  whatsappGroupsBorder: '#e5e7eb',
  whatsappGroupsLink: '#007185',
  whatsappGroupsEmptyBg: '#f8fafc',
  whatsappGroupsEmptyText: '#6b7280',
  whatsappGroupsEmptyIcon: '#007600',
  whatsappGroupsStoryRingStart: '#007600',
  whatsappGroupsStoryRingMiddle: '#ff9900',
  whatsappGroupsStoryRingEnd: '#c7511f',
  categoryMenuBg: '#ffffff',
  categoryMenuHeaderBg: '#f8fafc',
  categoryMenuText: '#111827',
  categoryMenuMutedText: '#6b7280',
  categoryMenuBorder: '#e5e7eb',
  categoryMenuLink: '#007185',
  categoryMenuHoverBg: '#f8fafc',
  categoryMenuHoverText: '#c7511f',
  categoryMenuIconBg: '#ffffff',
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
  return title?.trim() || 'Cookie market'
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
  const layoutTheme = { ...DEFAULT_LAYOUT_THEME, ...(theme.layoutTheme ?? {}) }
  const root = document.documentElement

  root.style.setProperty('--platform-primary', primary)
  root.style.setProperty('--platform-secondary', secondary)
  root.style.setProperty('--platform-secondary-hover', secondaryHover)

  root.style.setProperty('--color-primary', primary)
  root.style.setProperty('--color-ml-yellow', primary)
  root.style.setProperty('--color-ml-blue', secondary)
  root.style.setProperty('--color-ml-hover', secondaryHover)

  Object.entries(layoutTheme).forEach(([key, value]) => {
    const cssName = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
    root.style.setProperty(`--layout-${cssName}`, normalizeHex(value, DEFAULT_LAYOUT_THEME[key as keyof LayoutTheme]))
  })

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
