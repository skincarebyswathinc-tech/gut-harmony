import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Leaf, TrendingUp, Activity, Droplets,
  Moon, UtensilsCrossed, AlertTriangle,
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ScatterChart, Scatter, ZAxis, Cell,
} from 'recharts';

/* ── Types ────────────────────────────────────────────── */
interface DailyLog {
  log_date: string;
  bloating: number;
  gas: number;
  acid_reflux: number;
  abdominal_discomfort: number;
  stool_type: number | null;
  stool_frequency: number | null;
  sleep_hours: number | null;
  stress_level: number;
  energy_level: number;
  mood: number;
  water_intake: number | null;
  exercise_minutes: number | null;
}

interface FoodLog {
  food_category: string;
  bloating: number;
  gas: number;
  reflux: number;
  fatigue: number;
}

/* ── Helpers ──────────────────────────────────────────── */
const fmt = (d: string) => {
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const catLabels: Record<string, string> = {
  high_sugar: 'Sugar', dairy: 'Dairy', gluten: 'Gluten',
  processed: 'Processed', fried: 'Fried', fermented: 'Fermented',
  high_fiber: 'Fiber', custom: 'Other',
};

const chartColors = {
  primary: 'hsl(152, 45%, 38%)',
  bloating: 'hsl(0, 72%, 51%)',
  gas: 'hsl(38, 80%, 50%)',
  reflux: 'hsl(270, 50%, 55%)',
  discomfort: 'hsl(200, 60%, 50%)',
  sleep: 'hsl(220, 60%, 55%)',
  stress: 'hsl(0, 60%, 55%)',
  energy: 'hsl(45, 80%, 50%)',
  mood: 'hsl(152, 45%, 45%)',
  stool: 'hsl(30, 50%, 50%)',
};

/* ── Component ────────────────────────────────────────── */
const GutProgress = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase
        .from('daily_gut_logs')
        .select('log_date,bloating,gas,acid_reflux,abdominal_discomfort,stool_type,stool_frequency,sleep_hours,stress_level,energy_level,mood,water_intake,exercise_minutes')
        .eq('user_id', user.id)
        .order('log_date', { ascending: true }),
      supabase
        .from('food_logs')
        .select('food_category,bloating,gas,reflux,fatigue')
        .eq('user_id', user.id),
    ]).then(([{ data: dl }, { data: fl }]) => {
      if (dl) setDailyLogs(dl as unknown as DailyLog[]);
      if (fl) setFoodLogs(fl as unknown as FoodLog[]);
      setLoading(false);
    });
  }, [user]);

  /* 1. Gut health score trend — composite daily score (100 minus symptom severity) */
  const scoreTrend = useMemo(() =>
    dailyLogs.map((d) => {
      const symptomSum = d.bloating + d.gas + d.acid_reflux + d.abdominal_discomfort;
      const score = Math.max(0, Math.round(100 - (symptomSum / 20) * 100));
      return { date: fmt(d.log_date), score };
    }), [dailyLogs]);

  /* 2. Symptom trends */
  const symptomTrend = useMemo(() =>
    dailyLogs.map((d) => ({
      date: fmt(d.log_date),
      Bloating: d.bloating,
      Gas: d.gas,
      Reflux: d.acid_reflux,
      Discomfort: d.abdominal_discomfort,
    })), [dailyLogs]);

  /* 3. Stool health */
  const stoolTrend = useMemo(() =>
    dailyLogs
      .filter((d) => d.stool_type !== null)
      .map((d) => ({
        date: fmt(d.log_date),
        type: d.stool_type,
        frequency: d.stool_frequency ?? 1,
      })), [dailyLogs]);

  /* 4. Lifestyle impact */
  const lifestyleTrend = useMemo(() =>
    dailyLogs.map((d) => {
      const symptoms = d.bloating + d.gas + d.acid_reflux + d.abdominal_discomfort;
      return {
        date: fmt(d.log_date),
        Sleep: Number(d.sleep_hours ?? 0),
        Stress: d.stress_level,
        Symptoms: symptoms,
        Energy: d.energy_level,
        Mood: d.mood,
      };
    }), [dailyLogs]);

  /* 5. Food trigger heatmap */
  const heatmapData = useMemo(() => {
    const cats = [...new Set(foodLogs.map((f) => f.food_category))];
    const symptoms = ['bloating', 'gas', 'reflux', 'fatigue'] as const;

    return cats.flatMap((cat) => {
      const catLogs = foodLogs.filter((f) => f.food_category === cat);
      return symptoms.map((s) => {
        const avg = catLogs.reduce((sum, l) => sum + l[s], 0) / catLogs.length;
        return {
          category: catLabels[cat] ?? cat,
          symptom: s.charAt(0).toUpperCase() + s.slice(1),
          value: Math.round(avg * 100) / 100,
          count: catLogs.length,
        };
      });
    });
  }, [foodLogs]);

  const hasData = dailyLogs.length > 0;
  const hasFoodData = foodLogs.length > 0;

  const tooltipStyle = {
    contentStyle: {
      background: 'hsl(40, 25%, 96%)',
      border: '1px solid hsl(40, 20%, 88%)',
      borderRadius: '0.5rem',
      fontSize: '0.75rem',
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="font-display font-bold text-foreground">Gut Progress</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {dailyLogs.length} day{dailyLogs.length !== 1 ? 's' : ''} logged
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading analytics…</div>
        ) : !hasData ? (
          <div className="text-center py-20">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-display font-bold text-foreground mb-2">No data yet</h2>
            <p className="text-muted-foreground mb-6">Start logging your daily gut health to see trends.</p>
            <Button onClick={() => navigate('/daily-log')}>Log Today</Button>
          </div>
        ) : (
          <>
            {/* 1. Gut Health Score Trend */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-primary" /> Gut Health Score Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={scoreTrend}>
                      <defs>
                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 20%, 88%)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(150, 8%, 50%)" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(150, 8%, 50%)" />
                      <Tooltip {...tooltipStyle} />
                      <Area
                        type="monotone" dataKey="score" name="Score"
                        stroke={chartColors.primary} fill="url(#scoreGrad)"
                        strokeWidth={2} dot={{ r: 3, fill: chartColors.primary }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* 2. Symptom Trends */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" /> Symptom Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={symptomTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 20%, 88%)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(150, 8%, 50%)" />
                      <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} stroke="hsl(150, 8%, 50%)" />
                      <Tooltip {...tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                      <Line type="monotone" dataKey="Bloating" stroke={chartColors.bloating} strokeWidth={2} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="Gas" stroke={chartColors.gas} strokeWidth={2} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="Reflux" stroke={chartColors.reflux} strokeWidth={2} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="Discomfort" stroke={chartColors.discomfort} strokeWidth={2} dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* 3. Stool Health */}
            {stoolTrend.length > 0 && (
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-primary" /> Stool Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stoolTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 20%, 88%)" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(150, 8%, 50%)" />
                        <YAxis domain={[0, 7]} ticks={[1, 2, 3, 4, 5, 6, 7]} tick={{ fontSize: 11 }} stroke="hsl(150, 8%, 50%)" label={{ value: 'Bristol Type', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: 'hsl(150, 8%, 50%)' } }} />
                        <Tooltip {...tooltipStyle} />
                        <Bar dataKey="type" name="Stool Type" radius={[4, 4, 0, 0]}>
                          {stoolTrend.map((entry, i) => {
                            const t = entry.type ?? 4;
                            const color = t >= 3 && t <= 5 ? chartColors.primary : t <= 2 ? chartColors.bloating : chartColors.gas;
                            return <Cell key={i} fill={color} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Green = healthy range (types 3–5) · Red = constipation · Orange = loose
                  </p>
                </CardContent>
              </Card>
            )}

            {/* 4. Lifestyle Impact */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <Moon className="h-5 w-5 text-primary" /> Lifestyle Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lifestyleTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 20%, 88%)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(150, 8%, 50%)" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(150, 8%, 50%)" />
                      <Tooltip {...tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                      <Line type="monotone" dataKey="Sleep" stroke={chartColors.sleep} strokeWidth={2} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="Stress" stroke={chartColors.stress} strokeWidth={2} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="Symptoms" stroke={chartColors.bloating} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="Energy" stroke={chartColors.energy} strokeWidth={2} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="Mood" stroke={chartColors.mood} strokeWidth={2} dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* 5. Food Trigger Heatmap */}
            {hasFoodData && heatmapData.length > 0 && (
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <UtensilsCrossed className="h-5 w-5 text-primary" /> Food Trigger Heatmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <HeatmapGrid data={heatmapData} />
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

/* ── Heatmap Grid ─────────────────────────────────────── */
function HeatmapGrid({ data }: { data: { category: string; symptom: string; value: number; count: number }[] }) {
  const categories = [...new Set(data.map((d) => d.category))];
  const symptoms = [...new Set(data.map((d) => d.symptom))];

  const getColor = (val: number) => {
    if (val >= 2) return 'bg-destructive/70 text-destructive-foreground';
    if (val >= 1.2) return 'bg-destructive/40 text-foreground';
    if (val >= 0.5) return 'bg-accent text-accent-foreground';
    return 'bg-primary/10 text-muted-foreground';
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[400px]">
        {/* Header */}
        <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: `120px repeat(${symptoms.length}, 1fr)` }}>
          <div />
          {symptoms.map((s) => (
            <div key={s} className="text-xs font-medium text-muted-foreground text-center py-1">{s}</div>
          ))}
        </div>
        {/* Rows */}
        {categories.map((cat) => (
          <div key={cat} className="grid gap-1 mb-1" style={{ gridTemplateColumns: `120px repeat(${symptoms.length}, 1fr)` }}>
            <div className="text-xs font-medium text-foreground flex items-center">{cat}</div>
            {symptoms.map((s) => {
              const cell = data.find((d) => d.category === cat && d.symptom === s);
              const val = cell?.value ?? 0;
              return (
                <div
                  key={s}
                  className={`rounded-md text-center py-2.5 text-xs font-semibold transition-colors ${getColor(val)}`}
                  title={`${cat} → ${s}: avg ${val} (${cell?.count ?? 0} entries)`}
                >
                  {val.toFixed(1)}
                </div>
              );
            })}
          </div>
        ))}
        <p className="text-[10px] text-muted-foreground mt-2">
          Values show average symptom severity (0–3). Darker = stronger trigger.
        </p>
      </div>
    </div>
  );
}

export default GutProgress;
