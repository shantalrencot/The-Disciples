-- ============================================================
-- Allow disciplers to create, update, and delete tracks & modules
-- Run this in Supabase SQL Editor after 002_rls_policies.sql
-- ============================================================

-- Tracks: disciplers can insert, update, delete
create policy "tracks_write_discipler"
  on public.tracks for all
  using (public.current_user_role() = 'discipler')
  with check (public.current_user_role() = 'discipler');

-- Modules: disciplers can insert, update, delete
create policy "modules_write_discipler"
  on public.modules for all
  using (public.current_user_role() = 'discipler')
  with check (public.current_user_role() = 'discipler');
