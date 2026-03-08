/**
 * Compute food–symptom correlations from food log data.
 * Returns insights like "Bloating appears X% more often after dairy."
 */

export interface FoodLog {
  food_category: string;
  bloating: number;
  gas: number;
  reflux: number;
  fatigue: number;
}

export interface Correlation {
  category: string;
  symptom: string;
  percentage: number;       // how much more (or less) vs baseline
  direction: 'higher' | 'lower';
  avgWithCategory: number;
  avgBaseline: number;
}

const symptomKeys: (keyof Pick<FoodLog, 'bloating' | 'gas' | 'reflux' | 'fatigue'>)[] =
  ['bloating', 'gas', 'reflux', 'fatigue'];

const symptomLabels: Record<string, string> = {
  bloating: 'Bloating',
  gas: 'Gas',
  reflux: 'Reflux',
  fatigue: 'Fatigue',
};

const categoryLabels: Record<string, string> = {
  high_sugar: 'High Sugar Foods',
  dairy: 'Dairy',
  gluten: 'Gluten',
  processed: 'Processed Foods',
  fried: 'Fried Foods',
  fermented: 'Fermented Foods',
  high_fiber: 'High Fiber Foods',
  custom: 'Other Foods',
};

export function computeCorrelations(logs: FoodLog[]): Correlation[] {
  if (logs.length < 3) return [];

  // Global baseline averages
  const baseline: Record<string, number> = {};
  for (const s of symptomKeys) {
    baseline[s] = logs.reduce((sum, l) => sum + l[s], 0) / logs.length;
  }

  const categories = [...new Set(logs.map((l) => l.food_category))];
  const results: Correlation[] = [];

  for (const cat of categories) {
    const catLogs = logs.filter((l) => l.food_category === cat);
    if (catLogs.length < 2) continue;

    for (const s of symptomKeys) {
      const avg = catLogs.reduce((sum, l) => sum + l[s], 0) / catLogs.length;
      const base = baseline[s];
      if (base === 0 && avg === 0) continue;

      const diff = base > 0 ? ((avg - base) / base) * 100 : avg > 0 ? 100 : 0;
      if (Math.abs(diff) < 10) continue; // only meaningful differences

      results.push({
        category: categoryLabels[cat] ?? cat,
        symptom: symptomLabels[s],
        percentage: Math.round(Math.abs(diff)),
        direction: diff > 0 ? 'higher' : 'lower',
        avgWithCategory: Math.round(avg * 10) / 10,
        avgBaseline: Math.round(base * 10) / 10,
      });
    }
  }

  // Sort by strongest correlations first
  results.sort((a, b) => b.percentage - a.percentage);
  return results.slice(0, 10);
}

export function formatInsight(c: Correlation): string {
  if (c.direction === 'higher') {
    return `${c.symptom} appears ${c.percentage}% more often after ${c.category.toLowerCase()}.`;
  }
  return `${c.symptom} is ${c.percentage}% lower with ${c.category.toLowerCase()}.`;
}
