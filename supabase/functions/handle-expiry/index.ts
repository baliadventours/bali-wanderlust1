import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Find expired bookings
    const { data: expiredBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('id, tour_id, booking_date, pricing_breakdown')
      .eq('status', 'awaiting_payment')
      .lt('expires_at', new Date().toISOString())

    if (fetchError) throw fetchError

    for (const booking of expiredBookings || []) {
      await supabase.rpc('release_slots', { p_booking_id: booking.id })
    }

    return new Response(JSON.stringify({ processed: expiredBookings?.length || 0 }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
