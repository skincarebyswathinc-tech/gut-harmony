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

    // Verify practitioner role
    const { data: roleCheck } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "practitioner");

    if (!roleCheck || roleCheck.length === 0) {
      throw new Error("Not a practitioner");
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "list";

    if (action === "list") {
      // Get all reports shared with this practitioner (by email or user_id)
      const { data: reports, error: reportsError } = await adminClient
        .from("shared_reports")
        .select("*")
        .or(`practitioner_user_id.eq.${user.id},practitioner_email.eq.${user.email?.toLowerCase()}`);

      if (reportsError) throw new Error(reportsError.message);

      // Enrich with assessment data
      const enriched = [];
      for (const report of (reports || [])) {
        const { data: assessment } = await adminClient
          .from("assessments")
          .select("*")
          .eq("id", report.assessment_id)
          .single();

        // Get patient email
        const { data: patientData } = await adminClient.auth.admin.getUserById(report.patient_user_id);

        // Get notes
        const { data: notes } = await adminClient
          .from("practitioner_notes")
          .select("*")
          .eq("shared_report_id", report.id)
          .eq("practitioner_user_id", user.id)
          .order("created_at", { ascending: false });

        enriched.push({
          ...report,
          assessment,
          patientEmail: patientData?.user?.email || "Unknown",
          notes: notes || [],
        });
      }

      // Update practitioner_user_id if not set (matched by email)
      for (const report of enriched) {
        if (!report.practitioner_user_id && report.practitioner_email === user.email?.toLowerCase()) {
          await adminClient
            .from("shared_reports")
            .update({ practitioner_user_id: user.id, status: "viewed", viewed_at: new Date().toISOString() })
            .eq("id", report.id);
        }
      }

      return new Response(JSON.stringify({ reports: enriched }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "add-note") {
      const { sharedReportId, note } = await req.json();
      if (!sharedReportId || !note?.trim()) throw new Error("Missing fields");

      // Validate note length
      if (note.length > 5000) throw new Error("Note too long (max 5000 characters)");

      const { data, error } = await adminClient
        .from("practitioner_notes")
        .insert({
          shared_report_id: sharedReportId,
          practitioner_user_id: user.id,
          note: note.trim(),
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      return new Response(JSON.stringify({ success: true, note: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Unknown action");
  } catch (e) {
    console.error("Practitioner API error:", e);
    const status = (e as any)?.message === "Unauthorized" ? 401 : 400;
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
