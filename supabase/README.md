# Supabase — Mashura

| File | Purpose |
|---|---|
| `migrations/0001_init.sql` | Tables, triggers, base RLS, helper functions |
| `migrations/0002_security_hardening.sql` | Stricter policies, revoked direct writes, RPC functions, notification triggers |
| `migrations/0003_payments_and_knowledge.sql` | Payment settings, `submit_payment_reference`, payment notifications, knowledge base (`kb_articles`, `kb_search`) |
| `seed.sql` | Consultant profile, 3 consultation types with durations and prices, weekly availability rules, 28 days of slots. Safe to re-run (it resets prices to the file's values) |
| `seed_kb.sql` | Starter knowledge-base articles for the assistant. Safe to re-run |
| `seed-sample-data.sql` | **Optional** sample clients, bookings, payments and leads for a realistic dashboard |
| `remove-sample-data.sql` | Removes exactly what `seed-sample-data.sql` added |
| `functions/assistant` | Optional Edge Function: language-model parser for the chat assistant |
| `functions/assistant-answer` | Optional Edge Function: phrases an answer from retrieved knowledge-base articles |

## Apply (SQL editor)
Run `0001_init.sql`, `0002_security_hardening.sql`, `seed.sql`, `0003_payments_and_knowledge.sql`, `seed_kb.sql` in that order. Each should finish with *Success*.
If you already ran 0001 and 0002, run only `0003_payments_and_knowledge.sql` and `seed_kb.sql`.

## Verify
```sql
select tablename, rowsecurity from pg_tables where schemaname = 'public' order by 1;  -- all true
select slug, title from public.consultation_types order by sort_order;                -- 3 rows
select count(*) from public.availability_slots where starts_at > now();               -- > 0
select count(*) from public.kb_articles;                                              -- 27
select * from public.kb_search('ازاي ادفع', 3);                                       -- best match first
```

## First admin
```sql
update public.profiles set role = 'owner' where email = 'you@example.com';
```
Later role changes: the Team screen in the dashboard, or `select public.set_user_role('user@example.com', 'reception');` (owner / admin only).

## Keep slots fresh
Admins press "ولّد مواعيد الـ٢٨ يوم الجاية" in the Schedule screen, or schedule `select public.generate_slots(current_date, current_date + 27);` as a Supabase cron job.
