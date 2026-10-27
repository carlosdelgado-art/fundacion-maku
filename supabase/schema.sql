-- =============================================================================
-- Esquema de base de datos - Fundacion MAKU (donaciones + rifa de bingo)
-- =============================================================================
-- Como usar: entra a tu proyecto de Supabase -> SQL Editor -> New query
-- pega TODO este archivo y dale "Run". Es seguro volver a ejecutarlo si algo falla
-- a la mitad (usa "if not exists" / "on conflict" en la mayoria de los casos).
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. PROFILES: datos de cada usuario (admin o vendedor) ligados a auth.users
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  phone text,
  role text not null default 'vendedor' check (role in ('admin', 'vendedor')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Funcion auxiliar: ¿el usuario autenticado actual es admin?
-- security definer para evitar recursion infinita en las politicas RLS.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- 2. SETTINGS: configuracion editable desde el panel admin (clave/valor)
-- -----------------------------------------------------------------------------
create table if not exists public.settings (
  key text primary key,
  value text
);

alter table public.settings enable row level security;

drop policy if exists "settings_public_read" on public.settings;
create policy "settings_public_read"
  on public.settings for select
  using (true);

drop policy if exists "settings_admin_write" on public.settings;
create policy "settings_admin_write"
  on public.settings for insert
  with check (public.is_admin());

drop policy if exists "settings_admin_update" on public.settings;
create policy "settings_admin_update"
  on public.settings for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "settings_admin_delete" on public.settings;
create policy "settings_admin_delete"
  on public.settings for delete
  using (public.is_admin());

-- Valores iniciales (puedes cambiarlos luego desde el panel admin)
insert into public.settings (key, value) values
  ('foundation_name', 'Fundacion MAKU'),
  ('team_name', 'Equipo MAKU'),
  ('logo_url', ''),
  ('hero_title', 'Construyamos juntos un futuro mejor'),
  ('hero_subtitle', 'futuro mejor'),
  ('hero_description', 'Ayudanos a alcanzar nuestra meta para apoyar a quienes mas lo necesitan.'),
  ('video_url', ''),
  ('goal_amount', '12000000'),
  ('breb_key', ''),
  ('bank_info', ''),
  ('card_price', '30000')
on conflict (key) do nothing;

-- -----------------------------------------------------------------------------
-- 3. BINGO_CARDS: los cartones numerados (1 a 400)
-- -----------------------------------------------------------------------------
create table if not exists public.bingo_cards (
  number integer primary key check (number between 1 and 400),
  assigned_to uuid references public.profiles (id) on delete set null,
  status text not null default 'unassigned'
    check (status in ('unassigned', 'assigned', 'pending_sale', 'sold')),
  created_at timestamptz not null default now()
);

alter table public.bingo_cards enable row level security;

drop policy if exists "cards_admin_all" on public.bingo_cards;
create policy "cards_admin_all"
  on public.bingo_cards for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "cards_vendedor_select_own" on public.bingo_cards;
create policy "cards_vendedor_select_own"
  on public.bingo_cards for select
  using (assigned_to = auth.uid());

-- Ajusta el limite si la tabla ya existia con uno menor (ej. 300)
alter table public.bingo_cards drop constraint if exists bingo_cards_number_check;
alter table public.bingo_cards add constraint bingo_cards_number_check check (number between 1 and 400);

-- Genera los cartones que falten (tambien sirve para agregar mas cartones)
insert into public.bingo_cards (number)
select generate_series(1, 400)
on conflict (number) do nothing;

-- -----------------------------------------------------------------------------
-- 4. CARD_SALES: reportes de venta de cartones (pendientes de aprobacion)
-- -----------------------------------------------------------------------------
create table if not exists public.card_sales (
  id uuid primary key default gen_random_uuid(),
  card_number integer not null references public.bingo_cards (number),
  seller_id uuid not null references public.profiles (id),
  buyer_name text not null,
  buyer_phone text,
  evidence_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  reject_reason text
);

-- Cartones comprados en una misma compra (un pago) comparten group_id.
alter table public.card_sales add column if not exists group_id uuid;

-- Reservas: venta pendiente sin comprobante (evidence_url null). Para tablas ya creadas.
alter table public.card_sales alter column evidence_url drop not null;

alter table public.card_sales enable row level security;

drop policy if exists "sales_admin_all" on public.card_sales;
create policy "sales_admin_all"
  on public.card_sales for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "sales_seller_select_own" on public.card_sales;
create policy "sales_seller_select_own"
  on public.card_sales for select
  using (seller_id = auth.uid());

drop policy if exists "sales_seller_insert_own" on public.card_sales;
create policy "sales_seller_insert_own"
  on public.card_sales for insert
  with check (
    seller_id = auth.uid()
    and exists (
      select 1 from public.bingo_cards c
      where c.number = card_number
        and c.assigned_to = auth.uid()
        and c.status = 'assigned'
    )
  );

-- Cuando se reporta una venta, el cartón pasa a "pending_sale"
create or replace function public.handle_card_sale_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.bingo_cards set status = 'pending_sale' where number = new.card_number;
  return new;
end;
$$;

drop trigger if exists on_card_sale_insert on public.card_sales;
create trigger on_card_sale_insert
  after insert on public.card_sales
  for each row execute function public.handle_card_sale_insert();

-- Cuando el admin aprueba/rechaza, el cartón se actualiza automaticamente
create or replace function public.handle_card_sale_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then
    update public.bingo_cards set status = 'sold' where number = new.card_number;
  elsif new.status = 'rejected' and old.status is distinct from 'rejected' then
    update public.bingo_cards set status = 'assigned' where number = new.card_number;
  end if;
  return new;
end;
$$;

drop trigger if exists on_card_sale_update on public.card_sales;
create trigger on_card_sale_update
  after update on public.card_sales
  for each row execute function public.handle_card_sale_update();

-- -----------------------------------------------------------------------------
-- 4.1 Compra publica de cartones: el usuario final (sin iniciar sesion)
--     elige un numero disponible, paga y sube su comprobante. La venta queda
--     atribuida automaticamente al lider al que ese numero esta asignado
--     (segun los rangos repartidos en /admin/cartones), sin que el comprador
--     tenga que saber ni elegir quien es el vendedor.
-- -----------------------------------------------------------------------------

-- Numeros disponibles para compra publica: solo los que esten en el rango
-- asignado al "canal de venta web" (un integrante designado en
-- /admin/integrantes, guardado en settings.web_sales_vendor_id). Los rangos
-- de los demas lideres (venta presencial) nunca se exponen aqui.
create or replace function public.get_available_card_numbers()
returns int[]
language sql
security definer
set search_path = public
stable
as $$
  with cfg as (
    select nullif(value, '')::uuid as vendor_id
    from public.settings
    where key = 'web_sales_vendor_id'
  )
  select coalesce(array_agg(c.number order by c.number), '{}'::int[])
  from public.bingo_cards c, cfg
  where c.status = 'assigned' and c.assigned_to = cfg.vendor_id;
$$;

grant execute on function public.get_available_card_numbers() to anon, authenticated;

-- Compra de uno o varios cartones con un solo pago y un solo comprobante.
-- Cada cartón queda como una fila de card_sales con el mismo group_id.
-- Bloquea las filas de los cartones mientras valida, para evitar compras dobles.
drop function if exists public.request_card_purchase(int, text, text, text);

create or replace function public.request_card_purchase(
  p_card_numbers int[],
  p_buyer_name text,
  p_buyer_phone text,
  p_evidence_url text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_web_vendor uuid;
  v_found integer;
  v_requested integer;
  v_group_id uuid := gen_random_uuid();
begin
  if coalesce(cardinality(p_card_numbers), 0) = 0
    or coalesce(trim(p_buyer_name), '') = ''
    or coalesce(trim(p_buyer_phone), '') = ''
    or coalesce(trim(p_evidence_url), '') = '' then
    raise exception 'missing_fields';
  end if;

  select nullif(value, '')::uuid into v_web_vendor
  from public.settings
  where key = 'web_sales_vendor_id';

  select count(*) into v_found
  from (
    select number
    from public.bingo_cards
    where number = any(p_card_numbers)
      and status = 'assigned'
      and assigned_to = v_web_vendor
    order by number
    for update
  ) locked;

  select count(distinct n) into v_requested
  from unnest(p_card_numbers) as n;

  if v_found <> v_requested then
    raise exception 'card_not_available';
  end if;

  insert into public.card_sales (card_number, seller_id, buyer_name, buyer_phone, evidence_url, group_id)
  select c.number, c.assigned_to, trim(p_buyer_name), trim(p_buyer_phone), p_evidence_url, v_group_id
  from public.bingo_cards c
  where c.number = any(p_card_numbers)
    and c.assigned_to = v_web_vendor;

  return v_group_id;
end;
$$;

grant execute on function public.request_card_purchase(int[], text, text, text) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 5. DONATIONS: donaciones en dinero con comprobante (Bre-B)
-- -----------------------------------------------------------------------------
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_name text not null,
  donor_phone text,
  amount numeric not null check (amount > 0),
  evidence_url text not null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  reject_reason text
);

alter table public.donations enable row level security;

drop policy if exists "donations_public_insert" on public.donations;
create policy "donations_public_insert"
  on public.donations for insert
  with check (true);

drop policy if exists "donations_admin_all" on public.donations;
create policy "donations_admin_all"
  on public.donations for all
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- 6. Funcion publica de estadisticas (para la pagina principal, sin exponer
--    datos sensibles de donantes/compradores)
-- -----------------------------------------------------------------------------
create or replace function public.get_public_stats()
returns table (
  total_raised numeric,
  goal_amount numeric,
  cards_sold integer,
  cards_total integer,
  donations_count integer
)
language sql
security definer
set search_path = public
stable
as $$
  select
    coalesce((select sum(amount) from public.donations where status = 'approved'), 0)
      + coalesce((select count(*) from public.card_sales where status = 'approved'), 0)
        * coalesce((select value::numeric from public.settings where key = 'card_price'), 30000)
      as total_raised,
    coalesce((select value::numeric from public.settings where key = 'goal_amount'), 12000000) as goal_amount,
    coalesce((select count(*) from public.bingo_cards where status = 'sold'), 0)::int as cards_sold,
    (select count(*) from public.bingo_cards)::int as cards_total,
    coalesce((select count(*) from public.donations where status = 'approved'), 0)::int as donations_count;
$$;

grant execute on function public.get_public_stats() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 6.1 Funcion publica de donaciones con mensaje (para el carrusel de donantes
--     en la pagina principal), sin exponer telefono ni comprobante.
-- -----------------------------------------------------------------------------
create or replace function public.get_public_donations(donations_limit int default 20)
returns table (
  id uuid,
  donor_name text,
  amount numeric,
  message text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select d.id, d.donor_name, d.amount, d.message, d.created_at
  from public.donations d
  where d.status = 'approved' and d.message is not null and d.message <> ''
  order by d.created_at desc
  limit donations_limit;
$$;

grant execute on function public.get_public_donations(int) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 7. STORAGE: buckets para comprobantes (privado) y logo (publico)
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('evidence', 'evidence', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

drop policy if exists "evidence_insert_anyone" on storage.objects;
create policy "evidence_insert_anyone"
  on storage.objects for insert
  with check (bucket_id = 'evidence');

drop policy if exists "evidence_select_owner_or_admin" on storage.objects;
create policy "evidence_select_owner_or_admin"
  on storage.objects for select
  using (bucket_id = 'evidence' and (owner = auth.uid() or public.is_admin()));

drop policy if exists "logos_public_read" on storage.objects;
create policy "logos_public_read"
  on storage.objects for select
  using (bucket_id = 'logos');

drop policy if exists "logos_admin_write" on storage.objects;
create policy "logos_admin_write"
  on storage.objects for insert
  with check (bucket_id = 'logos' and public.is_admin());

drop policy if exists "logos_admin_update" on storage.objects;
create policy "logos_admin_update"
  on storage.objects for update
  using (bucket_id = 'logos' and public.is_admin());

-- =============================================================================
-- Fin del esquema. Siguiente paso: crea tu primer usuario administrador
-- (ver instrucciones en README.md, seccion "Crear el primer administrador").
-- =============================================================================
