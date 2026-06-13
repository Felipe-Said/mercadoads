ALTER TABLE public.network_groups
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS promotion_status TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS promotion_amount NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS promoted_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_gateway TEXT,
  ADD COLUMN IF NOT EXISTS payment_external_ref TEXT,
  ADD COLUMN IF NOT EXISTS payment_transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_qrcode TEXT,
  ADD COLUMN IF NOT EXISTS payment_qrcode_text TEXT,
  ADD COLUMN IF NOT EXISTS payment_qrcode_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS gateway_payload JSONB;

UPDATE public.network_groups
SET promotion_status = CASE WHEN sponsored IS TRUE THEN 'paid' ELSE 'none' END
WHERE promotion_status IS NULL OR promotion_status = 'none';

CREATE UNIQUE INDEX IF NOT EXISTS network_groups_unique_link_idx
  ON public.network_groups (LOWER(TRIM(link)));

CREATE INDEX IF NOT EXISTS network_groups_owner_created_idx
  ON public.network_groups (owner_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.validate_network_group_owner_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  current_count INTEGER;
BEGIN
  IF NEW.owner_id IS NULL THEN
    NEW.owner_id := auth.uid();
  END IF;

  IF NEW.owner_id IS DISTINCT FROM auth.uid() AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Grupo invalido';
  END IF;

  SELECT role INTO user_role FROM public.profiles WHERE id = NEW.owner_id;

  IF COALESCE(user_role, 'user') = 'user' THEN
    SELECT COUNT(*)
      INTO current_count
      FROM public.network_groups
     WHERE owner_id = NEW.owner_id
       AND (TG_OP = 'INSERT' OR id <> NEW.id);

    IF current_count >= 5 THEN
      RAISE EXCEPTION 'Usuarios comuns podem cadastrar ate 5 grupos';
    END IF;
  END IF;

  NEW.link := TRIM(NEW.link);
  NEW.is_active := COALESCE(NEW.is_active, TRUE);
  NEW.sponsored := COALESCE(NEW.sponsored, FALSE);
  NEW.promotion_status := COALESCE(NEW.promotion_status, 'none');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_network_group_owner_limit ON public.network_groups;
CREATE TRIGGER validate_network_group_owner_limit
  BEFORE INSERT OR UPDATE ON public.network_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_network_group_owner_limit();

DO $$
BEGIN
  DROP POLICY IF EXISTS "Users manage own network groups." ON public.network_groups;
  DROP POLICY IF EXISTS "Users view own network groups." ON public.network_groups;

  CREATE POLICY "Users view own network groups." ON public.network_groups
    FOR SELECT USING (is_active = true OR owner_id = auth.uid() OR public.is_admin());

  CREATE POLICY "Users manage own network groups." ON public.network_groups
    FOR ALL USING (owner_id = auth.uid() OR public.is_admin())
    WITH CHECK (owner_id = auth.uid() OR public.is_admin());
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.network_groups TO authenticated;
