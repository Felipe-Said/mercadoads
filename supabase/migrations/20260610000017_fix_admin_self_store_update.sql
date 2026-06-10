CREATE OR REPLACE FUNCTION public.admin_update_user_controls(
  target_user_id UUID,
  next_role TEXT,
  next_status TEXT,
  next_store_name TEXT,
  next_seller_category TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_role TEXT;
  current_status TEXT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can update users.';
  END IF;

  IF next_role NOT IN ('user', 'seller', 'admin') THEN
    RAISE EXCEPTION 'Invalid role.';
  END IF;

  IF next_status NOT IN ('active', 'blocked') THEN
    RAISE EXCEPTION 'Invalid status.';
  END IF;

  SELECT role, COALESCE(status, 'active')
    INTO current_role, current_status
  FROM public.profiles
  WHERE id = target_user_id;

  IF current_role IS NULL THEN
    RAISE EXCEPTION 'User not found.';
  END IF;

  IF target_user_id = auth.uid()
     AND (next_role IS DISTINCT FROM current_role OR next_status IS DISTINCT FROM current_status) THEN
    RAISE EXCEPTION 'Admins cannot change their own role or status.';
  END IF;

  UPDATE public.profiles
  SET role = next_role,
      status = next_status,
      store_name = NULLIF(BTRIM(next_store_name), ''),
      seller_category = NULLIF(BTRIM(next_seller_category), '')
  WHERE id = target_user_id;

  UPDATE public.products
  SET hidden_by_admin = (next_role <> 'seller' OR next_status = 'blocked')
  WHERE seller_id = target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_user_controls(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
