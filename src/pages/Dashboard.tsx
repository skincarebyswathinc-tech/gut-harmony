import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  sections, ScoreResult, getScoreLabel, getScoreColor, getRecommendations,
  assessmentQuestions,
} from '@/lib/assessment';
import { computeCorrelations, formatInsight, type FoodLog, type Correlation } from '@/lib/food-correlations';
import { generateInsights, type GutInsight, type DailyLog } from '@/lib/gut-insights';
import WeeklyReportCard from '@/components/WeeklyReportCard';
import GutProgressCard from '@/components/GutProgressCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Leaf, User, LogOut, ArrowRight, Shield, Activity,
  Stethoscope, Flame, Apple, Brain, RefreshCw, TrendingDown, Zap,
  ClipboardList, UtensilsCrossed, AlertTriangle, TrendingUp, Lightbulb, FileText,
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Tooltip,
} from 'recharts';

/* ── Score meta ────────────────────────────────────── */

const compositeScoresMeta = [
  { key: 'gut_integrity', label: 'Gut Integrity', icon: Shield },
  { key: 'microbiome_diversity', label: 'Microbiome Diversity', icon: Activity },
  { key: 'digestive_efficiency', label: 'Digestive Efficiency', icon: Stethoscope },
  { key: 'inflammation_load', label: 'Inflammation Load', icon: Flame },
  { key: 'food_sensitivity_risk', label: 'Food Sensitivity', icon: Apple },
  { key: 'gut_brain_balance', label: 'Gut-Brain Balance', icon: Brain },
];

/* ── Key drivers logic ─────────────────────────────── */

interface Driver {
  label: string;
  impact: 'negative' | 'positive';
  value: number;
}

function getKeyDrivers(answers: Record<string, number>): Driver[] {
  const driverMap: { id: string; label: string }[] = [
    { id: 'lf_stress', label: 'Stress Level' },
    { id: 'lf_sleep_quality', label: 'Sleep Quality' },
    { id: 'dp_sugar', label: 'Sugar Consumption' },
    { id: 'dp_fiber', label: 'Fiber Intake' },
    { id: 'dp_fermented', label: 'Fermented Foods' },
    { id: 'lf_water', label: 'Water Intake' },
    { id: 'lf_alcohol', label: 'Alcohol Intake' },
    { id: 'dp_processed_food', label: 'Processed Food' },
    { id: 'lf_exercise', label: 'Exercise' },
    { id: 'lf_antibiotics_recent', label: 'Recent Antibiotics' },
  ];

  return driverMap
    .filter(d => answers[d.id] !== undefined)
    .map(d => ({
      label: d.label,
      value: answers[d.id],
      impact: answers[d.id] <= 3 ? 'negative' as const : 'positive' as const,
    }))
    .sort((a, b) => a.value - b.value)
    .slice(0, 6);
}

/* ── Score ring ────────────────────────────────────── */

const ScoreRing = ({ score, label, icon: Icon }: { score: number; label: string; icon: React.ElementType }) => {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  const getStrokeColor = (s: number) => {
    if (s >= 80) return 'stroke-score-excellent';
    if (s >= 60) return 'stroke-score-good';
    if (s >= 40) return 'stroke-score-fair';
    return 'stroke-score-poor';
  };

  return (
    <div className="flex flex-col items-center bg-card border border-border rounded-lg p-4 transition-shadow hover:shadow-md">
      <div className="relative w-20 h-20 md:w-24 md:h-24 mb-2">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" className="stroke-muted" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            className={getStrokeColor(score)}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg md:text-xl font-bold text-foreground">{score}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 mb-0.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs md:text-sm font-medium text-foreground">{label}</span>
      </div>
      <span className={`text-xs font-medium ${getScoreColor(score)}`}>{getScoreLabel(score)}</span>
    </div>
  );
};

