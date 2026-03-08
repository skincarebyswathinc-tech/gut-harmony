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
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    // Get the latest assessment
    const { data: assessments } = await supabase
      .from("assessments")
      .select("*")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .limit(1);

    if (!assessments || assessments.length === 0) {
      throw new Error("No assessment found");
    }

    const assessment = assessments[0];
    const scores = assessment.scores as any;
    const answers = assessment.answers as any;

    // Build the report deterministically from scores + answers
    const report = buildReport(scores, answers);

    // Generate AI narrative
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let aiNarrative = "";

    if (LOVABLE_API_KEY) {
      const prompt = `You are a clinical gut health specialist generating a premium health report. Based on this assessment data, generate a comprehensive narrative report in markdown format.

SCORES:
- Overall: ${scores.overall}/100
- Gut Integrity: ${scores.gut_integrity}/100
- Microbiome Diversity: ${scores.microbiome_diversity}/100
- Digestive Efficiency: ${scores.digestive_efficiency}/100
- Inflammation Load: ${scores.inflammation_load}/100
- Food Sensitivity Risk: ${scores.food_sensitivity_risk}/100
- Gut-Brain Balance: ${scores.gut_brain_balance}/100

SECTION SCORES:
- Digestive Symptoms: ${scores.digestive_symptoms}/100
- Stool Health: ${scores.stool_health}/100
- Lifestyle: ${scores.lifestyle}/100
- Diet Patterns: ${scores.diet_patterns}/100
- Inflammation: ${scores.inflammation}/100
- Gut-Brain: ${scores.gut_brain}/100
- Hormonal: ${scores.hormonal}/100

KEY ANSWERS (1=worst, 5=best):
- Fiber: ${answers.dp_fiber || 'N/A'}, Plant diversity: ${answers.dp_plant_diversity || 'N/A'}
- Fermented foods: ${answers.dp_fermented || 'N/A'}, Sugar: ${answers.dp_sugar || 'N/A'}
- Processed food: ${answers.dp_processed_food || 'N/A'}
- Dairy tolerance: ${answers.dp_dairy || 'N/A'}, Gluten tolerance: ${answers.dp_gluten || 'N/A'}
- Sleep: ${answers.lf_sleep_quality || 'N/A'}, Stress: ${answers.lf_stress || 'N/A'}
- Water: ${answers.lf_water || 'N/A'}, Exercise: ${answers.lf_exercise || 'N/A'}
- Alcohol: ${answers.lf_alcohol || 'N/A'}, Antibiotics: ${answers.lf_antibiotics_recent || 'N/A'}
- Bloating: ${answers.ds_bloating || 'N/A'}, Gas: ${answers.ds_gas || 'N/A'}
- Reflux: ${answers.ds_acid_reflux || 'N/A'}, Constipation: ${answers.ds_constipation || 'N/A'}

Write the following sections (use ## headers):

## Gut Health Summary
A 3-4 sentence clinical overview of the user's gut condition.

## Root Cause Analysis
Explain the top 3-5 lifestyle and dietary drivers affecting gut health. Be specific based on the data.

## Personalized Diet Strategy
### Foods to Increase
List 8-10 specific foods with brief reasoning.
### Foods to Reduce
List 5-8 specific foods/categories with brief reasoning.

## 30-Day Gut Healing Protocol
### Phase 1: Calm Inflammation (Days 1-7)
### Phase 2: Repair Gut Lining (Days 8-14)
### Phase 3: Rebuild Microbiome (Days 15-23)
### Phase 4: Optimize Resilience (Days 24-30)
Each phase should have 3-4 actionable bullet points.

## Lifestyle Optimization Plan
Specific recommendations for sleep, stress, hydration, and exercise based on their scores.

Keep tone clinical but warm. Use bullet points. Max 800 words total.`;

      try {
        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: "You are a clinical gut health specialist. Write professional, evidence-based health reports." },
              { role: "user", content: prompt },
            ],
            stream: false,
          }),
        });

        if (aiResp.ok) {
          const aiData = await aiResp.json();
          aiNarrative = aiData.choices?.[0]?.message?.content || "";
        } else if (aiResp.status === 429) {
          aiNarrative = "AI narrative temporarily unavailable due to rate limits. Please try again later.";
        } else if (aiResp.status === 402) {
          aiNarrative = "AI narrative unavailable. Please check your workspace credits.";
        }
      } catch (e) {
        console.error("AI error:", e);
        aiNarrative = "AI narrative could not be generated at this time.";
      }
    }

    return new Response(JSON.stringify({ ...report, aiNarrative }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Report error:", e);
    const status = (e as any)?.message === "Unauthorized" ? 401 : 500;
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildReport(scores: any, answers: any) {
  // Condition risk indicators based on scores
  const conditionRisks = [
    {
      name: "IBS (Irritable Bowel Syndrome)",
      probability: Math.min(95, Math.max(5, Math.round(100 - (scores.digestive_efficiency * 0.4 + scores.gut_brain_balance * 0.3 + scores.food_sensitivity_risk * 0.3)))),
      factors: ["Digestive efficiency", "Gut-brain axis", "Food sensitivities"],
    },
    {
      name: "Leaky Gut Syndrome",
      probability: Math.min(95, Math.max(5, Math.round(100 - (scores.gut_integrity * 0.5 + scores.inflammation_load * 0.3 + scores.food_sensitivity_risk * 0.2)))),
      factors: ["Gut integrity", "Inflammation", "Food sensitivities"],
    },
    {
      name: "Dysbiosis",
      probability: Math.min(95, Math.max(5, Math.round(100 - (scores.microbiome_diversity * 0.5 + scores.digestive_efficiency * 0.3 + scores.gut_integrity * 0.2)))),
      factors: ["Microbiome diversity", "Digestive function", "Gut lining"],
    },
    {
      name: "Candida Overgrowth",
      probability: Math.min(95, Math.max(5, Math.round(100 - (scores.microbiome_diversity * 0.3 + scores.inflammation_load * 0.3 + (answers.dp_sugar || 3) * 8)))),
      factors: ["Sugar intake", "Microbiome balance", "Inflammation"],
    },
    {
      name: "GERD",
      probability: Math.min(95, Math.max(5, Math.round(100 - ((answers.ds_acid_reflux || 3) * 12 + scores.digestive_efficiency * 0.2 + (answers.lf_stress || 3) * 4)))),
      factors: ["Acid reflux frequency", "Digestive function", "Stress"],
    },
  ];

  // Biomarker scores
  const biomarkers = [
    { name: "Gut Integrity Score", score: scores.gut_integrity, description: "Measures the strength of your intestinal barrier" },
    { name: "Microbiome Diversity Score", score: scores.microbiome_diversity, description: "Estimates the diversity of your gut bacteria" },
    { name: "Digestive Efficiency Score", score: scores.digestive_efficiency, description: "How well your digestive system processes food" },
    { name: "Inflammation Load", score: scores.inflammation_load, description: "Level of systemic inflammation originating from the gut" },
    { name: "Food Sensitivity Risk", score: scores.food_sensitivity_risk, description: "Risk of adverse reactions to common food groups" },
    { name: "Gut-Brain Balance", score: scores.gut_brain_balance, description: "Health of the communication between gut and brain" },
  ];

  return {
    overallScore: scores.overall,
    biomarkers,
    conditionRisks,
    scores,
    completedAt: new Date().toISOString(),
  };
}
