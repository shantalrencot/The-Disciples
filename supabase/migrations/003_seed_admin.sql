-- ============================================================
-- Optional: Create first admin user
-- Run this AFTER creating your first account via the app
-- Replace 'your-email@example.com' with the email you signed up with
-- ============================================================

-- update public.profiles
-- set role = 'admin'
-- where email = 'your-email@example.com';

-- ============================================================
-- Optional: Seed sample data for testing
-- ============================================================

-- Insert a sample track (requires an admin user ID)
-- insert into public.tracks (name, description, duration_weeks, created_by)
-- select
--   'Foundations of Faith',
--   'A comprehensive 12-week track covering the core disciplines of Christian life.',
--   12,
--   id
-- from public.profiles
-- where role = 'admin'
-- limit 1;
