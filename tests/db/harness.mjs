import { PGlite } from '@electric-sql/pglite'
import { pg_trgm } from '@electric-sql/pglite/contrib/pg_trgm'
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto'
import fs from 'node:fs'

export async function makeDb(migrations) {
  const db = new PGlite({ extensions: { pg_trgm, pgcrypto } })
  await db.exec(`
    create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    create schema auth; create schema storage; create schema extensions;
    create table auth.users (instance_id uuid, id uuid primary key default gen_random_uuid(), aud text, role text, email text, encrypted_password text, email_confirmed_at timestamptz, raw_app_meta_data jsonb default '{}'::jsonb, raw_user_meta_data jsonb default '{}'::jsonb, created_at timestamptz, updated_at timestamptz, confirmation_token text, recovery_token text, email_change_token_new text, email_change text, email_change_token_current text, phone_change text, phone_change_token text, reauthentication_token text);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create table storage.buckets (id text primary key, name text, public boolean);
    create table storage.objects (id uuid default gen_random_uuid(), bucket_id text, name text);
    create function storage.foldername(name text) returns text[] language sql as $$ select string_to_array(name, '/') $$;
    grant usage on schema public, auth, storage to anon, authenticated, service_role;
    alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
    alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
    alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
    grant all on all tables in schema storage to anon, authenticated, service_role;
    grant select on auth.users to authenticated;
  `)
  for (const f of migrations) await db.exec(fs.readFileSync(f, 'utf8'))
  return db
}

// Run `fn` as an API user (role + JWT sub); resets afterwards.
export async function as(db, role, uid, sql, params = []) {
  await db.exec(`set role ${role}; select set_config('request.jwt.claim.sub', '${uid ?? ''}', false);`)
  try { return await db.query(sql, params) }
  finally { await db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false);`) }
}
export async function tryAs(db, role, uid, sql, params = []) {
  try { const r = await as(db, role, uid, sql, params); return { ok: true, rows: r.rows, n: r.affectedRows } }
  catch (e) { return { ok: false, err: e.message } }
}
