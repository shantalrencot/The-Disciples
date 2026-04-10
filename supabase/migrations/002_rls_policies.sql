-- ============================================================
-- DiscipleTrack Row-Level Security Policies
-- Run this AFTER 001_initial_schema.sql
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.tracks enable row level security;
alter table public.modules enable row level security;
alter table public.cohorts enable row level security;
alter table public.groups enable row level security;
alter table public.enrollments enable row level security;
alter table public.sessions enable row level security;
alter table public.attendance enable row level security;

-- Helper function: get current user's role
create or replace function public.current_user_role()
returns user_role language sql security definer as $$
  select role from public.profiles where id = auth.uid()
$$;

-- Helper function: check if user is admin
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$;

-- ============================================================
-- PROFILES policies
-- ============================================================
-- Everyone can read all profiles (for name display)
create policy "profiles_select_all"
  on public.profiles for select
  using (auth.uid() is not null);

-- Users can update their own profile
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Admins can update any profile
create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin());

-- Allow profile creation (handled by trigger, but also allow manual)
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ============================================================
-- TRACKS policies
-- ============================================================
-- Everyone authenticated can read tracks
create policy "tracks_select_authenticated"
  on public.tracks for select
  using (auth.uid() is not null);

-- Only admins can create/update/delete tracks
create policy "tracks_all_admin"
  on public.tracks for all
  using (public.is_admin());

-- ============================================================
-- MODULES policies
-- ============================================================
create policy "modules_select_authenticated"
  on public.modules for select
  using (auth.uid() is not null);

create policy "modules_all_admin"
  on public.modules for all
  using (public.is_admin());

-- ============================================================
-- COHORTS policies
-- ============================================================
create policy "cohorts_select_authenticated"
  on public.cohorts for select
  using (auth.uid() is not null);

create policy "cohorts_all_admin"
  on public.cohorts for all
  using (public.is_admin());

-- ============================================================
-- GROUPS policies
-- ============================================================
create policy "groups_select_authenticated"
  on public.groups for select
  using (auth.uid() is not null);

create policy "groups_all_admin"
  on public.groups for all
  using (public.is_admin());

-- Disciplers can see their own groups (already covered by authenticated select)
-- Disciplers can update their groups (notes, etc.)
create policy "groups_update_discipler"
  on public.groups for update
  using (discipler_id = auth.uid());

-- ============================================================
-- ENROLLMENTS policies
-- ============================================================
create policy "enrollments_select_authenticated"
  on public.enrollments for select
  using (auth.uid() is not null);

create policy "enrollments_all_admin"
  on public.enrollments for all
  using (public.is_admin());

-- ============================================================
-- SESSIONS policies
-- ============================================================
create policy "sessions_select_authenticated"
  on public.sessions for select
  using (auth.uid() is not null);

create policy "sessions_all_admin"
  on public.sessions for all
  using (public.is_admin());

-- Disciplers can create/update sessions for their groups
create policy "sessions_insert_discipler"
  on public.sessions for insert
  with check (
    exists(
      select 1 from public.groups g
      where g.id = group_id and g.discipler_id = auth.uid()
    )
  );

create policy "sessions_update_discipler"
  on public.sessions for update
  using (
    exists(
      select 1 from public.groups g
      where g.id = group_id and g.discipler_id = auth.uid()
    )
  );

-- ============================================================
-- ATTENDANCE policies
-- ============================================================
create policy "attendance_select_authenticated"
  on public.attendance for select
  using (auth.uid() is not null);

create policy "attendance_all_admin"
  on public.attendance for all
  using (public.is_admin());

-- Disciplers can insert/update attendance for their sessions
create policy "attendance_write_discipler"
  on public.attendance for insert
  with check (
    exists(
      select 1 from public.sessions s
      join public.groups g on g.id = s.group_id
      where s.id = session_id and g.discipler_id = auth.uid()
    )
  );

create policy "attendance_update_discipler"
  on public.attendance for update
  using (marked_by = auth.uid());

create policy "attendance_delete_discipler"
  on public.attendance for delete
  using (
    exists(
      select 1 from public.sessions s
      join public.groups g on g.id = s.group_id
      where s.id = session_id and g.discipler_id = auth.uid()
    )
  );
