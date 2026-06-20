const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)[1];
const supabaseKey = env.match(/VITE_SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1];
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, supabaseKey);

async function apply() {
  const query = `
  ALTER TABLE payment_gateway_settings ADD COLUMN IF NOT EXISTS bspay_active BOOLEAN DEFAULT false;
  ALTER TABLE payment_gateway_settings ADD COLUMN IF NOT EXISTS bspay_client_id TEXT;
  ALTER TABLE payment_gateway_settings ADD COLUMN IF NOT EXISTS bspay_client_secret TEXT;
  ALTER TABLE payment_gateway_settings ADD COLUMN IF NOT EXISTS bspay_webhook_secret TEXT;
  UPDATE payment_gateway_settings SET updated_at = NOW() WHERE id = 1;
  `;
  const { data, error } = await supabase.rpc('exec_sql', { sql: query });
  if (error) console.error('Error applying migration:', error);
  else console.log('Migration applied successfully');
}
apply();
