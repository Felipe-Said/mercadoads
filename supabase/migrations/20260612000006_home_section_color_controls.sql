UPDATE public.platform_settings
SET layout_theme_json = COALESCE(layout_theme_json, '{}'::jsonb)
  || jsonb_build_object(
    'homeDepartmentsBg', COALESCE(layout_theme_json->>'homeDepartmentsBg', '#ffffff'),
    'homeDepartmentsText', COALESCE(layout_theme_json->>'homeDepartmentsText', '#111827'),
    'homeDepartmentsMutedText', COALESCE(layout_theme_json->>'homeDepartmentsMutedText', '#6b7280'),
    'homeDepartmentsBorder', COALESCE(layout_theme_json->>'homeDepartmentsBorder', '#e5e7eb'),
    'homeDepartmentsHoverBg', COALESCE(layout_theme_json->>'homeDepartmentsHoverBg', '#f8fafc'),
    'homeDepartmentsHoverText', COALESCE(layout_theme_json->>'homeDepartmentsHoverText', '#007185'),
    'homeDepartmentsIcon', COALESCE(layout_theme_json->>'homeDepartmentsIcon', '#9ca3af'),
    'whatsappGroupsBg', COALESCE(layout_theme_json->>'whatsappGroupsBg', '#ffffff'),
    'whatsappGroupsText', COALESCE(layout_theme_json->>'whatsappGroupsText', '#111827'),
    'whatsappGroupsMutedText', COALESCE(layout_theme_json->>'whatsappGroupsMutedText', '#6b7280'),
    'whatsappGroupsBorder', COALESCE(layout_theme_json->>'whatsappGroupsBorder', '#e5e7eb'),
    'whatsappGroupsLink', COALESCE(layout_theme_json->>'whatsappGroupsLink', '#007185'),
    'whatsappGroupsStoryRingStart', COALESCE(layout_theme_json->>'whatsappGroupsStoryRingStart', '#007600'),
    'whatsappGroupsStoryRingMiddle', COALESCE(layout_theme_json->>'whatsappGroupsStoryRingMiddle', '#ff9900'),
    'whatsappGroupsStoryRingEnd', COALESCE(layout_theme_json->>'whatsappGroupsStoryRingEnd', '#c7511f')
  )
WHERE id = 1;
