# Mashura (مشورة)

Arabic-first (RTL) consultation booking platform with a **chat assistant that books for you**: type *"عايز استشارة بكرة الساعة 5 العصر"* and it finds the slot, shows the server-computed price and books it after an explicit "yes".

> **Proof of concept.** The booking flow, slot engine, admin dashboard and assistant are real and run against a real Postgres database. Online payments, saved cards, notification preferences and team/permissions screens are **visual only** and clearly labelled "شكل توضيحي" in the UI. They are meant to be built out with an actual client.

**Stack:** React 18 · TypeScript · Vite · React Router · Supabase (Auth, Postgres, Row Level Security, RPC functions, Edge Functions)

## What works

| Area | Status |
|---|---|
| Landing page with live open slots, consultation types from the DB, FAQ | Real |
| Sign up / sign in / password reset (Supabase Auth) | Real |
| Client app: pick type, duration, mode and slot, book, cancel, view bookings and payment status | Real |
| **Chat assistant**: Egyptian-Arabic dates and times, real availability, suggests alternatives, books only after "yes" | Real |
| Admin: bookings (confirm / cancel / complete / no-show, session link or location, record cash payment), slot generation and blocking, consultation types CRUD, clients, leads, payments list, notifications | Real |
| Online payment gateway, saved cards, notification settings | Visual only |
| Team members and permission matrix screens | Visual only (roles themselves are enforced in the database) |

## Security model (short version)

All writes to bookings, payments, leads and roles go through `SECURITY DEFINER` RPC functions; direct table writes are revoked. Prices are computed on the server, slots are locked in the same transaction, roles can only be changed by admins, and RLS protects every table. 58 automated attack tests were run against the migration (privilege escalation, double booking, price tampering, IDOR, injection). Details in [SECURITY.md](SECURITY.md).

## Run it locally

```bash
npm install
cp .env.local.example .env.local   # fill in your own Supabase URL + anon key
npm run dev                        # http://localhost:5173
```

### Supabase setup (free tier is enough)

1. Create a project at [supabase.com](https://supabase.com).
2. In the **SQL editor** run, in this order: `supabase/migrations/0001_init.sql`, `supabase/migrations/0002_security_hardening.sql`, then `supabase/seed.sql` (it also generates 4 weeks of slots).
3. Put the project URL and the **anon** key in `.env.local`. Never use the service_role key in the frontend.
4. Sign up in the app, then make yourself the owner (SQL editor):
   ```sql
   update public.profiles set role = 'owner' where email = 'you@example.com';
   ```
   Now `/admin` opens for you. Role changes are not possible from the browser by design.
5. Recommended Auth settings (Dashboard → Authentication): minimum password length 8 and require upper/lower/digits, enable CAPTCHA (Cloudflare Turnstile or hCaptcha), add your site URL and `<site>/reset` and `<site>/app` to the redirect allow-list. Email confirmation is optional for a demo.

### Optional: language-model mode for the assistant

The built-in parser already understands Egyptian-Arabic dates and times without any API. To let a model help with unusual phrasing:

```bash
supabase functions deploy assistant
supabase secrets set GROQ_API_KEY=...        # stored in Supabase, never in the repo
# then set VITE_ASSISTANT_AI=true in the frontend env
```

The function only returns `{intent, slots}`, validates everything the model says, and cannot book anything itself.

## Deploy (Vercel)

Import the repo, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, deploy. `vercel.json` adds security headers (CSP, frame blocking, HSTS) and the SPA rewrite.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Type-check and production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Type-check only |

## Project layout

```
src/lib/assistantNlu.ts      pure Egyptian-Arabic parser (dates, times, durations, intents)
src/lib/assistantEngine.ts   pure conversation engine (dependencies injected, easy to test)
src/components/Assistant.tsx chat widget
src/lib/api.ts               typed Supabase/RPC client with Arabic error messages
src/pages/                   landing, auth, client app, admin app
supabase/migrations/         schema, RLS, RPC functions
supabase/functions/assistant optional Edge Function
```

## Notes

- RTL first (`<html lang="ar" dir="rtl">`), responsive down to phone width.
- React is self-hosted in `public/vendor/` and shared with the design-system bundle in `public/_ds/` through small shims in `src/shims/`.
- No analytics, no third-party scripts. Fonts come from Google Fonts via the design-system CSS.

---

## بالعربي باختصار

مشورة منصة حجز استشارات بالعربي، فيها مساعد شات بيحجز لك من جملة زي «عايز استشارة بكرة الساعة ٥ العصر». ده **مشروع لإثبات الفكرة**: الحجز والمواعيد ولوحة الإدارة والمساعد شغّالين فعلًا على قاعدة بيانات حقيقية، أما الدفع الإلكتروني والكروت المحفوظة وشاشات الموظفين فشكل توضيحي بس لحد ما تتبني مع عميل فعلي. خطوات التشغيل فوق، وملف [SECURITY.md](SECURITY.md) بيشرح الحماية.
