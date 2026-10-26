# Supabase — Mashura

Schema, RLS, and seed data for the Mashura booking platform.

## Files

| File | Purpose |
|---|---|
| `migrations/0001_init.sql` | Initial schema: 10 tables, triggers, RLS policies, storage bucket |
| `seed.sql` | Dev data: expert (Ahmed), 3 consultation types, durations, availability rules, sample leads |

## Apply the migration

### Option A — Fastest: Supabase Dashboard SQL Editor

1. Open <https://supabase.com/dashboard/project/YOUR-PROJECT-REF/sql/new>
2. Copy the entire contents of [`migrations/0001_init.sql`](migrations/0001_init.sql) → paste → **Run**
3. Then paste [`seed.sql`](seed.sql) → **Run**

You should see `Success. No rows returned` (or similar) for both.

### Option B — Supabase CLI (needs `npx supabase` installed)

```bash
cd mashura-react
npx supabase link --project-ref <your-project-ref>
npx supabase db push               # applies migrations
psql "$(npx supabase status -o env | grep DB_URL | cut -d= -f2-)" < supabase/seed.sql
```

## Verify it worked

Run this in the SQL editor — should return 3 rows (regular, urgent, meeting):

```sql
select slug, title, modes, is_active
from public.consultation_types
order by sort_order;
```

Then check RLS is on for every table:

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
```

Every `rowsecurity` must be `true`.

## What's next

After applying:

- **Phase 1 step 5:** generate TypeScript types
  ```bash
  npx supabase gen types typescript --project-id <your-project-ref> \
    > src/types/supabase.ts
  ```
- **Phase 2:** wire `AuthProvider` + route guards
- **Phase 3:** connect the 7 auth pages to real Supabase auth
- **Phase 4:** replace mock `src/lib/data.ts` with real fetchers


## Reset (dev only)

To wipe and re-apply from scratch:

```sql
-- ⚠️ deletes ALL app data. NEVER run in production.
drop schema public cascade;
create schema public;
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on schema public to postgres, service_role;
```

Then re-run `0001_init.sql` and `seed.sql`.
