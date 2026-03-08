import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText, Download, RefreshCw, TrendingUp, TrendingDown,
  Minus, AlertTriangle, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface ReportData {
  weekStart: string;
  weekEnd: string;
  daysLogged: number;
  currentScore: number;
  prevScore: number;
  scoreChange: number;
  symptomTrends: { bloating: number; gas: number; reflux: number; discomfort: number };
  lifestylePatterns: {
    avgSleep: number; avgStress: number; avgWater: number;
    avgExercise: number; avgMood: number; avgEnergy: number;
  };
  topTriggers: { category: string; avgSymptoms: number; count: number }[];
  foodLogsCount: number;
}

interface WeeklyReport {
  id: string;
  week_start: string;
  week_end: string;
  report_data: ReportData;
  ai_summary: string | null;
  created_at: string;
}

const categoryLabels: Record<string, string> = {
  high_sugar: 'High Sugar', dairy: 'Dairy', gluten: 'Gluten',
  processed: 'Processed', fried: 'Fried', fermented: 'Fermented',
  high_fiber: 'High Fiber', custom: 'Other',
};

export default function WeeklyReportCard() {
  const { user } = useAuth();
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('weekly_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('week_start', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setReport(data[0] as unknown as WeeklyReport);
        }
        setLoading(false);
      });
  }, [user]);

  const generateReport = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-weekly-report');
      if (error) throw error;
      setReport(data as WeeklyReport);
      toast.success('Weekly report generated!');
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to generate report. Make sure you have daily log entries.');
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;
    const d = report.report_data;
    const lines = [
      `GUT HEALTH WEEKLY REPORT`,
      `Week: ${d.weekStart} to ${d.weekEnd}`,
      `Generated: ${new Date(report.created_at).toLocaleDateString()}`,
      ``,
      `═══ GUT HEALTH SCORE ═══`,
      `Current: ${d.currentScore}/100`,
      `Previous Week: ${d.prevScore}/100`,
      `Change: ${d.scoreChange >= 0 ? '+' : ''}${d.scoreChange}`,
      `Days Logged: ${d.daysLogged}/7`,
      ``,
      `═══ SYMPTOM AVERAGES (0-5) ═══`,
      `Bloating: ${d.symptomTrends.bloating}`,
      `Gas: ${d.symptomTrends.gas}`,
      `Reflux: ${d.symptomTrends.reflux}`,
      `Discomfort: ${d.symptomTrends.discomfort}`,
      ``,
      `═══ LIFESTYLE PATTERNS ═══`,
      `Sleep: ${d.lifestylePatterns.avgSleep} hrs/night`,
      `Stress: ${d.lifestylePatterns.avgStress}/5`,
      `Water: ${d.lifestylePatterns.avgWater} glasses/day`,
      `Exercise: ${d.lifestylePatterns.avgExercise} min/day`,
      `Mood: ${d.lifestylePatterns.avgMood}/5`,
      `Energy: ${d.lifestylePatterns.avgEnergy}/5`,
      ``,
      `═══ TOP FOOD TRIGGERS ═══`,
      ...(d.topTriggers.length > 0
        ? d.topTriggers.map(
            (t) => `${categoryLabels[t.category] || t.category}: avg symptom ${t.avgSymptoms} (${t.count} entries)`,
          )
        : ['No food data this week']),
      ``,
      `═══ AI SUMMARY ═══`,
      report.ai_summary || 'No AI summary available.',
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gut-report-${d.weekStart}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return null;

  const d = report?.report_data;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Weekly Gut Report
          </CardTitle>
          <div className="flex gap-2">
            {report && (
              <Button variant="outline" size="sm" onClick={downloadReport}>
                <Download className="h-3.5 w-3.5 mr-1" /> Download
              </Button>
            )}
            <Button size="sm" onClick={generateReport} disabled={generating}>
              {generating ? (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
              )}
              {report ? 'Refresh' : 'Generate'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!report ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No report yet. Click "Generate" to create your first weekly gut health report.
          </p>
        ) : d ? (
          <div className="space-y-4">
            {/* Score summary row */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                <span className="text-2xl font-bold text-foreground">{d.currentScore}</span>
                <span className="text-xs text-muted-foreground">/100</span>
                <div className="flex items-center gap-0.5 ml-1">
                  {d.scoreChange > 0 ? (
                    <TrendingUp className="h-4 w-4 text-score-excellent" />
                  ) : d.scoreChange < 0 ? (
                    <TrendingDown className="h-4 w-4 text-score-poor" />
                  ) : (
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      d.scoreChange > 0
                        ? 'text-score-excellent'
                        : d.scoreChange < 0
                        ? 'text-score-poor'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {d.scoreChange >= 0 ? '+' : ''}{d.scoreChange}
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {d.weekStart} → {d.weekEnd} · {d.daysLogged}/7 days logged
              </div>
            </div>

            {/* Symptom bars */}
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(d.symptomTrends).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground capitalize w-20">{key}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        val >= 3 ? 'bg-score-poor' : val >= 1.5 ? 'bg-score-fair' : 'bg-score-excellent'
                      }`}
                      style={{ width: `${(val / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground w-6">{val}</span>
                </div>
              ))}
            </div>

            {/* Top triggers */}
            {d.topTriggers.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Top Triggers</span>
                <div className="flex flex-wrap gap-1.5">
                  {d.topTriggers.slice(0, 3).map((t) => (
                    <span
                      key={t.category}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-destructive/10 text-destructive border border-destructive/20"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      {categoryLabels[t.category] || t.category}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Summary */}
            {report.ai_summary && (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs px-0 h-auto text-primary"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? 'Hide' : 'Show'} AI Summary
                </Button>
                {expanded && (
                  <div className="mt-2 p-3 bg-muted/50 rounded-lg text-sm text-foreground whitespace-pre-line leading-relaxed">
                    {report.ai_summary}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
