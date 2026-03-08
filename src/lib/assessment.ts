export interface AssessmentQuestion {
  id: string;
  category: 'inflammation' | 'digestion' | 'microbiome' | 'lifestyle';
  question: string;
  options: { label: string; value: number }[];
}

export const assessmentQuestions: AssessmentQuestion[] = [
  // Inflammation
  {
    id: 'bloating',
    category: 'inflammation',
    question: 'How often do you experience bloating after meals?',
    options: [
      { label: 'Never', value: 5 },
      { label: 'Rarely (once a week)', value: 4 },
      { label: 'Sometimes (2-3 times/week)', value: 3 },
      { label: 'Often (daily)', value: 1 },
    ],
  },
  {
    id: 'joint_pain',
    category: 'inflammation',
    question: 'Do you experience unexplained joint pain or stiffness?',
    options: [
      { label: 'Never', value: 5 },
      { label: 'Occasionally', value: 3 },
      { label: 'Frequently', value: 2 },
      { label: 'Constantly', value: 1 },
    ],
  },
  {
    id: 'skin_issues',
    category: 'inflammation',
    question: 'How would you describe your skin health?',
    options: [
      { label: 'Clear and healthy', value: 5 },
      { label: 'Occasional breakouts', value: 3 },
      { label: 'Frequent rashes or acne', value: 2 },
      { label: 'Chronic skin conditions', value: 1 },
    ],
  },
  // Digestion
  {
    id: 'bowel_regularity',
    category: 'digestion',
    question: 'How regular are your bowel movements?',
    options: [
      { label: 'Very regular (1-2 times daily)', value: 5 },
      { label: 'Mostly regular', value: 4 },
      { label: 'Irregular', value: 2 },
      { label: 'Very irregular or problematic', value: 1 },
    ],
  },
  {
    id: 'food_sensitivities',
    category: 'digestion',
    question: 'How many food sensitivities do you experience?',
    options: [
      { label: 'None', value: 5 },
      { label: '1-2 foods', value: 4 },
      { label: '3-5 foods', value: 2 },
      { label: 'Many (6+)', value: 1 },
    ],
  },
  {
    id: 'acid_reflux',
    category: 'digestion',
    question: 'Do you experience acid reflux or heartburn?',
    options: [
      { label: 'Never', value: 5 },
      { label: 'Rarely', value: 4 },
      { label: 'Weekly', value: 2 },
      { label: 'Daily', value: 1 },
    ],
  },
  // Microbiome
  {
    id: 'fermented_foods',
    category: 'microbiome',
    question: 'How often do you consume fermented foods (yogurt, kimchi, sauerkraut)?',
    options: [
      { label: 'Daily', value: 5 },
      { label: 'A few times a week', value: 4 },
      { label: 'Occasionally', value: 2 },
      { label: 'Never', value: 1 },
    ],
  },
  {
    id: 'fiber_intake',
    category: 'microbiome',
    question: 'How would you rate your daily fiber intake?',
    options: [
      { label: 'High (lots of fruits, veggies, whole grains)', value: 5 },
      { label: 'Moderate', value: 4 },
      { label: 'Low', value: 2 },
      { label: 'Very low', value: 1 },
    ],
  },
  {
    id: 'antibiotics',
    category: 'microbiome',
    question: 'How recently have you taken antibiotics?',
    options: [
      { label: 'Over a year ago or never', value: 5 },
      { label: '6-12 months ago', value: 4 },
      { label: '1-6 months ago', value: 2 },
      { label: 'Currently or within last month', value: 1 },
    ],
  },
  // Lifestyle
  {
    id: 'stress_level',
    category: 'lifestyle',
    question: 'How would you rate your daily stress levels?',
    options: [
      { label: 'Low – I feel calm most days', value: 5 },
      { label: 'Moderate – manageable stress', value: 4 },
      { label: 'High – often stressed', value: 2 },
      { label: 'Very high – constant stress', value: 1 },
    ],
  },
  {
    id: 'sleep_quality',
    category: 'lifestyle',
    question: 'How would you describe your sleep quality?',
    options: [
      { label: 'Excellent (7-9 hours, restful)', value: 5 },
      { label: 'Good', value: 4 },
      { label: 'Fair (trouble sleeping)', value: 2 },
      { label: 'Poor (insomnia or very disrupted)', value: 1 },
    ],
  },
  {
    id: 'water_intake',
    category: 'lifestyle',
    question: 'How much water do you drink daily?',
    options: [
      { label: '8+ glasses', value: 5 },
      { label: '5-7 glasses', value: 4 },
      { label: '2-4 glasses', value: 2 },
      { label: 'Less than 2 glasses', value: 1 },
    ],
  },
];

export interface ScoreResult {
  inflammation: number;
  digestion: number;
  microbiome: number;
  lifestyle: number;
  overall: number;
}

export function calculateScores(answers: Record<string, number>): ScoreResult {
  const categories = ['inflammation', 'digestion', 'microbiome', 'lifestyle'] as const;
  const scores: Record<string, number> = {};

  for (const cat of categories) {
    const catQuestions = assessmentQuestions.filter(q => q.category === cat);
    const total = catQuestions.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
    const max = catQuestions.length * 5;
    scores[cat] = Math.round((total / max) * 100);
  }

  const overall = Math.round(
    (scores.inflammation + scores.digestion + scores.microbiome + scores.lifestyle) / 4
  );

  return { ...scores, overall } as ScoreResult;
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Attention';
}

export function getRecommendations(scores: ScoreResult): string[] {
  const recs: string[] = [];

  if (scores.inflammation < 60) {
    recs.push('Consider an anti-inflammatory diet rich in omega-3s, turmeric, and leafy greens.');
    recs.push('Track foods that trigger bloating and try an elimination diet.');
  }
  if (scores.digestion < 60) {
    recs.push('Eat slowly and chew thoroughly to improve digestion.');
    recs.push('Consider digestive enzymes or apple cider vinegar before meals.');
  }
  if (scores.microbiome < 60) {
    recs.push('Increase your intake of probiotic-rich foods like yogurt, kefir, and kimchi.');
    recs.push('Aim for 30+ different plant foods per week to boost microbiome diversity.');
  }
  if (scores.lifestyle < 60) {
    recs.push('Practice stress-reduction techniques like deep breathing or meditation.');
    recs.push('Prioritize 7-9 hours of quality sleep each night.');
  }
  if (scores.overall >= 80) {
    recs.push('Great job! Maintain your healthy habits and consider periodic reassessments.');
  }

  return recs;
}
