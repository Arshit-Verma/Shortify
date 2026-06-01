-- Shortify Database Schema Migration
-- Run this SQL in your Supabase project SQL editor

-- Enable pgcrypto extension for UUID generation
create extension if not exists pgcrypto;

-- Create links table
create table if not exists links (
  id uuid primary key default gen_random_uuid(),
  short_code varchar(12) not null unique,
  target_url text not null,
  owner_token varchar(64),
  click_count bigint not null default 0,
  created_at timestamptz not null default now(),
  last_click_at timestamptz
);

-- Create indexes on links table
create index if not exists idx_links_short_code on links(short_code);
create index if not exists idx_links_owner_token on links(owner_token);

-- Create clicks table for detailed analytics
create table if not exists clicks (
  id bigserial primary key,
  link_id uuid references links(id) on delete cascade not null,
  occurred_at timestamptz not null default now(),
  ip_hash varchar(128),
  user_agent text,
  referrer text
);

-- Create indexes on clicks table
create index if not exists idx_clicks_link_id on clicks(link_id);
create index if not exists idx_clicks_occurred_at on clicks(occurred_at);

-- Enable Row Level Security (optional, if using with auth)
-- alter table links enable row level security;
-- alter table clicks enable row level security;

-- Create a function to increment click count (optional, for use with database triggers)
create or replace function increment_click_count(link_id uuid)
returns bigint as $$
  declare
    new_count bigint;
  begin
    update links
    set click_count = click_count + 1,
        last_click_at = now()
    where id = link_id
    returning click_count into new_count;
    return new_count;
  end;
$$ language plpgsql;

-- Grant execute permissions on the function (optional for auth)
-- grant execute on function increment_click_count(uuid) to authenticated;
