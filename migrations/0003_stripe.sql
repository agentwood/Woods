alter table jw_profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text;
