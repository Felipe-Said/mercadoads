ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO public.platform_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Admins update platform settings." ON public.platform_settings;
DROP POLICY IF EXISTS "Admins manage platform settings." ON public.platform_settings;

CREATE POLICY "Admins manage platform settings." ON public.platform_settings
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
