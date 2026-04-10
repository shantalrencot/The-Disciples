# DiscipleTrack

A Progressive Web App for church discipleship management.

## Stack
- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL)
- **Build:** Vite

## Features
- Role-based access: Admin, Discipler, Student
- Track & Module management
- Cohort & Group enrollment (max 8 per group)
- Mobile-first attendance marking
- Analytics & CSV export
- Calendar view
- PWA (installable, offline support)

## Setup

### 1. Clone & install
```bash
git clone https://github.com/shantalrencot/The-Disciples
cd The-Disciples
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 3. Database setup
Run the SQL files in order in your Supabase SQL Editor:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. (Optional) `supabase/migrations/003_seed_admin.sql` — update your email first

### 4. Run locally
```bash
npm run dev
```

### 5. Make yourself an admin
After creating your account in the app, run in Supabase SQL Editor:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

## Deploy to Vercel
1. Push this repo to GitHub
2. Import in Vercel
3. Set environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. Deploy
