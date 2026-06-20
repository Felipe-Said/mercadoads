ALTER TABLE public.products ADD COLUMN IF NOT EXISTS credentials_data JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seller_note TEXT;
