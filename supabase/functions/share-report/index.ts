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

    const { practitionerEmail, assessmentId } = await req.json();
    if (!practitionerEmail || !assessmentId) throw new Error("Missing required fields");

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(practitionerEmail)) throw new Error("Invalid email format");

    // Verify the assessment belongs to the user
    const { data: assessment } = await supabase
      .from("assessments")
      .select("id")
      .eq("id", assessmentId)
      .eq("user_id", user.id)
      .single();

    if (!assessment) throw new Error("Assessment not found");

    // Check if practitioner exists and has the role
    let practitionerUserId: string | null = null;

    // Look up user by email using admin client
    const { data: practitionerList } = await adminClient.auth.admin.listUsers();
    const practitioner = practitionerList?.users?.find(
      (u: any) => u.email?.toLowerCase() === practitionerEmail.toLowerCase()
    );

    if (practitioner) {
      // Check if they have practitioner role
      const { data: roleData } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", practitioner.id)
        .eq("role", "practitioner");

      if (roleData && roleData.length > 0) {
        practitionerUserId = practitioner.id;
      }
    }

    // Create shared report record
    const { data: sharedReport, error: insertError } = await supabase
      .from("shared_reports")
      .insert({
        patient_user_id: user.id,
        practitioner_email: practitionerEmail.toLowerCase(),
        practitioner_user_id: practitionerUserId,
        assessment_id: assessmentId,
      } as any)
      .select()
      .single();

    if (insertError) throw new Error(insertError.message);

    return new Response(
      JSON.stringify({
        success: true,
        message: practitionerUserId
          ? "Report shared with practitioner"
          : "Report shared. The practitioner will see it when they create their account.",
        shareId: (sharedReport as any)?.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Share error:", e);
    const status = (e as any)?.message === "Unauthorized" ? 401 : 400;
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
