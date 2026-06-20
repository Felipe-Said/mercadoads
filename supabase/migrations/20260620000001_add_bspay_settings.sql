ALTER TABLE payment_gateway_settings ADD COLUMN IF NOT EXISTS bspay_active BOOLEAN DEFAULT false;
ALTER TABLE payment_gateway_settings ADD COLUMN IF NOT EXISTS bspay_client_id TEXT;
ALTER TABLE payment_gateway_settings ADD COLUMN IF NOT EXISTS bspay_client_secret TEXT;
ALTER TABLE payment_gateway_settings ADD COLUMN IF NOT EXISTS bspay_webhook_secret TEXT;

-- Trigger update for frontend to pull new columns without cache issues
UPDATE payment_gateway_settings SET updated_at = NOW() WHERE id = 1;
