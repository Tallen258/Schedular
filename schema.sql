
create table if not exists google_tokens (
  user_email text primary key,
  access_token text not null,
  refresh_token text not null,
  scope text not null,
  expiry_ms bigint not null,
  inserted_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists events (
  id serial primary key,
  user_email text not null,
  title text not null,
  description text,
  location text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  all_day boolean default false,
  google_event_id text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_events_user_email on events(user_email);
create index if not exists idx_events_start_time on events(start_time);
create index if not exists idx_events_google_event_id on events(google_event_id);


create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_google_tokens_updated_at on google_tokens;
create trigger update_google_tokens_updated_at before update on google_tokens
  for each row execute function update_updated_at_column();

drop trigger if exists update_events_updated_at on events;
create trigger update_events_updated_at before update on events
  for each row execute function update_updated_at_column();

-- for ai stuff
  create table if not exists conversation (
  id serial primary key,
  title text not null default 'New chat',
  user_email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists message (
  id bigserial primary key,
  conversation_id int not null references conversation(id) on delete cascade,
  role text not null,          
  content text not null,
  image_url text,
  created_at timestamptz not null default now()
);