# Mine Arena 1.0 – Medical Registration

Next.js 14 (TypeScript) + Tailwind + Supabase. Public form at `/`, protected organizer dashboard at `/admin/*`.

## 1. Supabase setup
1. Create a project at supabase.com.
2. Open **SQL Editor**, paste `supabase/schema.sql`, run it. This creates `medical_registrations`, `admin_users`, the `is_admin()` function and all Row Level Security policies.
3. **Settings → API**: copy the Project URL, `anon` key and `service_role` key.
4. **Authentication → Providers → Email**: keep enabled. Turn **off** "Allow new users to sign up" (Authentication → Sign In / Providers) so only people you create can log in.

## 2. Database schema
`medical_registrations`: id (uuid pk), full_name, team_name, contact_number (unique), emergency_contact_name, emergency_contact_number, emergency_contact_relationship, has_medical_condition, medical_condition_details, taking_medication, medication_support_details, consent, created_at.

Security model:
- RLS is on and **anon has no access**. Participants submit through `/api/register`, which validates with Zod and inserts using the server-only service-role key.
- Only users listed in `admin_users` can select, update or delete. The dashboard reads with the admin's own session, so the database enforces this even if app code has a bug.
- `/admin/*` and `/api/admin/*` are guarded by middleware (login) and `requireAdmin()` (membership) on the server.

## 3. Create an admin
1. Supabase **Authentication → Users → Add user** → email + password (tick "Auto confirm").
2. Copy the new user's UUID, then run in SQL Editor:
```sql
insert into public.admin_users (user_id) values ('PASTE-USER-UUID-HERE');
```
Remove an admin with `delete from public.admin_users where user_id = '...'`. Use strong, unique passwords and enable MFA if your plan allows.

## 4. Environment variables
Copy `.env.example` to `.env.local`:
| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public, safe because RLS blocks anon |
| `SUPABASE_SERVICE_ROLE_KEY` | **secret, server only** |

## 5. Run locally
```bash
npm install
npm run dev   # http://localhost:3000
```

## 6. Deploy to Vercel
1. Push the repo to GitHub, import it in Vercel.
2. Add the three environment variables (Production and Preview). Never add the service key with a `NEXT_PUBLIC_` prefix.
3. Deploy. Test: submit a form, log in at `/admin/login`, confirm the row appears and CSV export works.

## 7. Privacy and data retention
- Medical data is used only for participant safety and emergency support, visible only to authorized organizers.
- Never in URLs, never logged (the API logs error codes only), never shared with sponsors.
- Retention: delete all records within 30 days after the event: `delete from public.medical_registrations;`. Change the wording in `RegistrationForm.tsx` if your policy differs.
- Duplicate protection: unique contact number, a disabled submit button, a synchronous double-click guard and a honeypot field.
- Recommended before launch: add rate limiting (Vercel Firewall or Upstash) on `/api/register`.
