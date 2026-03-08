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

    // Determine the week range (last 7 days)
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setHours(0, 0, 0, 0);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 7);

    const fmt = (d: Date) => d.toISOString().split("T")[0];

    // Fetch daily gut logs for the week
    const { data: logs } = await supabase
      .from("daily_gut_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", fmt(weekStart))
      .lte("log_date", fmt(weekEnd))
      .order("log_date", { ascending: true });

    // Fetch food logs for the week
    const { data: foodLogs } = await supabase
      .from("food_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", fmt(weekStart))
      .lte("log_date", fmt(weekEnd));

    // Fetch previous week logs for comparison
    const prevStart = new Date(weekStart);
    prevStart.setDate(prevStart.getDate() - 7);
    const { data: prevLogs } = await supabase
      .from("daily_gut_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", fmt(prevStart))
      .lt("log_date", fmt(weekStart));

    // Compute stats
    const gutLogs = logs || [];
    const prevGutLogs = prevLogs || [];
    const foods = foodLogs || [];

    const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    const symptomScore = (l: any) =>
      100 - ((l.bloating + l.gas + l.acid_reflux + l.abdominal_discomfort) / 20) * 100;

    const currentScore = Math.round(avg(gutLogs.map(symptomScore)));
    const prevScore = Math.round(avg(prevGutLogs.map(symptomScore)));
    const scoreChange = currentScore - prevScore;

    const symptomTrends = {
      bloating: Math.round(avg(gutLogs.map((l: any) => l.bloating)) * 10) / 10,
      gas: Math.round(avg(gutLogs.map((l: any) => l.gas)) * 10) / 10,
      reflux: Math.round(avg(gutLogs.map((l: any) => l.acid_reflux)) * 10) / 10,
      discomfort: Math.round(avg(gutLogs.map((l: any) => l.abdominal_discomfort)) * 10) / 10,
    };

    const lifestylePatterns = {
      avgSleep: Math.round(avg(gutLogs.filter((l: any) => l.sleep_hours).map((l: any) => l.sleep_hours)) * 10) / 10,
      avgStress: Math.round(avg(gutLogs.map((l: any) => l.stress_level)) * 10) / 10,
      avgWater: Math.round(avg(gutLogs.filter((l: any) => l.water_intake).map((l: any) => l.water_intake)) * 10) / 10,
      avgExercise: Math.round(avg(gutLogs.filter((l: any) => l.exercise_minutes).map((l: any) => l.exercise_minutes))),
      avgMood: Math.round(avg(gutLogs.map((l: any) => l.mood)) * 10) / 10,
      avgEnergy: Math.round(avg(gutLogs.map((l: any) => l.energy_level)) * 10) / 10,
    };

    // Food triggers
    const triggerCounts: Record<string, { count: number; totalSymptoms: number }> = {};
    for (const f of foods) {
      const cat = (f as any).food_category;
      if (!triggerCounts[cat]) triggerCounts[cat] = { count: 0, totalSymptoms: 0 };
      triggerCounts[cat].count++;
      triggerCounts[cat].totalSymptoms += (f as any).bloating + (f as any).gas + (f as any).reflux + (f as any).fatigue;
    }
    const topTriggers = Object.entries(triggerCounts)
      .map(([cat, v]) => ({ category: cat, avgSymptoms: Math.round((v.totalSymptoms / v.count) * 10) / 10, count: v.count }))
      .sort((a, b) => b.avgSymptoms - a.avgSymptoms)
      .slice(0, 5);

    const reportData = {
      weekStart: fmt(weekStart),
      weekEnd: fmt(weekEnd),
      daysLogged: gutLogs.length,
      currentScore,
      prevScore,
      scoreChange,
      symptomTrends,
      lifestylePatterns,
      topTriggers,
      foodLogsCount: foods.length,
    };

    // Generate AI summary
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let aiSummary = "";

    if (LOVABLE_API_KEY && gutLogs.length > 0) {
      const prompt = `You are a gut health analyst. Based on this weekly data, write a concise, friendly weekly gut health report (max 300 words). Use bullet points for clarity. Include: score change, key symptom observations, lifestyle patterns, food triggers, and 3 actionable recommendations.

Data:
- Week: ${reportData.weekStart} to ${reportData.weekEnd}
- Days logged: ${reportData.daysLogged}/7
- Gut Health Score: ${currentScore}/100 (${scoreChange >= 0 ? "+" : ""}${scoreChange} vs last week)
- Avg Symptoms (0-5): Bloating ${symptomTrends.bloating}, Gas ${symptomTrends.gas}, Reflux ${symptomTrends.reflux}, Discomfort ${symptomTrends.discomfort}
- Lifestyle: Sleep ${lifestylePatterns.avgSleep}h, Stress ${lifestylePatterns.avgStress}/5, Water ${lifestylePatterns.avgWater} glasses, Exercise ${lifestylePatterns.avgExercise} min, Mood ${lifestylePatterns.avgMood}/5
- Top food triggers: ${topTriggers.map(t => `${t.category} (avg symptom: ${t.avgSymptoms})`).join(", ") || "No food data"}`;

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
              { role: "system", content: "You are a professional gut health analyst. Write reports that are warm, encouraging, and actionable. Use markdown formatting." },
              { role: "user", content: prompt },
            ],
            stream: false,
          }),
        });

        if (aiResp.ok) {
          const aiData = await aiResp.json();
          aiSummary = aiData.choices?.[0]?.message?.content || "";
        } else if (aiResp.status === 429) {
          aiSummary = "AI summary temporarily unavailable due to rate limits. Please try again later.";
        } else if (aiResp.status === 402) {
          aiSummary = "AI summary unavailable. Please check your workspace credits.";
        }
      } catch (e) {
        console.error("AI summary error:", e);
        aiSummary = "AI summary could not be generated at this time.";
      }
    }

    // Upsert report
    const { data: report, error: upsertError } = await supabase
      .from("weekly_reports")
      .upsert(
        {
          user_id: user.id,
          week_start: fmt(weekStart),
          week_end: fmt(weekEnd),
          report_data: reportData,
          ai_summary: aiSummary,
        },
        { onConflict: "user_id,week_start" }
      )
      .select()
      .single();

    if (upsertError) throw upsertError;

    return new Response(JSON.stringify(report), {
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
