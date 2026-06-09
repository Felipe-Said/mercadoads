ALTER TABLE public.products
  ALTER COLUMN delivery_type SET DEFAULT 'Entrega digital na plataforma';

UPDATE public.products
SET delivery_type = 'Entrega digital na plataforma'
WHERE delivery_type IS NULL
   OR delivery_type ILIKE '%autom%'
   OR delivery_type ILIKE '%frete%'
   OR delivery_type ILIKE '%envio%';
