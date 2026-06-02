# MakerSpace Ops MIS Frontend

Premium React/Vite frontend for the MakerSpace Ops MIS user application.

## Deploy On Vercel

Use these Vercel settings:

```text
Framework Preset: Vite
Root Directory: .
Install Command: pnpm install --frozen-lockfile
Build Command: pnpm --filter mis build
Output Directory: web/mis/dist
```

Required environment variables:

```text
VITE_PUBLIC_API_ENDPOINT=https://<render-api-domain>/api/v1/
VITE_PUBLIC_WEB_ENDPOINT=https://<mis-vercel-domain>
VITE_PUBLIC_SITE_NAME=MakerSpace Ops MIS
VITE_PUBLIC_SUPPORT_EMAIL=<support-email>
VITE_PUBLIC_RPAY_FE_KEY=
VITE_PUBLIC_RPAY_SCRIPT=https://checkout.razorpay.com/v1/checkout.js
VITE_SENTRY_DSN=
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_TRACES_SAMPLE_RATE=0.05
```

The SPA fallback and long-lived asset caching are configured in `vercel.json`.
