# 🚀 TourSphere: 10-Minute Deployment Guide

Follow these steps to take your Tour Booking Platform from local code to production.

---

## ⚠️ Important Note on React 19
This project uses **React 19**. Some libraries (like TanStack Query) still list React 18 as a requirement. We have handled this in `package.json` using `overrides` and in `.npmrc`. If you install locally, use:
`npm install --legacy-peer-deps`

---

## 1. Supabase Setup (Backend)
1. **Create Project**: Sign up at [supabase.com](https://supabase.com) and create a new project.
2. **Database Schema**: 
   - Open **SQL Editor** in Supabase.
   - Copy the contents of `architecture/database-schema.sql` and run it. 
   - *Note: Ensure you copy ONLY the SQL code, excluding any conversational text.*
3. **Get Keys**: 
   - Go to **Project Settings > API**.
   - Copy `Project URL` and `anon public` key.

---

## 2. Stripe Setup (Payments)
1. **API Keys**: 
   - Go to [Stripe Dashboard](https://dashboard.stripe.com) (Developers > API Keys).
   - Get your `Publishable key` and `Secret key`.

---

## 3. Vercel Setup (Frontend)
1. **Import Project**: 
   - Connect your GitHub repo to [Vercel](https://vercel.com).
2. **Environment Variables**: 
   - Add these in the Vercel project settings:
     - `VITE_SUPABASE_URL` = (From Step 1)
     - `VITE_SUPABASE_ANON_KEY` = (From Step 1)
     - `VITE_STRIPE_PUBLISHABLE_KEY` = (From Step 2)
     - `VITE_CLIENT_URL` = `https://your-project.vercel.app`
3. **Deploy**: Click "Deploy". The `.npmrc` file will automatically handle the React 19 conflicts for you.

---

## 4. Closing the Loop (Edge Functions)
1. **Login & Link**: 
   - `npx supabase login`
   - `npx supabase link --project-ref your-project-id`
2. **Set Function Secrets**:
   - `npx supabase secrets set STRIPE_SECRET_KEY=sk_live_...`
   - `npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`
   - `npx supabase secrets set CLIENT_URL=https://your-app.vercel.app`
3. **Deploy Functions**:
   - `npx supabase functions deploy create-checkout-session`
   - `npx supabase functions deploy stripe-webhook`
4. **Stripe Webhook**: 
   - Point your Stripe Webhook to: `https://[ID].supabase.co/functions/v1/stripe-webhook`

---

## ✅ Deployment Verified!
- [ ] **Auth**: Visit `/register` and create an account.
- [ ] **Admin**: Go to `/admin/tours` and create your first tour.
- [ ] **Booking**: Test the Stripe redirect flow.