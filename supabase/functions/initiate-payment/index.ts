import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { bookingId } = await req.json()

    // 1. Fetch booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, tours(*)')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) throw new Error('Booking not found')

    // 2. Verify price (already calculated by DB RPC during reserve_slots, but we can re-verify if needed)
    // For now, we trust the DB record which was created by reserve_slots RPC.

    // 3. Initiate with Payment Provider (e.g. Midtrans)
    // This is a mock implementation. In real world, call Midtrans API here.
    const redirectUrl = `https://mock-payment-gateway.com/pay?bid=${bookingId}&amt=${booking.total_amount_usd}`

    // 4. Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id: bookingId,
        provider: 'midtrans',
        amount: booking.total_amount_usd,
        status: 'pending'
      })

    if (paymentError) throw paymentError

    return new Response(
      JSON.stringify({ redirectUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
