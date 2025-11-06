-- Google Calendar tokens storage
-- Run once to create the table
create table if not exists google_tokens (
  user_email text primary key,
  access_token text not null,
  refresh_token text not null,
  scope text not null,
  expiry_ms bigint not null,
  inserted_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);