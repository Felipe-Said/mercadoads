import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { applyPlatformTheme } from '../lib/theme'

export function PlatformTheme() {
  useEffect(() => {
    supabase
      .from('platform_settings')
      .select('primary_color, secondary_color')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) throw error
        applyPlatformTheme({
          primaryColor: data?.primary_color,
          secondaryColor: data?.secondary_color,
        })
      })
      .catch(console.error)
  }, [])

  return null
}
