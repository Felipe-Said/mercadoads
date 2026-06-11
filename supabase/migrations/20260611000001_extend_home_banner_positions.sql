DO $$
DECLARE
  constraint_record record;
BEGIN
  FOR constraint_record IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'marketing_banners'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) ILIKE '%position%'
  LOOP
    EXECUTE format('ALTER TABLE public.marketing_banners DROP CONSTRAINT %I', constraint_record.conname);
  END LOOP;

  ALTER TABLE public.marketing_banners
    ADD CONSTRAINT marketing_banners_position_check
    CHECK (position IN (
      'home_hero',
      'left_flyer',
      'right_flyer',
      'home_side_top',
      'home_side_bottom',
      'home_middle',
      'home_bottom',
      'home_deals_top',
      'home_deals_bottom',
      'home_grid_1',
      'home_grid_2',
      'home_grid_3',
      'home_grid_4'
    ));
END $$;
