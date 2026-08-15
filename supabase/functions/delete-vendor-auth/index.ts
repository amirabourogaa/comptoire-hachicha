import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vendorId, orphanUserId } = await req.json();

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Handle orphan user deletion (auth user without linked vendor)
    if (orphanUserId) {
      console.log("Deleting orphan auth user:", orphanUserId);
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(orphanUserId);
      if (authError) {
        console.error("Error deleting orphan auth user:", authError);
        return new Response(
          JSON.stringify({ error: "Failed to delete orphan user: " + authError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ success: true, message: "Orphan auth user deleted successfully" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle vendor deletion
    if (!vendorId) {
      return new Response(
        JSON.stringify({ error: "vendorId or orphanUserId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the vendor's user_id
    const { data: vendor, error: vendorError } = await supabaseAdmin
      .from("vendors")
      .select("user_id")
      .eq("id", vendorId)
      .single();

    if (vendorError) {
      console.error("Error fetching vendor:", vendorError);
      return new Response(
        JSON.stringify({ error: "Vendor not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = vendor?.user_id;

    // Delete vendor_roles
    const { error: rolesError } = await supabaseAdmin
      .from("vendor_roles")
      .delete()
      .eq("vendor_id", vendorId);

    if (rolesError) {
      console.error("Error deleting vendor roles:", rolesError);
    }

    // Delete the vendor record
    const { error: deleteVendorError } = await supabaseAdmin
      .from("vendors")
      .delete()
      .eq("id", vendorId);

    if (deleteVendorError) {
      console.error("Error deleting vendor:", deleteVendorError);
      return new Response(
        JSON.stringify({ error: "Failed to delete vendor" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete auth user if exists
    if (userId) {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (authError) {
        console.error("Error deleting auth user:", authError);
        // Don't fail the request - vendor is already deleted
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Vendor deleted successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
