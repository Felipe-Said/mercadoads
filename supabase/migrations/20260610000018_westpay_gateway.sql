CREATE TABLE IF NOT EXISTS public.payment_gateway_settings (
  id BIGINT PRIMARY KEY DEFAULT 1,
  provider TEXT NOT NULL DEFAULT 'westpay' CHECK (provider IN ('westpay')),
  active BOOLEAN NOT NULL DEFAULT true,
  westpay_api_key TEXT,
  westpay_public_key TEXT,
  westpay_user_agent TEXT,
  westpay_webhook_secret TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS payment_gateway TEXT,
  ADD COLUMN IF NOT EXISTS payment_external_ref TEXT,
  ADD COLUMN IF NOT EXISTS payment_transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_qrcode TEXT,
  ADD COLUMN IF NOT EXISTS payment_qrcode_text TEXT,
  ADD COLUMN IF NOT EXISTS payment_qrcode_expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS gateway_payload JSONB;

ALTER TABLE public.withdrawals
  ADD COLUMN IF NOT EXISTS gateway_provider TEXT,
  ADD COLUMN IF NOT EXISTS gateway_external_ref TEXT,
  ADD COLUMN IF NOT EXISTS gateway_transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS gateway_secure_id TEXT,
  ADD COLUMN IF NOT EXISTS gateway_status TEXT,
  ADD COLUMN IF NOT EXISTS gateway_payload JSONB,
  ADD COLUMN IF NOT EXISTS destination_name TEXT,
  ADD COLUMN IF NOT EXISTS destination_document TEXT;

ALTER TABLE public.payment_gateway_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'payment_gateway_settings'
      AND policyname = 'Admins manage payment gateway settings.'
  ) THEN
    CREATE POLICY "Admins manage payment gateway settings." ON public.payment_gateway_settings
      FOR ALL USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE ON public.payment_gateway_settings TO authenticated;

INSERT INTO public.payment_gateway_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;
