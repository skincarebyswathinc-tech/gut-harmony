import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { getScoreLabel, getScoreColor } from '@/lib/assessment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import ShareReportDialog from '@/components/ShareReportDialog';
import {
  Leaf, ArrowLeft, Download, Shield, Activity, Stethoscope,
  Flame, Apple, Brain, AlertTriangle, FileText, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface Biomarker {
  name: string;
  score: number;
  description: string;
}

interface ConditionRisk {
  name: string;
  probability: number;
  factors: string[];
}

interface ReportData {
  overallScore: number;
  biomarkers: Biomarker[];
  conditionRisks: ConditionRisk[];
  scores: Record<string, number>;
  completedAt: string;
  aiNarrative: string;
}

const biomarkerIcons: Record<string, React.ElementType> = {
  'Gut Integrity Score': Shield,
  'Microbiome Diversity Score': Activity,
  'Digestive Efficiency Score': Stethoscope,
  'Inflammation Load': Flame,
  'Food Sensitivity Risk': Apple,
  'Gut-Brain Balance': Brain,
};

const getRiskColor = (prob: number) => {
  if (prob >= 70) return 'text-score-poor';
  if (prob >= 40) return 'text-score-fair';
  return 'text-score-excellent';
};

const getRiskBg = (prob: number) => {
  if (prob >= 70) return 'bg-score-poor';
  if (prob >= 40) return 'bg-score-fair';
  return 'bg-score-excellent';
};

const getRiskLabel = (prob: number) => {
  if (prob >= 70) return 'High Risk';
  if (prob >= 40) return 'Moderate Risk';
  return 'Low Risk';
};

const GutHealthReport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    generateReport();
  }, [user]);

  const generateReport = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-gut-report');
      if (error) throw error;
      setReport(data);
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-medium">Generating your premium gut health report…</p>
          <p className="text-xs text-muted-foreground">Analyzing biomarkers and generating personalized insights</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">No assessment data found. Complete an assessment first.</p>
          <Button onClick={() => navigate('/assessment')}>Take Assessment</Button>
        </div>
      </div>
    );
  }

  const overallStroke = report.overallScore >= 80 ? 'stroke-score-excellent' : report.overallScore >= 60 ? 'stroke-score-good' : report.overallScore >= 40 ? 'stroke-score-fair' : 'stroke-score-poor';
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (report.overallScore / 100) * circumference;

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          nav, .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-break { page-break-before: always; }
        }
      `}</style>

      <div className="min-h-screen bg-background">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto no-print">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
          </Button>
          <Button size="sm" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-1" /> Download PDF
          </Button>
        </nav>

        <div ref={reportRef} className="max-w-5xl mx-auto px-6 pb-16 space-y-8">
          {/* ─── Report Header ─── */}
          <header className="text-center py-8 border-b-2 border-primary/20">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Leaf className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                Gut Health Report
              </h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Comprehensive Assessment • Generated {new Date(report.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              This report is for educational purposes only and does not constitute medical advice.
            </p>
          </header>

          {/* ─── 1. Gut Health Summary ─── */}
          <section>
            <SectionTitle number={1} title="Gut Health Summary" />
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Score ring */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="relative w-36 h-36">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" fill="none" className="stroke-muted" strokeWidth="8" />
                        <circle
                          cx="60" cy="60" r="54" fill="none"
                          className={overallStroke}
                          strokeWidth="8" strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={offset}
                          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-foreground">{report.overallScore}</span>
                        <span className="text-xs text-muted-foreground">/ 100</span>
                      </div>
                    </div>
                    <span className={`mt-2 text-sm font-semibold ${getScoreColor(report.overallScore)}`}>
                      {getScoreLabel(report.overallScore)}
                    </span>
                  </div>
                  {/* Summary text from AI */}
                  <div className="flex-1">
                    {report.aiNarrative && extractSection(report.aiNarrative, 'Gut Health Summary') ? (
                      <div className="prose prose-sm max-w-none text-foreground"
                        dangerouslySetInnerHTML={{ __html: markdownToHtml(extractSection(report.aiNarrative, 'Gut Health Summary')!) }} />
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        Your overall gut health score is <strong className="text-foreground">{report.overallScore}/100</strong>,
                        classified as <strong className={getScoreColor(report.overallScore)}>{getScoreLabel(report.overallScore)}</strong>.
                        {report.overallScore < 60
                          ? ' Multiple areas of your gut health need attention. Review the detailed analysis below for targeted recommendations.'
                          : report.overallScore < 80
                          ? ' Your gut health is on the right track but has room for improvement in specific areas.'
                          : ' Your gut health is in excellent condition. Continue maintaining your current lifestyle habits.'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ─── 2. Gut Biomarker Scores ─── */}
          <section>
            <SectionTitle number={2} title="Gut Biomarker Scores" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.biomarkers.map((bm) => {
                const Icon = biomarkerIcons[bm.name] || Shield;
                return (
                  <Card key={bm.name}>
                    <CardContent className="pt-5 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-accent shrink-0">
                          <Icon className="h-5 w-5 text-accent-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-semibold text-foreground">{bm.name}</h4>
                            <span className={`text-sm font-bold ${getScoreColor(bm.score)}`}>
                              {bm.score}/100
                            </span>
                          </div>
                          <Progress value={bm.score} className="h-2 mb-1.5" />
                          <p className="text-xs text-muted-foreground">{bm.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* ─── 3. Root Cause Analysis ─── */}
          <section className="print-break">
            <SectionTitle number={3} title="Root Cause Analysis" />
            <Card>
              <CardContent className="pt-6">
                {report.aiNarrative && extractSection(report.aiNarrative, 'Root Cause Analysis') ? (
                  <div className="prose prose-sm max-w-none text-foreground"
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(extractSection(report.aiNarrative, 'Root Cause Analysis')!) }} />
                ) : (
                  <p className="text-sm text-muted-foreground">AI analysis unavailable. Please regenerate the report.</p>
                )}
              </CardContent>
            </Card>
          </section>

          {/* ─── 4. Condition Risk Indicators ─── */}
          <section>
            <SectionTitle number={4} title="Condition Risk Indicators" />
            <div className="space-y-3">
              {report.conditionRisks.map((risk) => (
                <Card key={risk.name}>
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <AlertTriangle className={`h-5 w-5 shrink-0 ${getRiskColor(risk.probability)}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="text-sm font-semibold text-foreground">{risk.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              risk.probability >= 70 ? 'bg-destructive/10 text-score-poor' :
                              risk.probability >= 40 ? 'bg-score-fair/10 text-score-fair' :
                              'bg-score-excellent/10 text-score-excellent'
                            }`}>
                              {getRiskLabel(risk.probability)}
                            </span>
                            <span className={`text-sm font-bold ${getRiskColor(risk.probability)}`}>
                              {risk.probability}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${getRiskBg(risk.probability)}`}
                            style={{ width: `${risk.probability}%` }} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5">
                          Contributing factors: {risk.factors.join(' • ')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 italic">
              * Risk probabilities are estimated based on symptom patterns and lifestyle factors. Consult a healthcare professional for clinical diagnosis.
            </p>
          </section>

          {/* ─── 5. Personalized Diet Strategy ─── */}
          <section className="print-break">
            <SectionTitle number={5} title="Personalized Diet Strategy" />
            <Card>
              <CardContent className="pt-6">
                {report.aiNarrative && extractSection(report.aiNarrative, 'Personalized Diet Strategy') ? (
                  <div className="prose prose-sm max-w-none text-foreground"
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(extractSection(report.aiNarrative, 'Personalized Diet Strategy')!) }} />
                ) : (
                  <p className="text-sm text-muted-foreground">AI analysis unavailable. Please regenerate the report.</p>
                )}
              </CardContent>
            </Card>
          </section>

          {/* ─── 6. 30-Day Gut Healing Protocol ─── */}
          <section>
            <SectionTitle number={6} title="30-Day Gut Healing Protocol" />
            <Card>
              <CardContent className="pt-6">
                {report.aiNarrative && extractSection(report.aiNarrative, '30-Day Gut Healing Protocol') ? (
                  <div className="prose prose-sm max-w-none text-foreground"
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(extractSection(report.aiNarrative, '30-Day Gut Healing Protocol')!) }} />
                ) : (
                  <ProtocolFallback scores={report.scores} />
                )}
              </CardContent>
            </Card>
          </section>

          {/* ─── 7. Lifestyle Optimization Plan ─── */}
          <section className="print-break">
            <SectionTitle number={7} title="Lifestyle Optimization Plan" />
            <Card>
              <CardContent className="pt-6">
                {report.aiNarrative && extractSection(report.aiNarrative, 'Lifestyle Optimization Plan') ? (
                  <div className="prose prose-sm max-w-none text-foreground"
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(extractSection(report.aiNarrative, 'Lifestyle Optimization Plan')!) }} />
                ) : (
                  <p className="text-sm text-muted-foreground">AI analysis unavailable. Please regenerate the report.</p>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Footer */}
          <footer className="text-center pt-8 pb-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              This report was generated by your Gut Intelligence Platform based on self-reported data.
              It is not a medical diagnosis. Always consult a qualified healthcare professional.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
};

