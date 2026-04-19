# Groundwork Coffee Co.

A full-stack Astro + Supabase + Stripe + Resend ecommerce site for Groundwork Coffee Co. — specialty coffees and precision brewing tools.

## What's built

- **Astro 5** (SSR via `@astrojs/vercel`) with **Tailwind v4**
- **Supabase**-backed product catalog (coffees, equipment, bundles) + orders, contact, subscribers, content
- **Stripe Checkout** with dynamic `price_data` — prices read from Supabase at checkout
- **Stripe webhook** at `/api/stripe/webhook` writes orders + fires Resend confirmation emails
- **Resend** transactional email for contact + order confirmations
- Full SEO: `<SEOHead>` component, sitemap, robots.txt, Organization/WebSite/Product/FAQ/BlogPosting/BreadcrumbList JSON-LD
- Shop pages: `/shop`, `/shop/coffee`, `/shop/brewing-equipment`, `/shop/bundles` + dynamic `[slug]` routes
- Home barista cart drawer (localStorage) + checkout flow (/checkout/success + /cancel)
- Content-driven `/blog` index and `/blog/[slug]` (no seed posts — ready for Harbor Writer)

## Env vars

See `.env.example`. Required for a full production deploy:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `STRIPE_SECRET_KEY`
- `PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `PUBLIC_SITE_URL`
- `FROM_EMAIL` (defaults to `onboarding@resend.dev`)

## Supabase schema

Tables (all prefixed `groundwork_`):

- `groundwork_products` — product catalog
- `groundwork_orders` — Stripe orders
- `groundwork_content` — blog/content (public SELECT when published)
- `groundwork_contact_submissions`
- `groundwork_subscribers`

## Local dev

```bash
npm install --legacy-peer-deps
cp .env.example .env    # fill in values
npm run dev
```

## Deploy

This repo is structured for 1-click Vercel import:

1. Connect the repo on https://vercel.com/new.
2. Framework preset: Astro (auto-detected).
3. Add the env vars listed above under Project Settings → Environment Variables.
4. Deploy. The `@astrojs/vercel` adapter handles SSR.

### Post-deploy: Stripe webhook

Once deployed, register a Stripe webhook:

```bash
curl -sS https://api.stripe.com/v1/webhook_endpoints \
  -u "sk_test_YOUR_KEY:" \
  -d "url=https://<your-domain>/api/stripe/webhook" \
  -d "enabled_events[]=checkout.session.completed"
```

Copy the returned `secret` (starts with `whsec_`) and set it as the `STRIPE_WEBHOOK_SECRET` env var in Vercel, then redeploy.

## Next steps / TODO

- [ ] Register the Stripe webhook (one-time, see above)
- [ ] Verify a sending domain in Resend so confirmations come from your own address (currently using `onboarding@resend.dev`)
- [ ] Add your own product imagery (current images are from Unsplash)
- [ ] Connect a custom domain in Vercel
- [ ] Add pages for your Privacy Policy / Terms if needed for payments compliance

— Built by Harbor Build
