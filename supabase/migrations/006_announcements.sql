-- ============================================================
-- Cohort Announcements
-- Visible to all authenticated users; managed by admins
-- ============================================================

create table if not exists public.announcements (
  id         uuid primary key default uuid_generate_v4(),
  title      text not null,
  content    text not null,
  cohort_id  uuid references public.cohorts(id) on delete cascade,
  created_by uuid references public.profiles(id) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

create policy "announcements_select_all"
  on public.announcements for select
  using (auth.uid() is not null);

create policy "announcements_all_admin"
  on public.announcements for all
  using (public.is_admin());

create index if not exists idx_announcements_cohort_id on public.announcements(cohort_id);
create index if not exists idx_announcements_created_at on public.announcements(created_at desc);

create trigger set_announcements_updated_at before update on public.announcements
  for each row execute procedure public.set_updated_at();
