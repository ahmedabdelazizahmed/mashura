# Payments

Mashura supports two payment methods that need no payment gateway:

1. **Cash** at the session.
2. **Transfer** to a mobile wallet or an InstaPay address.

## Flow for a transfer

1. The client chooses *transfer* while booking. The booking screen shows the receiving details the admin configured (wallet name and number, InstaPay address, a note), each with a copy button.
2. After booking, the client transfers the amount from their banking / wallet app, then opens the booking and enters the **transfer reference** (`submit_payment_reference`). Staff are notified: *"transfer waiting for confirmation"*.
3. Staff open **Payments** in the dashboard, match the reference with their wallet / InstaPay statement and press **Confirm** (`set_payment_status → paid`) or **Reject** (`→ failed`).
4. The client is notified (trigger `notify_payment_events`), the status changes to *paid* and the **invoice** can be printed or saved as PDF from *Payments and invoices*.
5. If a paid booking is cancelled, staff return the money and press **Refund** (`→ refunded`); the client is notified.

Cash payments stay *pending* until staff press **Cash received** after the session.

## What the database enforces

- A client can only submit a reference for **their own** pending wallet payment, once the booking is not cancelled. They can never change the status or the amount.
- Only staff writers (`owner`, `admin`, `reception`) can confirm, reject or refund.
- Receiving details are readable by signed-in users and editable by admins only (`site_settings`, whitelisted keys).
- The booking price is computed on the server; the payment amount always equals it.

## Why there is no card form

Taking card details requires a licensed payment gateway and server-side webhooks that mark a payment paid; a form without them would not be real. The planned integration (for example Paymob in Egypt) would add a `card` method whose status is set only by the gateway's webhook (an Edge Function), never by the browser.
