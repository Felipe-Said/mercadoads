import { useEffect } from 'react'
import { applyPlatformSettings, loadPlatformSettings, readCachedPlatformSettings } from '../lib/platformSettings'
import { bindBrowserTitle } from '../lib/theme'

export function PlatformTheme() {
  useEffect(() => {
    let cleanupTitle = () => {}
    const initialSettings = readCachedPlatformSettings()

    if (initialSettings) {
      cleanupTitle = bindBrowserTitle(initialSettings.browserTitle, initialSettings.browserTitleInactive)
    }

    const syncPlatformSettings = async () => {
      const settings = await loadPlatformSettings({ force: true })
      applyPlatformSettings(settings)

      cleanupTitle()
      cleanupTitle = bindBrowserTitle(settings.browserTitle, settings.browserTitleInactive)
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
