# Taska Minimal Starter (Next.js + Supabase + Stripe + Resend)

A dead-simple, multi-tenant-friendly spine so you can actually ship:

- **Auth & DB**: Supabase (Auth + Postgres + RLS)
- **Billing**: Stripe (subscriptions) → sets `orgs.subscription_status`
- **Email**: Resend (for invoice/job emails)
- **SMS**: MessageMedia/Twilio (plug-in ready)
- **Jobs & Schedule**: basic CRUD + "Today" view
- **Maps**: deep-link to Google Maps from job cards

This is intentionally boring and small. Add shadcn/ui etc. later.

## One-time setup
1. Create a **Supabase** project and get the keys:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY` (server only)
2. Create a **Stripe** account. Get:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET` (after you add the webhook endpoint)
3. Create a **Resend** API key:
   - `RESEND_API_KEY`
4. (Optional) Create **MessageMedia** or **Twilio** keys for SMS:
   - `MESSAGEMEDIA_API_KEY`, `MESSAGEMEDIA_API_SECRET`
   - or `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`

## Environment
Copy `.env.example` to `.env.local` and fill in values. Never commit `.env.local`.

## Database
Run the SQL in `supabase/schema.sql` in the Supabase SQL editor. This creates:
- `orgs`, `profiles`, `org_members`, `subscriptions`
- `jobs`, `addresses`
- RLS & policies

## Stripe webhook
Add an endpoint:
- URL: `https://YOUR-DEPLOYMENT.vercel.app/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

## Run locally
```bash
pnpm i
pnpm dev
```

Visit `http://localhost:3000`:
- Use Supabase Auth (magic link, etc.)
- Create an org from `/dashboard`
- Add jobs. See "Today" list. Click a job → opens Google Maps for nav.

## Deploy
- Vercel → add environment variables → deploy
- Supabase stays external

## Notes
- This is a minimal backbone. UX is bare. The goal is to **work** first.
- All server calls go through API routes with the **service key** (server-only).
- Multi-tenancy is enforced through `org_id` + RLS. Keep it simple.
- Extend: invoices PDF, Xero sync, push notifications, calendar UI, etc.
# taska-app


