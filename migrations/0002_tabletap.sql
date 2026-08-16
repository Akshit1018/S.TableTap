-- TableTap restaurants, queues, bookings, wait-rewards, gifts
create table if not exists profiles (
  user_id text primary key,
  display_name text not null default '',
  phone text,
  role_pref text not null default 'guest',
  created_at timestamptz not null default now()
);

create table if not exists restaurants (
  id text primary key,
  owner_user_id text not null,
  name text not null,
  cuisine text not null,
  neighborhood text not null,
  address text not null,
  cover_image text not null,
  wait_mins integer not null default 20,
  party_max integer not null default 8,
  rating numeric not null default 4.6,
  price_level integer not null default 2,
  description text not null default '',
  hours text not null default '12:00 – 23:00',
  tags text not null default ''
);

create table if not exists wait_rewards (
  id text primary key,
  restaurant_id text not null references restaurants(id) on delete cascade,
  min_wait_mins integer not null,
  kind text not null,
  value integer not null default 0,
  title text not null,
  description text not null default ''
);

create table if not exists deposit_tiers (
  id text primary key,
  restaurant_id text not null references restaurants(id) on delete cascade,
  name text not null,
  amount integer not null,
  discount_pct integer not null default 0,
  perk text not null default '',
  sort_order integer not null default 0
);

create table if not exists queue_entries (
  id text primary key,
  restaurant_id text not null references restaurants(id) on delete cascade,
  user_id text not null,
  guest_name text not null,
  party_size integer not null,
  status text not null default 'waiting',
  joined_at timestamptz not null default now(),
  quoted_wait integer not null,
  notes text
);

create table if not exists bookings (
  id text primary key,
  restaurant_id text not null references restaurants(id) on delete cascade,
  user_id text not null,
  guest_name text not null,
  party_size integer not null,
  slot_at timestamptz not null,
  deposit_tier_id text not null,
  deposit_amount integer not null,
  discount_pct integer not null,
  perk text not null default '',
  status text not null default 'confirmed',
  created_at timestamptz not null default now()
);

create table if not exists gifts (
  id text primary key,
  restaurant_id text not null references restaurants(id) on delete cascade,
  user_id text not null,
  title text not null,
  description text not null default '',
  kind text not null,
  value integer not null default 0,
  source text not null,
  claimed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id text primary key,
  user_id text not null,
  title text not null,
  body text not null,
  kind text not null default 'info',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists queue_rest_status_idx on queue_entries (restaurant_id, status);
create index if not exists queue_user_idx on queue_entries (user_id);
create index if not exists bookings_user_idx on bookings (user_id);
create index if not exists bookings_rest_idx on bookings (restaurant_id);
create index if not exists gifts_user_idx on gifts (user_id);
create index if not exists notif_user_idx on notifications (user_id);
create index if not exists wait_rewards_rest_idx on wait_rewards (restaurant_id);
create index if not exists deposit_tiers_rest_idx on deposit_tiers (restaurant_id);
