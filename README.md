# CIRMANO Website

Multilingual website for CIRMANO integrated whole-home customization, focused
on villas and premium residences.

## Included

- React, TypeScript and Vite application
- English, Arabic, Chinese, German and French routes
- Arabic RTL layout
- 210 build-time prerendered routes with canonical and `hreflang` metadata
- Six structured millwork collections and three project solution categories
- Responsive 1080P-ready image and video-led interface
- Five-language CIRMANO Project Concierge powered by DeepSeek
- Curated server-side millwork knowledge base with fact-boundary rules
- Project enquiry form with local preview mode
- Five-language 12-SKU preview shop with cart, regional currency and shipping
- Supabase Google and six-digit email OTP account flows
- PayPal Sandbox checkout, capture and verified webhook flow
- Cloudflare Pages Functions for R2 uploads, D1 storage, Turnstile validation
  and Resend email notifications

## Local preview

```powershell
npm install
npm run dev
```

Production build and preview:

```powershell
npm run build
npm run preview -- --host 127.0.0.1 --port 4174
```

## Private configuration

Copy `.env.example` to `.dev.vars` and fill in the private values. Never commit
`.dev.vars` or provider credentials.

Set the public client variables when building the site:

- `VITE_WHATSAPP_NUMBER`: digits only, including country code
- `VITE_TURNSTILE_SITE_KEY`: public Turnstile site key
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_PAYPAL_CLIENT_ID`: Sandbox client ID during the preview phase

Set these server-side in Cloudflare:

- `TURNSTILE_SECRET_KEY`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `RESEND_API_KEY`
- `INQUIRY_TO_EMAIL`
- `INQUIRY_FROM_EMAIL`
- `DEEPSEEK_API_KEY`
- `DEEPSEEK_BASE_URL`
- `DEEPSEEK_MODEL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`
- `PAYPAL_ENV=sandbox`

## Cloudflare setup

1. Create the R2 bucket named in `wrangler.toml`.
2. Apply `r2-cors.json` to the bucket.
3. Create a D1 database, replace the placeholder database ID in
   `wrangler.toml`, and apply `schema.sql`.
4. Add all private environment variables in the Cloudflare dashboard.
5. Build with `npm run build` and deploy `dist`.
6. Add `cirmano.com` and `www.cirmano.com` as custom domains. Configure
   `cirmano.com` as the primary host and redirect `www.cirmano.com` to it.
   If the former `mlwk.space` domain is still owned, point it to a permanent
   redirect to `https://cirmano.com` after the new host and certificates are
   confirmed. DNS and redirects are configured in the hosting account, not by
   this source tree.

## Authentication and payment

1. In Supabase, enable Google and email OTP providers.
2. Use `{{ .Token }}` in the Supabase email template so customers receive the
   six-digit code used by the login screen.
3. Add `/auth/callback` for every deployed locale origin to the allowed
   redirect URLs and add the matching Supabase callback URL in Google Cloud.
4. Create PayPal Sandbox business and personal test accounts.
5. Register `/api/store/paypal/webhook` as the Sandbox webhook endpoint and
   subscribe to checkout order, payment capture, cancellation and refund
   events.
6. Keep `PAYPAL_ENV=sandbox` until products, inventory, tax, shipping and
   return terms have been approved for live sales.

Without Supabase or PayPal credentials, the preview remains usable: login
shows a configuration notice and checkout creates a clearly labelled local
demonstration order without charging money.

## Video generation

`scripts/generate-hero-barefoot-video.ps1` submits three strict 1080P
`wan2.6-i2v` tasks from the approved barefoot reference frames.
`scripts/process-hero-barefoot.ps1` refuses lower-resolution input, joins the
approved clips and produces desktop 1920 x 1080 plus mobile 1080 x 1350 MP4
and WebM files. The site uses a high-resolution WebP poster until all three
source clips pass review.

The private, ignored `MODEL_QUOTAS.local.md` records the model inventory and
estimated remaining seconds.

## Content rules

- The brand line is `Made As One`; the descriptor is `Integrated Whole-Home
  Customization`.
- The core focus is villas and premium homes, with kitchens, wardrobes,
  interior doors and wall panels as the principal product categories.
- The supplied project photographs show one completed Guangzhou residence;
  confirm product supply and installation scope before making a project claim.
- Do not publish unverified project counts, certifications, capacity, MOQ,
  delivery dates, freight costs or broad regional service claims.
- Manufacturing details must retain their stated scope: laser edgebanding is
  for specified compatible components, and inspection/trial assembly applies
  to selected cabinetry.
- Keep checkout, PayPal, order, database and storage identifiers stable during
  the brand transition. Update live host, OAuth, CORS and email-provider
  settings separately in their respective service dashboards. Verify
  `kai@cirmano.com` as a sender in Resend before using it in Cloudflare.
- The R2 CORS list retains the old website origins for transition compatibility;
  remove them only after the old host no longer serves uploads.
