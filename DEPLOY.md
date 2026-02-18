# 🚀 TourSphere: 10-Minute Deployment Guide

Follow these steps to take your Tour Booking Platform from local code to production.

---

## 1. Supabase Setup (Backend)
1. **Create Project**: Sign up at [supabase.com](https://supabase.com) and create a new project.
2. **Database Schema**: 
   - Open **SQL Editor** in Supabase.
   - Copy the contents of `architecture/database-schema.sql` and run it. This builds your tables, roles, and security policies.
3. **Get Keys**: 
   - Go to **Project Settings > API**.
   - Copy `Project URL` and `anon public` key. You'll need these for Vercel.

---

## 2. Stripe Setup (Payments)
1. **API Keys**: 
   - Go to [Stripe Dashboard](https://dashboard.stripe.com) (Developers > API Keys).
   - Get your `Publishable key` and `Secret key`.
2. **Webhooks**: 
   - Go to **Developers > Webhooks**.
   - You will add an endpoint later in Step 4.

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
3. **Deploy**: Click "Deploy". Your site is now live!

---

## 4. Closing the Loop (Edge Functions)
This step connects Stripe payments back to your database.

1. **Install CLI**: Install Supabase CLI locally: `npm install supabase --save-dev`.
2. **Login & Link**: 
   - `npx supabase login`
   - `npx supabase link --project-ref your-project-id`
3. **Set Function Secrets**:
   - Run: `npx supabase secrets set STRIPE_SECRET_KEY=sk_live_...`
   - Run: `npx supabase secrets set CLIENT_URL=https://your-app.vercel.app`
4. **Deploy Functions**:
   - Run: `npx supabase functions deploy create-checkout-session`
   - Run: `npx supabase functions deploy stripe-webhook`
5. **Final Webhook Link**: 
   - In Stripe Dashboard, add a webhook endpoint pointing to: 
     `https://[YOUR_PROJECT_ID].supabase.co/functions/v1/stripe-webhook`
   - Select event: `checkout.session.completed`.

---

## ✅ Deployment Verified!
- [ ] **Auth**: Visit `/register` and create an account.
- [ ] **Admin**: Go to `/admin/tours` and create your first tour.
- [ ] **Booking**: Find your tour, select a date, and click "Book Now" to test the Stripe flow.

**Support**: Check `architecture/production-checklist.md` for advanced hardening tips.