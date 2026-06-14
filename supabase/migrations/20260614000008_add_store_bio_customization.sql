ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS store_bio TEXT,
  ADD COLUMN IF NOT EXISTS store_bio_background_color TEXT DEFAULT '#f7f1ed',
  ADD COLUMN IF NOT EXISTS store_bio_button_color TEXT DEFAULT '#3b1f18',
  ADD COLUMN IF NOT EXISTS store_bio_button_text_color TEXT DEFAULT '#ffffff';
