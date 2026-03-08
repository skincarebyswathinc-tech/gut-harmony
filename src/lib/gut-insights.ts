/**
 * Gut Intelligence Insight Engine
 * Detects correlations between lifestyle behaviors and gut symptoms
 * from daily_gut_logs data.
 */

export interface DailyLog {
  bloating: number;
  gas: number;
  acid_reflux: number;
  abdominal_discomfort: number;
  stool_type: number | null;
  sleep_hours: number | null;
  stress_level: number;
  water_intake: number | null;
  exercise_minutes: number | null;
  energy_level: number;
  mood: number;
}

export interface GutInsight {
  message: string;
  type: 'warning' | 'positive';
  strength: number; // 0–100, how strong the correlation is
}

function avg(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

function splitByThreshold<T>(
  logs: T[],
  getter: (l: T) => number | null,
  threshold: number,
): { low: T[]; high: T[] } {
  const low: T[] = [];
  const high: T[] = [];
  for (const l of logs) {
    const v = getter(l);
    if (v == null) continue;
    (v < threshold ? low : high).push(l);
  }
  return { low, high };
}

export function generateInsights(logs: DailyLog[]): GutInsight[] {
  if (logs.length < 5) return [];

  const insights: GutInsight[] = [];

  // Helper: compare symptom avg between two groups
  const compare = (
    lowGroup: DailyLog[],
    highGroup: DailyLog[],
    symptomGetter: (l: DailyLog) => number,
    symptomName: string,
    factorName: string,
    lowLabel: string,
    highLabel: string,
  ) => {
    if (lowGroup.length < 2 || highGroup.length < 2) return;
    const avgLow = avg(lowGroup.map(symptomGetter));
    const avgHigh = avg(highGroup.map(symptomGetter));
    const diff = Math.abs(avgHigh - avgLow);
    const baseline = Math.max(avgLow, avgHigh, 0.5);
    const pct = Math.round((diff / baseline) * 100);

    if (pct < 20 || diff < 0.4) return;

    const strength = Math.min(100, pct);

    if (avgHigh > avgLow) {
      insights.push({
        message: `Your ${symptomName.toLowerCase()} increases on days when ${factorName} is ${highLabel}.`,
        type: 'warning',
        strength,
      });
    } else {
      insights.push({
        message: `${symptomName} improves when ${factorName} is ${highLabel}.`,
        type: 'positive',
        strength,
      });
    }
  };

  const symptoms: { name: string; get: (l: DailyLog) => number }[] = [
    { name: 'Bloating', get: l => l.bloating },
    { name: 'Gas', get: l => l.gas },
    { name: 'Reflux', get: l => l.acid_reflux },
    { name: 'Abdominal discomfort', get: l => l.abdominal_discomfort },
  ];

  // ── Stress correlations ──
  const { low: lowStress, high: highStress } = splitByThreshold(logs, l => l.stress_level, 3);
  for (const s of symptoms) {
    compare(lowStress, highStress, s.get, s.name, 'stress', 'low', 'high');
  }

  // ── Sleep correlations ──
  const { low: poorSleep, high: goodSleep } = splitByThreshold(logs, l => l.sleep_hours, 6);
  for (const s of symptoms) {
    compare(goodSleep, poorSleep, s.get, s.name, 'sleep', 'above 6 hours', 'below 6 hours');
  }

  // ── Water intake correlations ──
  const { low: lowWater, high: highWater } = splitByThreshold(logs, l => l.water_intake, 6);
  for (const s of symptoms) {
    compare(highWater, lowWater, s.get, s.name, 'water intake', 'high', 'low');
  }

  // ── Stool type & water ──
  const logsWithStool = logs.filter(l => l.stool_type != null);
  if (logsWithStool.length >= 5) {
    const constipated = logsWithStool.filter(l => l.stool_type! <= 2);
    const healthy = logsWithStool.filter(l => l.stool_type! >= 3 && l.stool_type! <= 5);
    if (constipated.length >= 2 && healthy.length >= 2) {
      const waterConst = avg(constipated.map(l => l.water_intake ?? 0));
      const waterHealthy = avg(healthy.map(l => l.water_intake ?? 0));
      if (waterHealthy > waterConst + 1) {
        insights.push({
          message: `Constipation improves when water intake exceeds ${Math.round(waterHealthy)} glasses per day.`,
          type: 'positive',
          strength: Math.min(100, Math.round(((waterHealthy - waterConst) / Math.max(waterConst, 1)) * 100)),
        });
      }
    }
  }

  // ── Exercise correlations ──
  const { low: lowExercise, high: highExercise } = splitByThreshold(logs, l => l.exercise_minutes, 20);
  for (const s of symptoms) {
    compare(highExercise, lowExercise, s.get, s.name, 'exercise', 'above 20 min', 'below 20 min');
  }

  // ── Mood–symptom link ──
  const { low: lowMood, high: highMood } = splitByThreshold(logs, l => l.mood, 3);
  const totalSx = (l: DailyLog) => l.bloating + l.gas + l.acid_reflux + l.abdominal_discomfort;
  if (lowMood.length >= 2 && highMood.length >= 2) {
    const avgSxLow = avg(lowMood.map(totalSx));
    const avgSxHigh = avg(highMood.map(totalSx));
    if (avgSxLow > avgSxHigh + 2) {
      insights.push({
        message: 'Total gut symptoms are notably higher on low-mood days.',
        type: 'warning',
        strength: Math.min(100, Math.round(((avgSxLow - avgSxHigh) / Math.max(avgSxHigh, 1)) * 100)),
      });
    }
  }

  // Sort by strength descending, return top 6
  insights.sort((a, b) => b.strength - a.strength);
  return insights.slice(0, 6);
}
