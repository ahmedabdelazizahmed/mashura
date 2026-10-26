# Security notes

## Threat model
A public booking site: anonymous visitors, signed-in clients, and staff (owner / admin / reception / viewer). The browser is untrusted. Only the Supabase **anon** key is shipped.

## Controls
- **Row Level Security on every table.** Clients read only their own rows. Staff see operational data. Viewers are read-only.
- **No direct writes** to `bookings`, `payments`, `leads`, `availability_slots` (except staff slot blocking), `profiles.role`. Writes happen through `SECURITY DEFINER` functions with a pinned `search_path`: `create_booking`, `cancel_booking`, `set_booking_status`, `set_payment_status`, `capture_lead`, `generate_slots`, `set_user_role`. `anon` has no execute rights except on `capture_lead`.
- **Server-side pricing.** The client sends type, minutes, mode and start time. The price, slot lock and payment row are created in one transaction. Double booking is prevented by row locks plus a unique index.
- **Roles** cannot be self-assigned: new users always start as `client`; profile updates are limited by column grants to name, phone and avatar.
- **Input limits** (topic length, minutes multiple of 15, https-only session links, lead rate limiting and 24h de-duplication).
- **Unguessable references**: booking `ref` and `invoice_no` are random, not sequential.
- **Open-redirect safe login**: only same-origin paths are accepted after sign-in.
- **Assistant**: parses text only. It cannot book without an explicit confirmation, and the booking still passes through `create_booking`. The optional model endpoint validates every field it returns and keeps the API key in Supabase secrets.
- **HTTP headers** (CSP, X-Frame-Options, HSTS, Referrer-Policy, Permissions-Policy) via `vercel.json`.

## Tested
`create_booking` / `cancel_booking` / role and RLS behaviour were exercised against a local Postgres (PGlite) with 58 attack cases: privilege escalation, direct table writes, price tampering, double booking, IDOR on bookings/payments/notifications, invalid transitions, malformed input. All blocked.

## Before going live with a real client
- Turn on CAPTCHA and email confirmation in Supabase Auth, set a strong password policy.
- Add a real payment gateway on the server side (webhooks mark payments paid; never trust the browser).
- Add backups, monitoring and a privacy policy reviewed for the client's jurisdiction (the included pages are templates).
- Rotate keys if any were ever pasted into a public place. Never commit `.env*` files.

## Reporting
Open a private security advisory on GitHub or email the maintainer.
