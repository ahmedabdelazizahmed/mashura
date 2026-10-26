# Supabase — Mashura

| File | Purpose |
|---|---|
| `migrations/0001_init.sql` | Tables, enums, triggers, base RLS, storage bucket |
| `migrations/0002_security_hardening.sql` | Constraints, stricter policies, revoked direct writes, RPC functions, notification triggers |
| `seed.sql` | One neutral demo consultant, 3 consultation types with durations/prices, weekly availability rules, 28 days of slots. Safe to re-run |
| `functions/assistant` | Optional Edge Function (language-model parser for the chat assistant) |

## Apply (SQL editor)
Run `0001_init.sql`, then `0002_security_hardening.sql`, then `seed.sql`. Each should finish with *Success*.

## Verify
```sql
select tablename, rowsecurity from pg_tables where schemaname = 'public' order by 1;  -- all true
select slug, title from public.consultation_types order by sort_order;                -- 3 rows
select count(*) from public.availability_slots where starts_at > now();               -- > 0
```

## First admin
```sql
update public.profiles set role = 'owner' where email = 'you@example.com';
```
Later role changes can be made from SQL with `select public.set_user_role('user@example.com', 'reception');` (owner/admin only).

## Keep slots fresh
Admins press "ولّد مواعيد الـ٢٨ يوم الجاية" in the Schedule screen, or schedule `select public.generate_slots(current_date, current_date + 27);` as a Supabase cron job.
