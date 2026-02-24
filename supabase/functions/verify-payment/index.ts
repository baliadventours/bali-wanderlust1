// Supabase Edge Function: verify-payment
// This is a reference implementation for secure payment verification

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { paymentId } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Fetch payment details
    const { data: payment, error: fetchError } = await supabaseClient
      .from('payments')
      .select('*, bookings(*)')
      .eq('id', paymentId)
      .single()

    if (fetchError || !payment) throw new Error('Payment not found')

    // 2. Verify with Provider API (e.g., Midtrans or PayPal)
    // const providerStatus = await verifyWithMidtrans(payment.transaction_id)
    const isPaid = true; // Mocked verification result

    if (isPaid) {
      // 3. Update payment status
      await supabaseClient
        .from('payments')
        .update({ status: 'paid' })
        .eq('id', paymentId)
      
      // Trigger handles booking status update
    }

    return new Response(JSON.stringify({ success: true, status: isPaid ? 'paid' : 'pending' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
