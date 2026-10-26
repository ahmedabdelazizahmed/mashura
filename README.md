# Mashura (مشورة)

A bilingual-ready (Arabic-first, RTL) booking platform for a solo business consultant: clients browse consultation types, pick a duration and a time slot, and book; the owner manages bookings, leads and the catalog from an admin dashboard.

Built with **React 18 + TypeScript + Vite + React Router** on top of **Supabase** (Postgres, Auth, Row Level Security).

> Personal project by Ahmed Abdelaziz. Status: working MVP — see "What works / what doesn't" below.

## What works

- Landing page with lead-capture form (saved to the `leads` table)
- Sign up, sign in (email + password, Google OAuth), email verification / OTP, password reset — real Supabase Auth
- Route guards by role (client / staff / admin)
- Client app: browse consultation types from the database, choose duration and available slot, create a booking, view and cancel own bookings, account area
- Admin app: bookings, clients, leads pipeline, catalog (types and durations), availability slots
- Database schema: 10 tables, triggers, RLS policies and a storage bucket (`supabase/migrations/0001_init.sql`), plus dev seed data

## What doesn't (yet)

- No real payment gateway: payment rows are created but nothing is charged
- In the admin app, the schedule, payments, notifications and team/permissions screens still use sample data
- No automated tests
- The design system is a custom UMD bundle in `public/_ds/` (not an npm package)

## Run it locally

```bash
npm install
cp .env.local.example .env.local   # then fill in your own Supabase values
npm run dev                        # http://localhost:5173
```

You need your own free Supabase project:

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/migrations/0001_init.sql`, then `supabase/seed.sql`.
3. Put the project URL and the **anon** key (never the service_role key) in `.env.local`:
   ```
   VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=...
   ```
4. Create a user, then set its role in the `profiles` table to `owner` or `admin` to open `/admin`.

More details in [`supabase/README.md`](supabase/README.md).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Type-check and production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Type-check only |

## Routes

| Route | Page |
|---|---|
| `/` | Landing |
| `/login`, `/signup`, `/verify`, `/otp`, `/forgot`, `/reset`, `/success` | Auth flow |
| `/app` | Client app (booking flow + account) |
| `/admin` | Admin dashboard (staff only) |

## Notes

- RTL first: `<html lang="ar" dir="rtl">` in `index.html`.
- React is loaded from a CDN as a global and aliased through small shims in `src/shims/`, so the design-system bundle and the app share a single React instance.
- Security relies on Row Level Security in the database, not on the client. Only the public anon key is ever used in the browser.

---

## بالعربي باختصار

مشورة منصة حجز استشارات بيزنس: العميل يختار نوع الاستشارة والمدة والميعاد ويحجز، والمالك يدير الحجوزات والعملاء المحتملين والكتالوج من لوحة تحكم. الدخول والتسجيل وقاعدة البيانات شغالين فعلاً على Supabase. الدفع الحقيقي لسه مش متوصل.
