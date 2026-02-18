
# Supabase Edge Functions for Stripe

## 1. create-checkout-session
This function handles server-side validation and creates a Stripe Checkout session.

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.18.0"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  const { tour_id, availability_id, participants, addon_ids, coupon_code } = await req.json()
  const user = await supabase.auth.getUser(req.headers.get('Authorization')?.split(' ')[1]!)

  // 1. Validate slot availability
  const { data: slot } = await supabase.from('tour_availability').select('*').eq('id', availability_id).single()
  if (slot.available_spots < participants.length) throw new Error('Not enough spots available')

  // 2. Calculate Final Price on Server
  // ... fetch tour, addons, seasonal rules, and apply coupon logic ...
  const amount = 10000; // Final amount in cents

  // 3. Create Pending Booking
  const { data: booking } = await supabase.from('bookings').insert({
    customer_id: user.data.user.id,
    availability_id,
    status: 'pending',
    total_amount_usd: amount / 100,
    currency_code: 'USD',
    currency_amount: amount / 100
  }).select().single()

  // 4. Create Stripe Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: 'Tour Booking' },
        unit_amount: amount,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${Deno.env.get('CLIENT_URL')}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${Deno.env.get('CLIENT_URL')}/checkout?tourId=${tour_id}&slotId=${availability_id}`,
    metadata: { booking_id: booking.id }
  })

  return new Response(JSON.stringify({ url: session.url }), { headers: { 'Content-Type': 'application/json' }})
})
```

## 2. stripe-webhook
This function listens for successful payments and updates the database.

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@12.18.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!
  const body = await req.text()
  const event = stripe.webhooks.constructEvent(body, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET')!)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const booking_id = session.metadata.booking_id

    // Update Booking Status
    const { data: booking } = await supabase
      .from('bookings')
      .update({ status: 'confirmed', stripe_payment_intent_id: session.payment_intent })
      .eq('id', booking_id)
      .select()
      .single()

    // Decrement available spots
    await supabase.rpc('decrement_available_spots', { 
      row_id: booking.availability_id, 
      count: 1 // should be participant count 
    })
    
    // Trigger Email Function here...
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})
```
