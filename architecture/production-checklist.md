# Production Readiness & Security Checklist

## 1. Supabase Hardening
- [ ] **RLS Enabled**: Ensure Row Level Security is ON for every table.
- [ ] **Service Role Restricted**: Never use `SERVICE_ROLE_KEY` in the frontend (Vite).
- [ ] **PITR (Point-in-Time Recovery)**: Enable in Supabase dashboard for production databases.
- [ ] **Connection Pooling**: Use transaction pooling (`6543`) for high-concurrency Edge Functions.
- [ ] **VPC/IP Restriction**: (Optional) Restrict database access to Vercel/Edge Function IPs.

## 2. Stripe Configuration
- [ ] **Restricted Keys**: Use Restricted API keys with minimal permissions in Edge Functions.
- [ ] **Webhook Validation**: Always verify Stripe signatures in the `stripe-webhook` Edge Function.
- [ ] **Idempotency**: Use `idempotency_key` when creating payments to prevent double charging.
- [ ] **Live Mode**: Switch from `pk_test` to `pk_live` and verify all webhooks point to production.

## 3. Build & Performance
- [ ] **Brotli/Gzip**: Ensure Vercel is serving assets with modern compression (Default).
- [ ] **Bundle Analysis**: Check `dist` size to ensure no massive libraries are included.
- [ ] **Image Optimization**: Ensure Supabase Storage images are served with `?width=` and `?quality=` parameters where supported by CDN.
- [ ] **404 Handling**: Custom 404 page that maintains SEO structure.

## 4. Security (Hacker-Proofing)
- [ ] **CSP (Content Security Policy)**: Verify `vercel.json` headers don't block necessary external scripts (Stripe, Fonts).
- [ ] **HSTS**: High-security transport enabled via Vercel headers.
- [ ] **Dependency Audit**: Run `npm audit` to check for vulnerable packages.
- [ ] **Input Sanitization**: Ensure all user-provided data (inquiries, booking notes) is sanitized before DB insert or display.

## 5. GDPR & Privacy Compliance
- [ ] **Cookie Consent Banner**: Implement if using non-essential tracking (GA4).
- [ ] **Privacy Policy**: Dynamic page at `/privacy` detailing data usage.
- [ ] **Data Portability**: Implement "Download My Data" button in user dashboard.
- [ ] **Right to be Forgotten**: Logic to "Soft Delete" or "Hard Delete" user profiles and anonymize bookings.
- [ ] **DPA (Data Processing Agreement)**: Ensure agreements are in place with Supabase, Vercel, and Stripe.

## 6. Error Monitoring
- [ ] **Sentry Integration**: Track frontend exceptions.
- [ ] **Log Ingestion**: Connect Supabase and Vercel logs to a monitoring tool (BetterStack, Datadog).
- [ ] **Uptime Monitoring**: Setup health checks for the Vercel site and Supabase API.
