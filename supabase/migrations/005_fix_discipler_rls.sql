-- ============================================================
-- Fix conflicting RLS policies for disciplers on tracks/modules
-- The FOR ALL policies in 004 overlap with the admin FOR ALL policies
-- in 002, causing ambiguity. Replace with scoped operations only.
-- ============================================================

-- Drop the broad FOR ALL policies added in 004
drop policy if exists "tracks_write_discipler" on public.tracks;
drop policy if exists "modules_write_discipler" on public.modules;

-- Re-create as scoped INSERT / UPDATE / DELETE only
-- (SELECT is already covered by tracks_select_authenticated)

create policy "tracks_insert_discipler"
  on public.tracks for insert
  with check (public.current_user_role() = 'discipler');

create policy "tracks_update_discipler"
  on public.tracks for update
  using (public.current_user_role() = 'discipler');

create policy "tracks_delete_discipler"
  on public.tracks for delete
  using (public.current_user_role() = 'discipler');

create policy "modules_insert_discipler"
  on public.modules for insert
  with check (public.current_user_role() = 'discipler');

create policy "modules_update_discipler"
  on public.modules for update
  using (public.current_user_role() = 'discipler');

create policy "modules_delete_discipler"
  on public.modules for delete
  using (public.current_user_role() = 'discipler');
