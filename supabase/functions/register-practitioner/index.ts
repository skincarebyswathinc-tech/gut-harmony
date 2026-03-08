import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, serviceKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { practiceName, specialization, licenseNumber } = await req.json();
    if (!practiceName?.trim()) throw new Error("Practice name required");

    // Add practitioner role
    await adminClient
      .from("user_roles")
      .upsert({ user_id: user.id, role: "practitioner" }, { onConflict: "user_id,role" });

    // Update profile with practitioner details
    await adminClient
      .from("profiles")
      .update({
        practice_name: practiceName.trim(),
        specialization: specialization?.trim() || null,
        license_number: licenseNumber?.trim() || null,
      })
      .eq("user_id", user.id);

    // Link any pending shared reports by email
    await adminClient
      .from("shared_reports")
      .update({ practitioner_user_id: user.id })
      .eq("practitioner_email", user.email?.toLowerCase())
      .is("practitioner_user_id", null);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Register practitioner error:", e);
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
