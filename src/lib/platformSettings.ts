import { supabase } from './supabase'
import { applyPlatformTheme, type LayoutTheme } from './theme'

const STORAGE_KEY = 'cookie-market-platform-settings'

export type HeaderPromoSettings = {
  enabled: boolean
  gifUrl: string
  text: string
  link: string
  backgroundColor: string
  textColor: string
}

export type HomeSectionSettings = {
  homeDealsTop: boolean
  homeDealsBottom: boolean
  homeGrid1: boolean
  homeGrid2: boolean
  homeGrid3: boolean
  homeGrid4: boolean
  homePopularCategories: boolean
  homeMiddle: boolean
  homeBottom: boolean
}

export type StoreBioThemeSettings = {
  pageBackground: string
  loaderColor: string
  avatarBackground: string
  avatarBorderColor: string
  avatarFallbackText: string
  verifiedBadgeBackground: string
  verifiedBadgeIcon: string
  storeNameText: string
  bioText: string
  countBadgeBackground: string
  countBadgeBorder: string
  countBadgeText: string
  productCardBackground: string
  productCardBorder: string
  productCardShadow: string
  productImageBackground: string
  productTitleText: string
  productPriceText: string
  productButtonBackground: string
  productButtonText: string
  emptyCardBackground: string
  emptyCardBorder: string
  emptyText: string
  footerText: string
  errorTitleText: string
  errorBodyText: string
  errorButtonBackground: string
  errorButtonText: string
}

export type PlatformSettingsSnapshot = {
  primaryColor?: string | null
  secondaryColor?: string | null
  faviconUrl?: string | null
  browserTitle?: string | null
  browserTitleInactive?: string | null
  layoutTheme?: Partial<LayoutTheme> | null
  logoUrl: string
  logoDesktopSize: number
  logoMobileSize: number
  headerPromo: HeaderPromoSettings
  topbarBackgroundColor: string
  topbarTextColor: string
  navBackgroundColor: string
  navTextColor: string
  homeSections: HomeSectionSettings
  storeBioTheme: StoreBioThemeSettings
}

