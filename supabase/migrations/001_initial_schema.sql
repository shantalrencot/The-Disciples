-- ============================================================
-- DiscipleTrack Initial Schema
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create type user_role as enum ('admin', 'discipler', 'student');

create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text not null,
  full_name   text not null,
  role        user_role not null default 'student',
  phone       text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'student')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- TRACKS
-- ============================================================
create table if not exists public.tracks (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  description     text,
  duration_weeks  integer not null default 8,
  created_by      uuid references public.profiles(id) not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- MODULES (belong to tracks)
-- ============================================================
create table if not exists public.modules (
  id          uuid primary key default uuid_generate_v4(),
  track_id    uuid references public.tracks(id) on delete cascade not null,
  title       text not null,
  description text,
  order_index integer not null default 0,
  content_url text,
  video_url   text,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- COHORTS (instances of a track)
-- ============================================================
create table if not exists public.cohorts (
  id          uuid primary key default uuid_generate_v4(),
  track_id    uuid references public.tracks(id) not null,
  name        text not null,
  start_date  date not null,
  end_date    date,
  created_by  uuid references public.profiles(id) not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- GROUPS (small groups within a cohort, max 8 students)
-- ============================================================
create table if not exists public.groups (
  id           uuid primary key default uuid_generate_v4(),
  cohort_id    uuid references public.cohorts(id) on delete cascade not null,
  name         text not null,
  discipler_id uuid references public.profiles(id),
  max_students integer not null default 8,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- ENROLLMENTS (students enrolled in groups)
-- ============================================================
create type enrollment_status as enum ('active', 'completed', 'dropped');

create table if not exists public.enrollments (
  id          uuid primary key default uuid_generate_v4(),
  group_id    uuid references public.groups(id) on delete cascade not null,
  student_id  uuid references public.profiles(id) not null,
  enrolled_at timestamptz not null default now(),
  status      enrollment_status not null default 'active',
  unique(group_id, student_id)
);

-- Enforce max students per group
create or replace function public.check_group_capacity()
returns trigger language plpgsql as $$
declare
  current_count integer;
  max_count integer;
begin
  select count(*) into current_count
  from public.enrollments
  where group_id = new.group_id and status = 'active';

  select max_students into max_count
  from public.groups
  where id = new.group_id;

  if current_count >= max_count then
    raise exception 'Group has reached maximum capacity of % students', max_count;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_group_capacity on public.enrollments;
create trigger enforce_group_capacity
  before insert on public.enrollments
  for each row execute procedure public.check_group_capacity();

-- ============================================================
-- SESSIONS (weekly meetings)
-- ============================================================
create type session_status as enum ('scheduled', 'completed', 'cancelled');

create table if not exists public.sessions (
  id             uuid primary key default uuid_generate_v4(),
  group_id       uuid references public.groups(id) on delete cascade not null,
  module_id      uuid references public.modules(id),
  title          text not null,
  scheduled_date date not null,
  status         session_status not null default 'scheduled',
  notes          text,
  created_at     timestamptz not null default now()
);

-- ============================================================
-- ATTENDANCE
-- ============================================================
create type attendance_status as enum ('present', 'absent', 'excused');

create table if not exists public.attendance (
  id          uuid primary key default uuid_generate_v4(),
  session_id  uuid references public.sessions(id) on delete cascade not null,
  student_id  uuid references public.profiles(id) not null,
  status      attendance_status not null,
  notes       text,
  marked_by   uuid references public.profiles(id) not null,
  marked_at   timestamptz not null default now(),
  unique(session_id, student_id)
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
create index if not exists idx_modules_track_id on public.modules(track_id);
create index if not exists idx_modules_order on public.modules(track_id, order_index);
create index if not exists idx_groups_cohort_id on public.groups(cohort_id);
create index if not exists idx_groups_discipler_id on public.groups(discipler_id);
create index if not exists idx_enrollments_group_id on public.enrollments(group_id);
create index if not exists idx_enrollments_student_id on public.enrollments(student_id);
create index if not exists idx_sessions_group_id on public.sessions(group_id);
create index if not exists idx_sessions_date on public.sessions(scheduled_date);
create index if not exists idx_attendance_session_id on public.attendance(session_id);
create index if not exists idx_attendance_student_id on public.attendance(student_id);

-- ============================================================
-- Updated_at triggers
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger set_tracks_updated_at before update on public.tracks
  for each row execute procedure public.set_updated_at();
create trigger set_cohorts_updated_at before update on public.cohorts
  for each row execute procedure public.set_updated_at();
