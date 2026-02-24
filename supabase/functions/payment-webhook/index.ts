import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    
    // 1. Verify signature (Provider specific)
    // Mock verification
    const isValid = true; 
    if (!isValid) throw new Error('Invalid signature')

    const { transaction_status, order_id, transaction_id } = body

    // 2. Map status
    let paymentStatus = 'pending'
    if (['settlement', 'capture'].includes(transaction_status)) {
      paymentStatus = 'paid'
    } else if (['deny', 'expire', 'cancel'].includes(transaction_status)) {
      paymentStatus = 'failed'
    }

    // 3. Update payment record
    // The trigger in DB will automatically update booking status if paymentStatus is 'paid'
    const { error: updateError } = await supabase
      .from('payments')
      .update({ 
        status: paymentStatus,
        transaction_id: transaction_id,
        payment_details: body
      })
      .eq('booking_id', order_id)

    if (updateError) throw updateError

    return new Response(JSON.stringify({ status: 'ok' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