export const DEFAULT_HEADER_PROMO: HeaderPromoSettings = {
  enabled: true,
  gifUrl: 'https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.19.1/mercadolibre/mplus-icon.svg',
  text: 'Ofertas e beneficios para compradores verificados',
  link: '/',
  backgroundColor: '#fff3c4',
  textColor: '#1f2937',
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettingsSnapshot = {
  primaryColor: '#ffe600',
  secondaryColor: '#3483fa',
  faviconUrl: null,
  browserTitle: 'Cookie market',
  browserTitleInactive: 'Cookie market',
  layoutTheme: null,
  logoUrl: '',
  logoDesktopSize: 130,
  logoMobileSize: 80,
  headerPromo: DEFAULT_HEADER_PROMO,
  topbarBackgroundColor: '#fff3c4',
  topbarTextColor: '#1f2937',
  navBackgroundColor: '#ffe600',
  navTextColor: '#333333',
  homeSections: {
    homeDealsTop: false,
    homeDealsBottom: false,
    homeGrid1: false,
    homeGrid2: false,
    homeGrid3: false,
    homeGrid4: false,
    homePopularCategories: false,
    homeMiddle: false,
    homeBottom: false,
  },
  storeBioTheme: {
    pageBackground: '#f7f1ed',
    loaderColor: '#3b1f18',
    avatarBackground: '#f0e8e2',
    avatarBorderColor: '#ffffff',
    avatarFallbackText: '#8a4f3f',
    verifiedBadgeBackground: '#ffffff',
    verifiedBadgeIcon: '#16a34a',
    storeNameText: '#1f130f',
    bioText: '#6b5a54',
    countBadgeBackground: '#ffffff',
    countBadgeBorder: '#ffffff',
    countBadgeText: '#7a4638',
    productCardBackground: '#ffffff',
    productCardBorder: '#ffffff',
    productCardShadow: '#d8c9c1',
    productImageBackground: '#f0e8e2',
    productTitleText: '#1f130f',
    productPriceText: '#15803d',
    productButtonBackground: '#3b1f18',
    productButtonText: '#ffffff',
    emptyCardBackground: '#ffffff',
    emptyCardBorder: '#ffffff',
    emptyText: '#6b5a54',
    footerText: '#7a4638',
    errorTitleText: '#1f130f',
    errorBodyText: '#6b5a54',
    errorButtonBackground: '#3b1f18',
    errorButtonText: '#ffffff',
  },
}

type PlatformSettingsRow = {
  primary_color?: string | null
  secondary_color?: string | null
  favicon_url?: string | null
  browser_title?: string | null
  browser_title_inactive?: string | null
  layout_theme_json?: Partial<LayoutTheme> | null
  logo_url?: string | null
  logo_desktop_size?: number | string | null
  logo_mobile_size?: number | string | null
  header_promo_json?: Partial<HeaderPromoSettings> | null
  header_topbar_bg_color?: string | null
  header_topbar_text_color?: string | null
  header_nav_bg_color?: string | null
  header_nav_text_color?: string | null
  home_sections_json?: Partial<HomeSectionSettings> | null
  store_bio_theme_json?: Partial<StoreBioThemeSettings> | null
}

let memorySnapshot: PlatformSettingsSnapshot | null = null
let pendingLoad: Promise<PlatformSettingsSnapshot> | null = null

function normalizeSnapshot(row?: PlatformSettingsRow | null): PlatformSettingsSnapshot {
  return {
    ...DEFAULT_PLATFORM_SETTINGS,
    primaryColor: row?.primary_color ?? DEFAULT_PLATFORM_SETTINGS.primaryColor,
    secondaryColor: row?.secondary_color ?? DEFAULT_PLATFORM_SETTINGS.secondaryColor,
    faviconUrl: row?.favicon_url ?? DEFAULT_PLATFORM_SETTINGS.faviconUrl,
    browserTitle: row?.browser_title ?? DEFAULT_PLATFORM_SETTINGS.browserTitle,
    browserTitleInactive: row?.browser_title_inactive ?? DEFAULT_PLATFORM_SETTINGS.browserTitleInactive,
    layoutTheme: row?.layout_theme_json ?? DEFAULT_PLATFORM_SETTINGS.layoutTheme,
    logoUrl: row?.logo_url ?? DEFAULT_PLATFORM_SETTINGS.logoUrl,
    logoDesktopSize: Number(row?.logo_desktop_size ?? DEFAULT_PLATFORM_SETTINGS.logoDesktopSize),
    logoMobileSize: Number(row?.logo_mobile_size ?? DEFAULT_PLATFORM_SETTINGS.logoMobileSize),
    headerPromo: {
      ...DEFAULT_HEADER_PROMO,
      ...(row?.header_promo_json ?? {}),
    },
    topbarBackgroundColor: row?.header_topbar_bg_color ?? DEFAULT_PLATFORM_SETTINGS.topbarBackgroundColor,
    topbarTextColor: row?.header_topbar_text_color ?? DEFAULT_PLATFORM_SETTINGS.topbarTextColor,
    navBackgroundColor: row?.header_nav_bg_color ?? DEFAULT_PLATFORM_SETTINGS.navBackgroundColor,
    navTextColor: row?.header_nav_text_color ?? DEFAULT_PLATFORM_SETTINGS.navTextColor,
    homeSections: {
      ...DEFAULT_PLATFORM_SETTINGS.homeSections,
      ...(row?.home_sections_json ?? {}),
    },
    storeBioTheme: {
      ...DEFAULT_PLATFORM_SETTINGS.storeBioTheme,
      ...(row?.store_bio_theme_json ?? {}),
    },
  }
}

function saveCachedPlatformSettings(snapshot: PlatformSettingsSnapshot) {
  memorySnapshot = snapshot

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // Cache is an optimization only.
  }
}

export function readCachedPlatformSettings() {
  if (memorySnapshot) return memorySnapshot

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    memorySnapshot = { ...DEFAULT_PLATFORM_SETTINGS, ...JSON.parse(raw) }
    return memorySnapshot
  } catch {
    return null
  }
}

export function applyPlatformSettings(snapshot: PlatformSettingsSnapshot) {
  applyPlatformTheme({
    primaryColor: snapshot.primaryColor,
    secondaryColor: snapshot.secondaryColor,
    faviconUrl: snapshot.faviconUrl,
    browserTitle: snapshot.browserTitle,
    browserTitleInactive: snapshot.browserTitleInactive,
    layoutTheme: snapshot.layoutTheme,
  })
}

export async function loadPlatformSettings({ force = false } = {}) {
  if (!force && memorySnapshot) return memorySnapshot
  if (pendingLoad) return pendingLoad

  pendingLoad = supabase
    .from('platform_settings')
    .select('primary_color, secondary_color, favicon_url, browser_title, browser_title_inactive, layout_theme_json, logo_url, logo_desktop_size, logo_mobile_size, header_promo_json, header_topbar_bg_color, header_topbar_text_color, header_nav_bg_color, header_nav_text_color, home_sections_json, store_bio_theme_json')
    .eq('id', 1)
    .maybeSingle()
    .then(({ data, error }) => {
      if (error) throw error
      const snapshot = normalizeSnapshot(data)
      saveCachedPlatformSettings(snapshot)
      return snapshot
    })
    .finally(() => {
      pendingLoad = null
    })

  return pendingLoad
}
