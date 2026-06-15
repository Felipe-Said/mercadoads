CREATE OR REPLACE FUNCTION public.create_notification(
  target_user_id UUID,
  notification_type TEXT,
  notification_title TEXT,
  notification_body TEXT DEFAULT NULL,
  notification_link TEXT DEFAULT NULL,
  notification_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF target_user_id IS NULL THEN
    RETURN;
  END IF;

  IF notification_type = 'affiliate_invite'
    AND COALESCE(notification_metadata, '{}'::jsonb) ? 'affiliate_id'
  THEN
    UPDATE public.notifications
    SET
      title = notification_title,
      body = notification_body,
      link_url = notification_link,
      metadata = COALESCE(notification_metadata, '{}'::jsonb),
      read_at = NULL,
      created_at = timezone('utc'::text, now())
    WHERE user_id = target_user_id
      AND type = notification_type
      AND metadata->>'affiliate_id' = notification_metadata->>'affiliate_id';

    IF FOUND THEN
      RETURN;
    END IF;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body, link_url, metadata)
  VALUES (
    target_user_id,
    notification_type,
    notification_title,
    notification_body,
    notification_link,
    COALESCE(notification_metadata, '{}'::jsonb)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_affiliate_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  seller_name TEXT;
  affiliate_name TEXT;
  product_title TEXT;
BEGIN
  SELECT COALESCE(store_name, full_name, 'Vendedor') INTO seller_name
  FROM public.profiles
  WHERE id = NEW.seller_id;

  SELECT COALESCE(full_name, email, 'Afiliado') INTO affiliate_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  SELECT title INTO product_title
  FROM public.products
  WHERE id = NEW.product_id;

  IF (
    TG_OP = 'INSERT'
    AND NEW.status = 'pending'
  ) OR (
    TG_OP = 'UPDATE'
    AND OLD.status IS DISTINCT FROM NEW.status
    AND NEW.status = 'pending'
  ) THEN
    PERFORM public.create_notification(
      NEW.user_id,
      'affiliate_invite',
      'Convite de afiliado',
      seller_name || ' convidou voce para ser afiliado.',
      '/painel/usuario/afiliacoes',
      jsonb_build_object('affiliate_id', NEW.id, 'seller_id', NEW.seller_id)
    );
  ELSIF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    PERFORM public.create_notification(
      NEW.seller_id,
      'affiliate_joined',
      'Novo afiliado',
      affiliate_name || ' se afiliou' || CASE WHEN product_title IS NOT NULL THEN ' ao produto ' || product_title ELSE ' a sua loja' END || '.',
      '/painel/vendedor/afiliados',
      jsonb_build_object('affiliate_id', NEW.id, 'user_id', NEW.user_id, 'product_id', NEW.product_id)
    );
    PERFORM public.notify_admins(
      'affiliate_joined',
      'Novo afiliado',
      affiliate_name || ' se afiliou' || CASE WHEN product_title IS NOT NULL THEN ' ao produto ' || product_title ELSE ' a uma loja' END || '.',
      '/painel/admin/afiliados',
      jsonb_build_object('affiliate_id', NEW.id, 'user_id', NEW.user_id, 'seller_id', NEW.seller_id, 'product_id', NEW.product_id)
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'active' THEN
    PERFORM public.create_notification(
      NEW.seller_id,
      'affiliate_invite_accepted',
      'Convite aceito',
      affiliate_name || ' aceitou seu convite de afiliado.',
      '/painel/vendedor/afiliados',
      jsonb_build_object('affiliate_id', NEW.id, 'user_id', NEW.user_id)
    );
    PERFORM public.notify_admins(
      'affiliate_invite_accepted',
      'Convite de afiliado aceito',
      affiliate_name || ' aceitou um convite de afiliado.',
      '/painel/admin/afiliados',
      jsonb_build_object('affiliate_id', NEW.id, 'user_id', NEW.user_id, 'seller_id', NEW.seller_id)
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_affiliate_change ON public.affiliates;
CREATE TRIGGER notify_affiliate_change
  AFTER INSERT OR UPDATE OF status
  ON public.affiliates
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_affiliate_change();
