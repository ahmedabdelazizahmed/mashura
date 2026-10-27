# Architecture

## Principle: the browser is untrusted

The frontend only holds the public (publishable / anon) Supabase key. Everything that matters is enforced in Postgres:

- **Reads** go through Row Level Security: a client sees only their own bookings, payments and notifications; staff see operational data by role.
- **Writes** to bookings, payments, leads, slots and roles are **not** possible with plain table access. They go through `SECURITY DEFINER` functions that check who is calling and validate every input.

| Function | Who | What it guarantees |
|---|---|---|
| `create_booking` | signed-in | Price comes from `duration_options`, never from the client. Slots are locked in the same transaction. At most 5 pending bookings, at least one hour ahead. |
| `cancel_booking` | owner of the booking, or staff | Only before the session starts. Releases the slots and fails a pending payment. |
| `set_booking_status` | staff writers | Valid transitions only; session links must be `https://`. |
| `submit_payment_reference` | owner of the booking | Records the transfer reference on a pending wallet payment and notifies staff. Cannot mark anything paid. |
| `set_payment_status` | staff writers | `pending → paid / failed`, `paid → refunded`. Sets `paid_at`; the client is notified by trigger. |
| `generate_slots` | admins | Builds 15-minute slots from weekly availability (Cairo time). |
| `set_user_role` | owner / admin | Only an owner can grant or revoke owner/admin; the last owner cannot be removed; nobody changes their own role. |
| `capture_lead` | anyone | Rate-limited, de-duplicated contact form. |
| `kb_search` | anyone | Read-only retrieval over active knowledge-base articles. |

## Roles

`client` (default) · `viewer` (read-only staff) · `reception` (operates bookings and payments) · `admin` (also configures services, hours, payment details, knowledge base) · `owner` (also manages admins). The Permissions screen in the dashboard shows this matrix.

## Frontend

- `src/lib/api.ts` is the only place that talks to Supabase; it maps database error codes to Arabic messages.
- `src/lib/hooks.ts` has small data hooks (`useAsync`) instead of a data-fetching library.
- The UI uses a self-hosted design-system bundle (`public/_ds`) shared with the app through shims in `src/shims`.
- Dates are shown in `Africa/Cairo`.

## Schedule data

Availability is stored as concrete 15-minute rows in `availability_slots`, created from weekly rules by `generate_slots` (or the seed). A booking of 45 minutes locks three consecutive rows.
