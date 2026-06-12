ALTER TABLE public.smm_settings
  ALTER COLUMN api_base_url SET DEFAULT 'https://mitikboost.com/api/v2';

UPDATE public.smm_settings
SET api_base_url = 'https://mitikboost.com/api/v2',
    updated_at = NOW()
WHERE id = 1
  AND (
    api_base_url IS NULL
    OR api_base_url = ''
    OR api_base_url ILIKE '%baratosociais%'
  );
