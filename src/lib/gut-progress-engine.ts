/**
 * Gut Health Progress Engine
 * Computes streaks, milestones, and badges from daily gut logs.
 */

export interface DailyLogEntry {
  log_date: string;
  bloating: number;
  gas: number;
  acid_reflux: number;
  abdominal_discomfort: number;
  water_intake: number | null;
  sleep_hours: number | null;
  stress_level: number;
  exercise_minutes: number | null;
  energy_level: number;
  mood: number;
  stool_type: number | null;
}

export interface Streak {
  key: string;
  label: string;
  description: string;
  currentDays: number;
  bestDays: number;
  icon: string; // emoji
  active: boolean;
}

export interface Milestone {
  key: string;
  label: string;
  description: string;
  requiredDays: number;
  achieved: boolean;
  progress: number; // 0–100
  icon: string;
  motivationalMessage: string;
}

export interface ProgressData {
  streaks: Streak[];
  milestones: Milestone[];
  motivationalMessage: string;
}

function consecutiveDaysFromEnd(dates: string[], predicate: (d: string, logs: Map<string, DailyLogEntry>) => boolean, logMap: Map<string, DailyLogEntry>): { current: number; best: number } {
  if (dates.length === 0) return { current: 0, best: 0 };

  let current = 0;
  let best = 0;
  let streak = 0;

  // Walk backwards from most recent
  const sorted = [...dates].sort();
  
  // Check if most recent is today or yesterday for "active" streak
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  // Calculate all streaks
  let prevDate: string | null = null;
  for (const date of sorted) {
    if (predicate(date, logMap)) {
      if (prevDate) {
        const diff = (new Date(date).getTime() - new Date(prevDate).getTime()) / 86400000;
        if (diff === 1) {
          streak++;
        } else {
          best = Math.max(best, streak);
          streak = 1;
        }
      } else {
        streak = 1;
      }
      prevDate = date;
    } else {
      best = Math.max(best, streak);
      streak = 0;
      prevDate = null;
    }
  }
  best = Math.max(best, streak);

  // Current streak: count backwards from latest qualifying date
  current = 0;
  const reverseSorted = [...sorted].reverse();
  // Only count as current if the last entry is today or yesterday
  if (reverseSorted.length > 0 && (reverseSorted[0] === today || reverseSorted[0] === yesterday)) {
    for (let i = 0; i < reverseSorted.length; i++) {
      if (!predicate(reverseSorted[i], logMap)) break;
      if (i > 0) {
        const diff = (new Date(reverseSorted[i - 1]).getTime() - new Date(reverseSorted[i]).getTime()) / 86400000;
        if (diff !== 1) break;
      }
      current++;
    }
  }

  return { current, best };
}

