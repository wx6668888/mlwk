# MLWK Global Website

Production-oriented multilingual website for MLWK architectural millwork and
custom cabinetry.

## Included

- React, TypeScript and Vite application
- English, Arabic, Chinese, German and French routes
- Arabic RTL layout
- 210 build-time prerendered routes with canonical and `hreflang` metadata
- Six structured millwork collections and three project solution categories
- Responsive 1080P-ready image and video-led interface
- Five-language MLWK Project Concierge powered by DeepSeek
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
`.dev.vars`. The current workspace already has a local ignored configuration
for the Aliyun Model Studio account.

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
6. Add `mlwk.space` and `www.mlwk.space` as custom domains. The registrar can
   remain Alibaba Cloud; only DNS needs to point to Cloudflare.

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

- `500+` means completed custom projects by the manufacturing team. It does
  not claim 500 overseas deliveries.
- Generated imagery is labeled as a design direction.
- Completed project and factory media must be verified original material.
- Certifications, capacity, MOQ, lead time, address, business email and
  WhatsApp remain unpublished until supplied and verified.
