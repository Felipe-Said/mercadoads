UPDATE public.virtual_number_settings
SET balance_path = '/api/v1/balance',
    services_path = '/api/v1/services',
    order_path = '/api/v1/activations',
    auth_mode = 'bearer',
    api_base_url = COALESCE(NULLIF(api_base_url, ''), 'https://app.numero-virtual.com'),
    updated_at = NOW()
WHERE id = 1
  AND (
    balance_path IN ('/api/balance', '')
    OR services_path IN ('/api/services', '')
    OR order_path IN ('/api/order', '')
    OR auth_mode IS DISTINCT FROM 'bearer'
  );
