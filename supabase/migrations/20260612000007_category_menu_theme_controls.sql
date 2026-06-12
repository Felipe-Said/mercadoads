UPDATE public.platform_settings
SET layout_theme_json = COALESCE(layout_theme_json, '{}'::jsonb)
  || jsonb_build_object(
    'categoryMenuBg', COALESCE(layout_theme_json->>'categoryMenuBg', '#ffffff'),
    'categoryMenuHeaderBg', COALESCE(layout_theme_json->>'categoryMenuHeaderBg', '#f8fafc'),
    'categoryMenuText', COALESCE(layout_theme_json->>'categoryMenuText', '#111827'),
    'categoryMenuMutedText', COALESCE(layout_theme_json->>'categoryMenuMutedText', '#6b7280'),
    'categoryMenuBorder', COALESCE(layout_theme_json->>'categoryMenuBorder', '#e5e7eb'),
    'categoryMenuLink', COALESCE(layout_theme_json->>'categoryMenuLink', '#007185'),
    'categoryMenuHoverBg', COALESCE(layout_theme_json->>'categoryMenuHoverBg', '#f8fafc'),
    'categoryMenuHoverText', COALESCE(layout_theme_json->>'categoryMenuHoverText', '#c7511f'),
    'categoryMenuIconBg', COALESCE(layout_theme_json->>'categoryMenuIconBg', '#ffffff')
  )
WHERE id = 1;
