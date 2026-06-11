ALTER TABLE public.platform_settings
  ADD COLUMN IF NOT EXISTS header_topbar_bg_color TEXT DEFAULT '#fff3c4',
  ADD COLUMN IF NOT EXISTS header_topbar_text_color TEXT DEFAULT '#1f2937',
  ADD COLUMN IF NOT EXISTS header_nav_bg_color TEXT DEFAULT '#ffe600',
  ADD COLUMN IF NOT EXISTS header_nav_text_color TEXT DEFAULT '#333333',
  ADD COLUMN IF NOT EXISTS layout_theme_json JSONB DEFAULT '{
    "pageBackground": "#e3e6e6",
    "surfaceBackground": "#ffffff",
    "subtleBackground": "#f8fafc",
    "borderColor": "#e5e7eb",
    "textPrimary": "#111827",
    "textMuted": "#6b7280",
    "linkColor": "#007185",
    "linkHoverColor": "#c7511f",
    "buttonPrimaryBg": "#ff9900",
    "buttonPrimaryText": "#131921",
    "buttonPrimaryHover": "#ffb84d",
    "buttonSecondaryBg": "#ffd814",
    "buttonSecondaryText": "#111827",
    "buttonSecondaryHover": "#f7ca00",
    "accentColor": "#ff9900",
    "accentTextColor": "#131921",
    "successColor": "#007600",
    "priceColor": "#b12704",
    "ratingColor": "#ffa41c",
    "dashboardSidebarBg": "#131921",
    "dashboardSidebarHeaderBg": "#232f3e",
    "dashboardSidebarText": "#ffffff",
    "dashboardSidebarActiveBg": "#ff9900",
    "dashboardSidebarActiveText": "#131921",
    "headerAccountLinkColor": "#007185",
    "headerLogoutColor": "#ef4444"
  }'::jsonb;

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('platform_assets', 'platform_assets', true, 10485760)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 10485760;

DROP POLICY IF EXISTS "Public platform assets are viewable." ON storage.objects;
DROP POLICY IF EXISTS "Admins upload platform assets." ON storage.objects;
DROP POLICY IF EXISTS "Admins update platform assets." ON storage.objects;
DROP POLICY IF EXISTS "Admins delete platform assets." ON storage.objects;

CREATE POLICY "Public platform assets are viewable." ON storage.objects
  FOR SELECT USING (bucket_id = 'platform_assets');

CREATE POLICY "Admins upload platform assets." ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'platform_assets' AND public.is_admin());

CREATE POLICY "Admins update platform assets." ON storage.objects
  FOR UPDATE USING (bucket_id = 'platform_assets' AND public.is_admin())
  WITH CHECK (bucket_id = 'platform_assets' AND public.is_admin());

CREATE POLICY "Admins delete platform assets." ON storage.objects
  FOR DELETE USING (bucket_id = 'platform_assets' AND public.is_admin());
