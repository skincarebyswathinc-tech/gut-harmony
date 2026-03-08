import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { computeProgress, type DailyLogEntry, type ProgressData } from '@/lib/gut-progress-engine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame, Award, Trophy } from 'lucide-react';

export default function GutProgressCard() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<DailyLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('daily_gut_logs')
      .select('log_date, bloating, gas, acid_reflux, abdominal_discomfort, water_intake, sleep_hours, stress_level, exercise_minutes, energy_level, mood, stool_type')
      .eq('user_id', user.id)
      .order('log_date', { ascending: true })
      .then(({ data }) => {
        if (data) setLogs(data as unknown as DailyLogEntry[]);
        setLoading(false);
      });
  }, [user]);

  const progress = useMemo<ProgressData | null>(() => {
    if (logs.length === 0) return null;
    return computeProgress(logs);
  }, [logs]);

  if (loading) return null;
  if (!progress) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" /> Streaks & Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Start logging daily to track your streaks and unlock milestones! 🌱
          </p>
        </CardContent>
      </Card>
    );
  }

  const activeStreaks = progress.streaks.filter(s => s.currentDays > 0);
  const inactiveStreaks = progress.streaks.filter(s => s.currentDays === 0);
  const achievedMilestones = progress.milestones.filter(m => m.achieved);
  const pendingMilestones = progress.milestones.filter(m => !m.achieved).slice(0, 3);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" /> Streaks & Milestones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Motivational banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center">
          <p className="text-sm font-medium text-foreground">{progress.motivationalMessage}</p>
        </div>

        {/* Active Streaks */}
        {activeStreaks.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Flame className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Active Streaks</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {activeStreaks.map(s => (
                <div
                  key={s.key}
                  className="flex items-center gap-2 bg-primary/5 border border-primary/15 rounded-lg px-3 py-2"
                >
                  <span className="text-xl">{s.icon}</span>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-foreground">{s.currentDays}</span>
                      <span className="text-xs text-muted-foreground">days</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inactive streaks (compact) */}
        {inactiveStreaks.length > 0 && (
          <div>
            <span className="text-xs text-muted-foreground">
              Start a streak: {inactiveStreaks.map(s => `${s.icon} ${s.label}`).join(' · ')}
            </span>
          </div>
        )}

        {/* Achieved milestones */}
        {achievedMilestones.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Unlocked</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {achievedMilestones.map(m => (
                <div
                  key={m.key}
                  className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1"
                >
                  <span>{m.icon}</span>
                  <span className="text-xs font-medium text-foreground">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending milestones with progress */}
        {pendingMilestones.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Next Milestones</span>
            {pendingMilestones.map(m => (
              <div key={m.key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground flex items-center gap-1">
                    <span>{m.icon}</span> {m.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{m.progress}%</span>
                </div>
                <Progress value={m.progress} className="h-1.5" />
                <p className="text-xs text-muted-foreground">{m.description}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
