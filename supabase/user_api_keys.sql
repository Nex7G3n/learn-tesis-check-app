create table if not exists public.user_api_keys (
  user_id uuid primary key references auth.users(id) on delete cascade,
  api_key_encrypted text not null,
  api_key_masked text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_api_keys enable row level security;

create policy "users_can_select_own_api_key"
on public.user_api_keys
for select
to authenticated
using (auth.uid() = user_id);

create policy "users_can_insert_own_api_key"
on public.user_api_keys
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users_can_update_own_api_key"
on public.user_api_keys
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.touch_user_api_keys_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_user_api_keys_updated_at on public.user_api_keys;
create trigger trg_touch_user_api_keys_updated_at
before update on public.user_api_keys
for each row
execute function public.touch_user_api_keys_updated_at();
