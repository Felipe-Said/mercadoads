ALTER TABLE public.platform_settings
  ADD COLUMN IF NOT EXISTS official_product_commission_percent NUMERIC(5,2) DEFAULT 5,
  ADD COLUMN IF NOT EXISTS tool_commissions_json JSONB DEFAULT '{
    "proxy": { "seller": 5, "affiliate": 5 },
    "smm": { "seller": 5, "affiliate": 5 },
    "numeroVirtual": { "seller": 5, "affiliate": 5 },
    "emailTemporario": { "seller": 5, "affiliate": 5 }
  }'::jsonb;

UPDATE public.platform_settings
SET
  official_product_commission_percent = COALESCE(official_product_commission_percent, affiliate_fee_percent, 5),
  tool_commissions_json = COALESCE(tool_commissions_json, '{
    "proxy": { "seller": 5, "affiliate": 5 },
    "smm": { "seller": 5, "affiliate": 5 },
    "numeroVirtual": { "seller": 5, "affiliate": 5 },
    "emailTemporario": { "seller": 5, "affiliate": 5 }
  }'::jsonb)
WHERE id = 1;
