import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { applyPlatformTheme, bindBrowserTitle } from '../lib/theme'

export function PlatformTheme() {
  useEffect(() => {
    let cleanupTitle = () => {}

    const syncPlatformSettings = async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('primary_color, secondary_color, favicon_url, browser_title, browser_title_inactive, layout_theme_json')
        .eq('id', 1)
        .maybeSingle()

      if (error) throw error

      applyPlatformTheme({
        primaryColor: data?.primary_color,
        secondaryColor: data?.secondary_color,
        faviconUrl: data?.favicon_url,
        browserTitle: data?.browser_title,
        browserTitleInactive: data?.browser_title_inactive,
        layoutTheme: data?.layout_theme_json,
      })

      cleanupTitle()
      cleanupTitle = bindBrowserTitle(data?.browser_title, data?.browser_title_inactive)
    }

    const handleSettingsUpdated = () => {
      syncPlatformSettings().catch(console.error)
    }

    syncPlatformSettings().catch(console.error)
    window.addEventListener('platform-settings-updated', handleSettingsUpdated)

    return () => {
      cleanupTitle()
      window.removeEventListener('platform-settings-updated', handleSettingsUpdated)
    }
  }, [])

  return null
}