/* ── Helpers ─── */

const SectionTitle = ({ number, title }: { number: number; title: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
      {number}
    </div>
    <h2 className="text-xl font-display font-bold text-foreground">{title}</h2>
  </div>
);

function extractSection(markdown: string, sectionTitle: string): string | null {
  const regex = new RegExp(`##\\s*${sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?(?=##\\s|$)`, 'i');
  const match = markdown.match(regex);
  if (!match) return null;
  return match[0].replace(/^##\s*[^\n]+\n/, '').trim();
}

function markdownToHtml(md: string): string {
  return md
    .replace(/### (.+)/g, '<h4 class="text-sm font-semibold text-foreground mt-4 mb-2">$1</h4>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\- (.+)$/gm, '<li class="text-sm text-muted-foreground ml-4">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="list-disc space-y-1 mb-3">$&</ul>')
    .replace(/\n\n/g, '<br/>')
    .replace(/\n(?!<)/g, ' ');
}

const ProtocolFallback = ({ scores }: { scores: Record<string, number> }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {[
      { phase: 'Phase 1: Calm Inflammation', days: 'Days 1-7', items: ['Remove processed foods and refined sugar', 'Add turmeric golden milk daily', 'Increase omega-3 rich foods', 'Begin gentle walking (20 min/day)'] },
      { phase: 'Phase 2: Repair Gut Lining', days: 'Days 8-14', items: ['Introduce bone broth or collagen peptides', 'Add L-glutamine rich foods', 'Include zinc-rich foods (pumpkin seeds, oysters)', 'Practice mindful eating at every meal'] },
      { phase: 'Phase 3: Rebuild Microbiome', days: 'Days 15-23', items: ['Introduce fermented foods daily', 'Aim for 30+ plant varieties weekly', 'Add prebiotic fiber sources', 'Gradually increase food diversity'] },
      { phase: 'Phase 4: Optimize Resilience', days: 'Days 24-30', items: ['Establish consistent meal timing', 'Optimize sleep hygiene routine', 'Implement stress management practices', 'Create a sustainable long-term plan'] },
    ].map((p) => (
      <div key={p.phase} className="p-4 rounded-lg border border-border bg-accent/30">
        <h4 className="text-sm font-semibold text-foreground mb-1">{p.phase}</h4>
        <p className="text-xs text-muted-foreground mb-2">{p.days}</p>
        <ul className="space-y-1">
          {p.items.map((item, i) => (
            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

export default GutHealthReport;