export function computeProgress(logs: DailyLogEntry[]): ProgressData {
  const logMap = new Map<string, DailyLogEntry>();
  const dates: string[] = [];

  for (const l of logs) {
    logMap.set(l.log_date, l);
    dates.push(l.log_date);
  }

  const sortedDates = [...new Set(dates)].sort();

  // ── Tracking streak (any log entry) ──
  const tracking = consecutiveDaysFromEnd(
    sortedDates,
    () => true,
    logMap,
  );

  // ── Hydration streak (water >= 6 glasses) ──
  const hydration = consecutiveDaysFromEnd(
    sortedDates,
    (d, m) => (m.get(d)?.water_intake ?? 0) >= 6,
    logMap,
  );

  // ── Low symptom streak (all symptoms <= 1) ──
  const lowSymptom = consecutiveDaysFromEnd(
    sortedDates,
    (d, m) => {
      const l = m.get(d);
      if (!l) return false;
      return l.bloating <= 1 && l.gas <= 1 && l.acid_reflux <= 1 && l.abdominal_discomfort <= 1;
    },
    logMap,
  );

  // ── Exercise streak (>= 20 min) ──
  const exercise = consecutiveDaysFromEnd(
    sortedDates,
    (d, m) => (m.get(d)?.exercise_minutes ?? 0) >= 20,
    logMap,
  );

  // ── Good sleep streak (>= 7 hours) ──
  const sleep = consecutiveDaysFromEnd(
    sortedDates,
    (d, m) => (m.get(d)?.sleep_hours ?? 0) >= 7,
    logMap,
  );

  // ── Low stress streak (stress <= 2) ──
  const lowStress = consecutiveDaysFromEnd(
    sortedDates,
    (d, m) => (m.get(d)?.stress_level ?? 5) <= 2,
    logMap,
  );

  const streaks: Streak[] = [
    {
      key: 'tracking', label: 'Daily Tracking', description: 'Consecutive days of gut logging',
      currentDays: tracking.current, bestDays: tracking.best, icon: '📋', active: tracking.current > 0,
    },
    {
      key: 'hydration', label: 'Hydration', description: '6+ glasses of water daily',
      currentDays: hydration.current, bestDays: hydration.best, icon: '💧', active: hydration.current > 0,
    },
    {
      key: 'symptom_free', label: 'Symptom Improvement', description: 'All symptoms at mild or below',
      currentDays: lowSymptom.current, bestDays: lowSymptom.best, icon: '✨', active: lowSymptom.current > 0,
    },
    {
      key: 'exercise', label: 'Active Days', description: '20+ minutes of exercise',
      currentDays: exercise.current, bestDays: exercise.best, icon: '🏃', active: exercise.current > 0,
    },
    {
      key: 'sleep', label: 'Good Sleep', description: '7+ hours of sleep',
      currentDays: sleep.current, bestDays: sleep.best, icon: '😴', active: sleep.current > 0,
    },
    {
      key: 'low_stress', label: 'Calm Days', description: 'Stress level at 2 or below',
      currentDays: lowStress.current, bestDays: lowStress.best, icon: '🧘', active: lowStress.current > 0,
    },
  ];

  // ── Milestones ──
  const totalDays = sortedDates.length;
  const milestoneDefs: { key: string; label: string; desc: string; days: number; icon: string; msg: string; source: number }[] = [
    { key: '7d_tracking', label: '7-Day Logger', desc: '7 days of gut tracking', days: 7, icon: '🏅', msg: 'A full week of tracking! Knowledge is power.', source: totalDays },
    { key: '14d_tracking', label: 'Dedicated Tracker', desc: '14 days of gut tracking', days: 14, icon: '🥈', msg: 'Two weeks strong! Your data is becoming meaningful.', source: totalDays },
    { key: '30d_tracking', label: 'Gut Health Champion', desc: '30 days of gut tracking', days: 30, icon: '🏆', msg: 'A full month! You\'re building a powerful health dataset.', source: totalDays },
    { key: '7d_symptoms', label: 'Week of Relief', desc: '7-day symptom improvement streak', days: 7, icon: '🌟', msg: 'A whole week feeling better! Keep it up.', source: lowSymptom.best },
    { key: '14d_symptoms', label: 'Gut Harmony', desc: '14-day symptom reduction', days: 14, icon: '💫', msg: 'Two weeks of low symptoms — your gut is thanking you!', source: lowSymptom.best },
    { key: '7d_hydration', label: 'Hydration Hero', desc: '7-day hydration streak', days: 7, icon: '🌊', msg: 'Consistently hydrated for a week! Great for digestion.', source: hydration.best },
    { key: '30d_improvement', label: 'Transformation', desc: '30-day overall improvement', days: 30, icon: '🦋', msg: 'A month of positive change. You\'re transforming your gut health!', source: Math.max(tracking.best, lowSymptom.best) },
  ];

  const milestones: Milestone[] = milestoneDefs.map(m => ({
    key: m.key,
    label: m.label,
    description: m.desc,
    requiredDays: m.days,
    achieved: m.source >= m.days,
    progress: Math.min(100, Math.round((m.source / m.days) * 100)),
    icon: m.icon,
    motivationalMessage: m.msg,
  }));

  // Pick a motivational message
  const activeStreaks = streaks.filter(s => s.active);
  const achievedMilestones = milestones.filter(m => m.achieved);
  let motivationalMessage = 'Start tracking daily to build your streaks and unlock milestones! 🌱';

  if (achievedMilestones.length > 0) {
    const latest = achievedMilestones[achievedMilestones.length - 1];
    motivationalMessage = latest.motivationalMessage;
  } else if (activeStreaks.length > 0) {
    const best = activeStreaks.reduce((a, b) => a.currentDays > b.currentDays ? a : b);
    motivationalMessage = `${best.currentDays}-day ${best.label.toLowerCase()} streak! Keep going! 🔥`;
  }

  return { streaks, milestones, motivationalMessage };
}
