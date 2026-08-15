import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { order_id, amount, currency, customer_name, customer_email, customer_phone } = await req.json();

    // Get payment settings
    const { data: settingsData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'payment_settings')
      .single();

    if (!settingsData?.value) {
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const settings = JSON.parse(settingsData.value);

    if (!settings.is_enabled) {
      return new Response(
        JSON.stringify({ error: 'Online payment is disabled' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generic payment gateway call
    // This is a template - adapt based on the actual gateway API
    if (settings.api_url && settings.api_key) {
      try {
        const paymentResponse = await fetch(settings.api_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.api_key}`,
            'X-API-Key': settings.api_key,
          },
          body: JSON.stringify({
            amount: Math.round(amount * 1000), // Convert to millimes for TND
            currency: currency || 'TND',
            order_id: order_id,
            customer: {
              name: customer_name,
              email: customer_email,
              phone: customer_phone,
            },
            // Common fields for various gateways
            description: `Commande ${order_id}`,
            webhook_url: settings.webhook_url || undefined,
          }),
        });

        const paymentData = await paymentResponse.json();

        // Update transaction record
        await supabase
          .from('payment_transactions')
          .update({
            gateway_transaction_id: paymentData.id || paymentData.transaction_id || null,
            gateway_response: paymentData,
            status: paymentResponse.ok ? 'processing' : 'failed',
            error_message: paymentResponse.ok ? null : JSON.stringify(paymentData),
          })
          .eq('order_id', order_id);

        if (paymentResponse.ok) {
          // Return payment URL if gateway provides one
          return new Response(
            JSON.stringify({
              success: true,
              payment_url: paymentData.payment_url || paymentData.redirect_url || paymentData.url || null,
              transaction_id: paymentData.id || paymentData.transaction_id,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          return new Response(
            JSON.stringify({ error: 'Payment gateway error', details: paymentData }),
            { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (gatewayError) {
        console.error('Gateway error:', gatewayError);
        return new Response(
          JSON.stringify({ error: 'Failed to connect to payment gateway' }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // No gateway configured - return success without redirect
    return new Response(
      JSON.stringify({ success: true, message: 'Payment recorded (no gateway configured)' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
