-- AgencyOS V1.0: executar no SQL Editor do Supabase como proprietário do projeto
create extension if not exists pgcrypto;
create table if not exists public.organizations (id uuid primary key default gen_random_uuid(),name text not null default 'Minha Agência',settings jsonb not null default '{}'::jsonb,created_at timestamptz not null default now());
create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade,username text not null unique check (username ~ '^[a-z0-9._-]{3,32}$'),display_name text not null,created_at timestamptz not null default now());
create table if not exists public.memberships (id uuid primary key default gen_random_uuid(),org_id uuid not null references public.organizations(id) on delete cascade,user_id uuid not null references public.profiles(id) on delete cascade,role text not null check(role in ('partner','manager','developer','designer','sales','finance','staff')),permissions text[] not null default '{}',active boolean not null default true,unique(org_id,user_id));
create table if not exists public.records (id uuid primary key default gen_random_uuid(),org_id uuid not null references public.organizations(id) on delete cascade,module text not null check(module in ('clients','leads','proposals','projects','ideas','notes','prompts','tasks','events','services','contracts','maintenance','knowledge','goals','time_entries')),title text not null,description text not null default '',status text not null default 'Novo',amount_cents bigint not null default 0,client_id uuid references public.records(id) on delete set null,project_id uuid references public.records(id) on delete set null,assignee_id uuid references public.profiles(id) on delete set null,due_date date,metadata jsonb not null default '{}'::jsonb,created_by uuid references public.profiles(id) on delete set null,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create index if not exists records_org_module_idx on public.records(org_id,module,created_at desc);
create index if not exists records_client_idx on public.records(client_id);
create index if not exists records_project_idx on public.records(project_id);
create table if not exists public.transactions (id uuid primary key default gen_random_uuid(),org_id uuid not null references public.organizations(id) on delete cascade,kind text not null check(kind in ('income','expense')),title text not null,amount_cents bigint not null check(amount_cents >= 0),paid_cents bigint not null default 0 check(paid_cents >= 0),status text not null default 'pending' check(status in ('pending','partial','paid','cancelled')),category text not null default 'Geral',due_date date,paid_date date,project_id uuid references public.records(id) on delete set null,client_id uuid references public.records(id) on delete set null,created_by uuid references public.profiles(id) on delete set null,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),constraint payment_limit check(paid_cents <= amount_cents));
create index if not exists transactions_org_idx on public.transactions(org_id,created_at desc);
create table if not exists public.project_shares (project_id uuid primary key references public.records(id) on delete cascade,org_id uuid not null references public.organizations(id) on delete cascade,partner_one uuid not null references public.profiles(id),partner_two uuid not null references public.profiles(id),partner_one_percent numeric(5,2) not null default 50 check(partner_one_percent between 0 and 100),reserve_cents bigint not null default 0 check(reserve_cents >= 0),check(partner_one <> partner_two));
create table if not exists public.distributions (id uuid primary key default gen_random_uuid(),org_id uuid not null references public.organizations(id) on delete cascade,project_id uuid references public.records(id),partner_id uuid not null references public.profiles(id),amount_cents bigint not null check(amount_cents>0),note text default '',created_by uuid references public.profiles(id),created_at timestamptz not null default now());
create table if not exists public.audit_log (id bigint generated always as identity primary key,org_id uuid not null,actor_id uuid,action text not null,entity text not null,entity_id uuid,details jsonb not null default '{}'::jsonb,created_at timestamptz not null default now());
create index if not exists audit_org_idx on public.audit_log(org_id,created_at desc);
create table if not exists public.login_attempts (fingerprint text primary key,failed_count integer not null default 0,blocked_until timestamptz,updated_at timestamptz not null default now());
-- Helpers: SECURITY DEFINER restrito, sem dados passados pelo cliente como identidade
create or replace function public.member_of(org uuid) returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.memberships m where m.org_id=org and m.user_id=(select auth.uid()) and m.active) $$;
create or replace function public.can_manage(org uuid) returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.memberships m where m.org_id=org and m.user_id=(select auth.uid()) and m.active and m.role in ('partner','manager')) $$;
create or replace function public.can_finance(org uuid) returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.memberships m where m.org_id=org and m.user_id=(select auth.uid()) and m.active and (m.role in ('partner','manager','finance') or 'finance' = any(m.permissions))) $$;
revoke all on function public.member_of(uuid),public.can_manage(uuid),public.can_finance(uuid) from public;
grant execute on function public.member_of(uuid),public.can_manage(uuid),public.can_finance(uuid) to authenticated;
create or replace function public.touch_record() returns trigger language plpgsql as $$begin new.updated_at=now();return new;end$$;
create trigger trg_record_touch before update on public.records for each row execute function public.touch_record();
create trigger trg_transaction_touch before update on public.transactions for each row execute function public.touch_record();
-- As transferências/distribuições e alterações financeiras sensíveis usam permissões no banco
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.records enable row level security;
alter table public.transactions enable row level security;
alter table public.project_shares enable row level security;
alter table public.distributions enable row level security;
alter table public.audit_log enable row level security;
alter table public.login_attempts enable row level security;
create policy org_read on public.organizations for select to authenticated using (public.member_of(id));
create policy org_update on public.organizations for update to authenticated using (public.can_manage(id)) with check (public.can_manage(id));
create policy profile_read on public.profiles for select to authenticated using (id=(select auth.uid()) or exists (select 1 from public.memberships m where m.user_id=profiles.id and public.member_of(m.org_id)));
create policy profile_update on public.profiles for update to authenticated using (id=(select auth.uid())) with check (id=(select auth.uid()));
create policy membership_read on public.memberships for select to authenticated using (public.member_of(org_id));
-- Alterar permissões é operação administrativa via service role; não permitir update direto
create policy records_read on public.records for select to authenticated using (public.member_of(org_id));
create policy records_insert on public.records for insert to authenticated with check (public.member_of(org_id) and created_by=(select auth.uid()) and (module not in ('contracts') or public.can_manage(org_id)));
create policy records_update on public.records for update to authenticated using (public.member_of(org_id)) with check (public.member_of(org_id));
create policy records_delete on public.records for delete to authenticated using (public.can_manage(org_id));
create policy transactions_read on public.transactions for select to authenticated using (public.can_finance(org_id));
create policy transactions_insert on public.transactions for insert to authenticated with check (public.can_finance(org_id) and created_by=(select auth.uid()));
create policy transactions_update on public.transactions for update to authenticated using (public.can_finance(org_id)) with check (public.can_finance(org_id));
-- Nunca excluir lançamentos via cliente. Cancelar em vez de remover.
create policy shares_read on public.project_shares for select to authenticated using (public.can_finance(org_id));
create policy shares_insert on public.project_shares for insert to authenticated with check (public.can_manage(org_id));
create policy shares_update on public.project_shares for update to authenticated using (public.can_manage(org_id)) with check (public.can_manage(org_id));
create policy distributions_read on public.distributions for select to authenticated using (public.can_finance(org_id));
create policy audit_read on public.audit_log for select to authenticated using (public.can_manage(org_id));
-- Proteções adicionais de campos imutáveis / prevenção de troca de organização e tipologia
create or replace function public.guard_record_update() returns trigger language plpgsql as $$begin if new.org_id<>old.org_id or new.module<>old.module or new.created_by is distinct from old.created_by then raise exception 'Campos protegidos';end if;return new;end$$;
create trigger trg_guard_record before update on public.records for each row execute function public.guard_record_update();
create or replace function public.guard_tx_update() returns trigger language plpgsql as $$begin if new.org_id<>old.org_id or new.kind<>old.kind or new.created_by is distinct from old.created_by then raise exception 'Campos protegidos';end if;return new;end$$;
create trigger trg_guard_tx before update on public.transactions for each row execute function public.guard_tx_update();
-- Auditoria ao nível do banco, mesmo em alterações feitas via SDK
create or replace function public.log_change() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 insert into public.audit_log(org_id,actor_id,action,entity,entity_id,details) values(coalesce(new.org_id,old.org_id),auth.uid(),TG_OP,TG_TABLE_NAME,coalesce(new.id,old.id),jsonb_build_object('title',coalesce(new.title,old.title)));
 return coalesce(new,old);
end$$;
create trigger audit_records after insert or update or delete on public.records for each row execute function public.log_change();
create trigger audit_transactions after insert or update on public.transactions for each row execute function public.log_change();
-- Bucket privado e regras de acesso por pasta org_id/arquivo
insert into storage.buckets(id,name,public,file_size_limit) values('agency-files','agency-files',false,10485760) on conflict(id) do nothing;
create policy agency_storage_read on storage.objects for select to authenticated using(bucket_id='agency-files' and public.member_of((split_part(name,'/',1))::uuid));
create policy agency_storage_insert on storage.objects for insert to authenticated with check(bucket_id='agency-files' and public.member_of((split_part(name,'/',1))::uuid));
create policy agency_storage_delete on storage.objects for delete to authenticated using(bucket_id='agency-files' and public.can_manage((split_part(name,'/',1))::uuid));
-- Nunca conceder acesso direto ao controle de tentativas / audit_log / distribuições
