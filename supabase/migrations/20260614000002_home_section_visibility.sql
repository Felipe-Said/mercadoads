ALTER TABLE public.platform_settings
  ADD COLUMN IF NOT EXISTS home_sections_json JSONB DEFAULT '{
    "homeDealsTop": false,
    "homeDealsBottom": false,
    "homeGrid1": false,
    "homeGrid2": false,
    "homeGrid3": false,
    "homeGrid4": false,
    "homePopularCategories": false,
    "homeMiddle": false,
    "homeBottom": false
  }'::jsonb;

UPDATE public.platform_settings
SET home_sections_json = '{
  "homeDealsTop": false,
  "homeDealsBottom": false,
  "homeGrid1": false,
  "homeGrid2": false,
  "homeGrid3": false,
  "homeGrid4": false,
  "homePopularCategories": false,
  "homeMiddle": false,
  "homeBottom": false
}'::jsonb
WHERE id = 1
  AND home_sections_json IS NULL;