/* ── Dashboard ─────────────────────────────────────── */

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [scores, setScores] = useState<ScoreResult | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [foodCorrelations, setFoodCorrelations] = useState<Correlation[]>([]);
  const [gutInsights, setGutInsights] = useState<GutInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('assessments')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setScores(data[0].scores as unknown as ScoreResult);
          setAnswers(data[0].answers as unknown as Record<string, number>);
          setCompletedAt(data[0].completed_at);
        }
        setLoading(false);
      });

    // food correlations
    supabase
      .from('food_logs')
      .select('food_category, bloating, gas, reflux, fatigue')
      .eq('user_id', user.id)
      .then(({ data: foodData }) => {
        if (foodData && foodData.length > 0) {
          setFoodCorrelations(computeCorrelations(foodData as unknown as FoodLog[]));
        }
      });

    // gut intelligence insights
    supabase
      .from('daily_gut_logs')
      .select('bloating, gas, acid_reflux, abdominal_discomfort, stool_type, sleep_hours, stress_level, water_intake, exercise_minutes, energy_level, mood')
      .eq('user_id', user.id)
      .order('log_date', { ascending: false })
      .limit(90)
      .then(({ data: logData }) => {
        if (logData && logData.length > 0) {
          setGutInsights(generateInsights(logData as unknown as DailyLog[]));
        }
      });
  }, [user]);

  const recommendations = scores ? getRecommendations(scores).slice(0, 5) : [];
  const drivers = useMemo(() => getKeyDrivers(answers), [answers]);

  const radarData = scores
    ? compositeScoresMeta.map(m => ({
        metric: m.label,
        score: (scores as any)[m.key] ?? 0,
        fullMark: 100,
      }))
    : [];

  const canRetake = useMemo(() => {
    if (!completedAt) return true;
    const diff = Date.now() - new Date(completedAt).getTime();
    return diff >= 30 * 24 * 60 * 60 * 1000;
  }, [completedAt]);

  const daysUntilRetake = useMemo(() => {
    if (!completedAt) return 0;
    const diff = 30 - Math.floor((Date.now() - new Date(completedAt).getTime()) / (24 * 60 * 60 * 1000));
    return Math.max(0, diff);
  }, [completedAt]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="text-lg font-display font-semibold text-foreground">My Gut Health</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/daily-log')}>
            <ClipboardList className="h-4 w-4 mr-1" /> Daily Log
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/food-tracker')}>
            <UtensilsCrossed className="h-4 w-4 mr-1" /> Food
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/gut-progress')}>
            <TrendingUp className="h-4 w-4 mr-1" /> Progress
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/gut-report')}>
            <FileText className="h-4 w-4 mr-1" /> Report
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
            <User className="h-4 w-4 mr-1" /> Profile
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-1" /> Sign Out
          </Button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pb-16 animate-fade-in">
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading your results…</div>
        ) : scores ? (
          <div className="space-y-8">
            {/* ─── 1. Gut Health Score Card ─── */}
            <section>
              <div className="text-center mb-6">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                  My Gut Health
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">Your personalized gut health overview</p>
              </div>

              {/* Overall ring */}
              <div className="flex justify-center mb-8">
                <div className="flex flex-col items-center">
                  <div className="relative w-36 h-36">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" className="stroke-muted" strokeWidth="6" />
                      <circle
                        cx="50" cy="50" r="42" fill="none"
                        className={scores.overall >= 80 ? 'stroke-score-excellent' : scores.overall >= 60 ? 'stroke-score-good' : scores.overall >= 40 ? 'stroke-score-fair' : 'stroke-score-poor'}
                        strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 42}
                        strokeDashoffset={2 * Math.PI * 42 - (scores.overall / 100) * 2 * Math.PI * 42}
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-foreground">{scores.overall}</span>
                      <span className="text-xs text-muted-foreground">Overall</span>
                    </div>
                  </div>
                  <span className={`mt-2 text-sm font-semibold ${getScoreColor(scores.overall)}`}>
                    {getScoreLabel(scores.overall)}
                  </span>
                </div>
              </div>

              {/* Composite score rings */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {compositeScoresMeta.map(cs => (
                  <ScoreRing
                    key={cs.key}
                    score={(scores as any)[cs.key] ?? 0}
                    label={cs.label}
                    icon={cs.icon}
                  />
                ))}
              </div>
            </section>

            {/* ─── 2. Gut Radar Chart ─── */}
            <section>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-display">Gut Health Radar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-72 md:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis
                          dataKey="metric"
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                          name="Score"
                          dataKey="score"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                        <Tooltip
                          contentStyle={{
                            background: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 'var(--radius)',
                            fontSize: 13,
                          }}
                          formatter={(value: number) => [`${value}/100`, 'Score']}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* ─── Streaks & Milestones ─── */}
            <section>
              <GutProgressCard />
            </section>

            {/* ─── 3. Key Gut Drivers ─── */}
            <section>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Key Gut Drivers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-4">
                    Top lifestyle triggers affecting your gut health
                  </p>
                  <div className="space-y-3">
                    {drivers.map(d => (
                      <div key={d.label} className="flex items-center gap-3">
                        <TrendingDown
                          className={`h-4 w-4 flex-shrink-0 ${
                            d.impact === 'negative' ? 'text-score-poor rotate-0' : 'text-score-excellent rotate-180'
                          }`}
                        />
                        <span className="text-sm text-foreground flex-1">{d.label}</span>
                        <div className="w-28 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              d.value >= 4
                                ? 'bg-score-excellent'
                                : d.value === 3
                                ? 'bg-score-fair'
                                : 'bg-score-poor'
                            }`}
                            style={{ width: `${(d.value / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground w-8 text-right">
                          {d.value}/5
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* ─── 4. Recommendations ─── */}
            <section>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-display">Personalized Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* ─── Gut Intelligence Insights ─── */}
            {gutInsights.length > 0 && (
              <section>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-display flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-primary" /> Gut Intelligence Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {gutInsights.map((insight, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-2 p-3 rounded-lg border ${
                          insight.type === 'warning'
                            ? 'bg-destructive/5 border-destructive/20'
                            : 'bg-primary/5 border-primary/20'
                        }`}
                      >
                        {insight.type === 'warning' ? (
                          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        )}
                        <p className="text-sm text-foreground">{insight.message}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>
            )}

            {/* ─── Weekly Report ─── */}
            <section>
              <WeeklyReportCard />
            </section>

            {/* ─── Food Trigger Insights ─── */}
            {foodCorrelations.length > 0 && (
              <section>
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-xl font-display flex items-center gap-2">
                      <UtensilsCrossed className="h-5 w-5 text-primary" /> Food Triggers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {foodCorrelations.slice(0, 5).map((c, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-2 p-3 rounded-lg border ${
                          c.direction === 'higher'
                            ? 'bg-destructive/5 border-destructive/20'
                            : 'bg-primary/5 border-primary/20'
                        }`}
                      >
                        {c.direction === 'higher' ? (
                          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        )}
                        <p className="text-sm text-foreground">{formatInsight(c)}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>
            )}

            {/* ─── 5. Reassessment ─── */}
            <section className="text-center pt-2">
              {canRetake ? (
                <Button onClick={() => navigate('/assessment')} size="lg">
                  <RefreshCw className="mr-2 h-4 w-4" /> Retake Assessment
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button disabled size="lg" variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" /> Retake Available in {daysUntilRetake} Days
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Reassessments are available every 30 days for accurate tracking.
                  </p>
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-display font-bold text-foreground mb-4">No assessment yet</h2>
            <p className="text-muted-foreground mb-6">
              Complete your first gut health assessment to see your scores and recommendations.
            </p>
            <Button onClick={() => navigate('/assessment')}>
              Start Assessment <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
