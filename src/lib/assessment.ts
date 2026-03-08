// ==========================================
// Gut Intelligence Platform — Assessment Data
// ==========================================

export type SectionId =
  | 'digestive_symptoms'
  | 'stool_health'
  | 'lifestyle'
  | 'diet_patterns'
  | 'inflammation'
  | 'gut_brain'
  | 'hormonal';

export interface AssessmentQuestion {
  id: string;
  section: SectionId;
  question: string;
  description?: string;
  options: { label: string; value: number }[];
}

export interface AssessmentSection {
  id: SectionId;
  title: string;
  description: string;
  icon: string; // lucide icon name
}

export const sections: AssessmentSection[] = [
  {
    id: 'digestive_symptoms',
    title: 'Digestive Symptoms',
    description: 'Tell us about your daily digestive experience.',
    icon: 'Stethoscope',
  },
  {
    id: 'stool_health',
    title: 'Stool Health',
    description: 'These questions help assess your bowel function using the Bristol Stool Chart.',
    icon: 'ClipboardList',
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle Factors',
    description: 'Your daily habits have a major impact on gut health.',
    icon: 'Sun',
  },
  {
    id: 'diet_patterns',
    title: 'Diet Patterns',
    description: 'What you eat directly shapes your gut microbiome.',
    icon: 'Apple',
  },
  {
    id: 'inflammation',
    title: 'Inflammation Indicators',
    description: 'Chronic inflammation often originates in the gut.',
    icon: 'Flame',
  },
  {
    id: 'gut_brain',
    title: 'Gut-Brain Axis',
    description: 'Your gut and brain communicate constantly.',
    icon: 'Brain',
  },
  {
    id: 'hormonal',
    title: 'Hormonal Indicators',
    description: 'Gut health influences hormonal balance.',
    icon: 'HeartPulse',
  },
];

const severity = [
  { label: 'Never', value: 5 },
  { label: 'Rarely', value: 4 },
  { label: 'Sometimes', value: 3 },
  { label: 'Often', value: 2 },
  { label: 'Daily', value: 1 },
];

const frequency = [
  { label: 'Never', value: 5 },
  { label: 'Rarely', value: 4 },
  { label: 'Sometimes', value: 3 },
  { label: 'Often', value: 2 },
  { label: 'Always', value: 1 },
];

const quality = [
  { label: 'Excellent', value: 5 },
  { label: 'Good', value: 4 },
  { label: 'Fair', value: 3 },
  { label: 'Poor', value: 2 },
  { label: 'Very Poor', value: 1 },
];

const intake = [
  { label: 'Very High', value: 5 },
  { label: 'High', value: 4 },
  { label: 'Moderate', value: 3 },
  { label: 'Low', value: 2 },
  { label: 'Very Low / None', value: 1 },
];

const intakeReversed = [
  { label: 'None', value: 5 },
  { label: 'Very Low', value: 4 },
  { label: 'Moderate', value: 3 },
  { label: 'High', value: 2 },
  { label: 'Very High', value: 1 },
];

const tolerance = [
  { label: 'No issues at all', value: 5 },
  { label: 'Mild sensitivity', value: 4 },
  { label: 'Moderate sensitivity', value: 3 },
  { label: 'Significant intolerance', value: 2 },
  { label: 'Completely intolerant', value: 1 },
];

export const assessmentQuestions: AssessmentQuestion[] = [
  // ===== 1. DIGESTIVE SYMPTOMS (8 questions) =====
  {
    id: 'ds_bloating',
    section: 'digestive_symptoms',
    question: 'How often do you experience bloating after meals?',
    options: severity,
  },
  {
    id: 'ds_bloating_severity',
    section: 'digestive_symptoms',
    question: 'When you do experience bloating, how severe is it?',
    options: [
      { label: 'Not applicable', value: 5 },
      { label: 'Mild — barely noticeable', value: 4 },
      { label: 'Moderate — uncomfortable', value: 3 },
      { label: 'Severe — impacts daily activities', value: 2 },
      { label: 'Extreme — debilitating', value: 1 },
    ],
  },
  {
    id: 'ds_gas',
    section: 'digestive_symptoms',
    question: 'How often do you experience excessive gas or flatulence?',
    options: severity,
  },
  {
    id: 'ds_acid_reflux',
    section: 'digestive_symptoms',
    question: 'How often do you experience acid reflux or heartburn?',
    options: severity,
  },
  {
    id: 'ds_constipation',
    section: 'digestive_symptoms',
    question: 'How often do you experience constipation?',
    options: severity,
  },
  {
    id: 'ds_diarrhea',
    section: 'digestive_symptoms',
    question: 'How often do you experience diarrhea or loose stools?',
    options: severity,
  },
  {
    id: 'ds_abdominal_pain',
    section: 'digestive_symptoms',
    question: 'How often do you experience abdominal pain or cramping?',
    options: severity,
  },
  {
    id: 'ds_nausea',
    section: 'digestive_symptoms',
    question: 'How often do you experience nausea after eating?',
    options: severity,
  },

  // ===== 2. STOOL HEALTH (7 questions) =====
  {
    id: 'sh_type',
    section: 'stool_health',
    question: 'What best describes your typical stool type?',
    description: 'Based on the Bristol Stool Chart',
    options: [
      { label: 'Type 3-4 — Smooth, sausage-shaped (ideal)', value: 5 },
      { label: 'Type 5 — Soft blobs with clear edges', value: 4 },
      { label: 'Type 2 — Lumpy, sausage-shaped', value: 3 },
      { label: 'Type 6 — Mushy, fluffy pieces', value: 2 },
      { label: 'Type 1 or 7 — Hard lumps or entirely liquid', value: 1 },
    ],
  },
  {
    id: 'sh_frequency',
    section: 'stool_health',
    question: 'How often do you have a bowel movement?',
    options: [
      { label: '1-2 times daily', value: 5 },
      { label: 'Once daily', value: 4 },
      { label: 'Every other day', value: 3 },
      { label: 'Less than 3 times per week', value: 2 },
      { label: '3+ times daily or very irregularly', value: 1 },
    ],
  },
  {
    id: 'sh_mucus',
    section: 'stool_health',
    question: 'Do you notice mucus in your stool?',
    options: severity,
  },
  {
    id: 'sh_undigested',
    section: 'stool_health',
    question: 'Do you notice undigested food particles in your stool?',
    options: severity,
  },
  {
    id: 'sh_urgency',
    section: 'stool_health',
    question: 'How often do you experience urgency to go?',
    options: severity,
  },
  {
    id: 'sh_incomplete',
    section: 'stool_health',
    question: 'Do you often feel incomplete evacuation after a bowel movement?',
    options: severity,
  },
  {
    id: 'sh_color',
    section: 'stool_health',
    question: 'How would you describe your typical stool color?',
    options: [
      { label: 'Medium brown (healthy)', value: 5 },
      { label: 'Light brown or dark brown', value: 4 },
      { label: 'Yellowish or greenish occasionally', value: 3 },
      { label: 'Very pale, clay-colored, or very dark', value: 2 },
      { label: 'Red, black, or significantly abnormal', value: 1 },
    ],
  },

  // ===== 3. LIFESTYLE FACTORS (8 questions) =====
  {
    id: 'lf_sleep_quality',
    section: 'lifestyle',
    question: 'How would you rate your overall sleep quality?',
    options: quality,
  },
  {
    id: 'lf_sleep_hours',
    section: 'lifestyle',
    question: 'How many hours of sleep do you typically get?',
    options: [
      { label: '7-9 hours', value: 5 },
      { label: '6-7 hours', value: 4 },
      { label: '5-6 hours', value: 3 },
      { label: '4-5 hours', value: 2 },
      { label: 'Less than 4 hours', value: 1 },
    ],
  },
  {
    id: 'lf_stress',
    section: 'lifestyle',
    question: 'How would you rate your daily stress level?',
    options: [
      { label: 'Very low — calm and relaxed', value: 5 },
      { label: 'Low — manageable', value: 4 },
      { label: 'Moderate — somewhat stressed', value: 3 },
      { label: 'High — often overwhelmed', value: 2 },
      { label: 'Very high — constant stress', value: 1 },
    ],
  },
  {
    id: 'lf_water',
    section: 'lifestyle',
    question: 'How much water do you drink daily?',
    options: [
      { label: '8+ glasses (2+ liters)', value: 5 },
      { label: '6-8 glasses', value: 4 },
      { label: '4-6 glasses', value: 3 },
      { label: '2-4 glasses', value: 2 },
      { label: 'Less than 2 glasses', value: 1 },
    ],
  },
  {
    id: 'lf_alcohol',
    section: 'lifestyle',
    question: 'How often do you consume alcohol?',
    options: [
      { label: 'Never', value: 5 },
      { label: 'Occasionally (1-2 times/month)', value: 4 },
      { label: 'Weekly (1-3 drinks/week)', value: 3 },
      { label: 'Frequently (4-7 drinks/week)', value: 2 },
      { label: 'Daily or heavy drinking', value: 1 },
    ],
  },
  {
    id: 'lf_antibiotics_recent',
    section: 'lifestyle',
    question: 'When was the last time you took antibiotics?',
    options: [
      { label: 'Over a year ago or never', value: 5 },
      { label: '6-12 months ago', value: 4 },
      { label: '3-6 months ago', value: 3 },
      { label: '1-3 months ago', value: 2 },
      { label: 'Currently or within the last month', value: 1 },
    ],
  },
  {
    id: 'lf_antibiotics_frequency',
    section: 'lifestyle',
    question: 'How often have you taken antibiotics in the past 2 years?',
    options: [
      { label: 'Never', value: 5 },
      { label: 'Once', value: 4 },
      { label: '2-3 times', value: 3 },
      { label: '4-5 times', value: 2 },
      { label: 'More than 5 times', value: 1 },
    ],
  },
  {
    id: 'lf_exercise',
    section: 'lifestyle',
    question: 'How often do you exercise or engage in physical activity?',
    options: [
      { label: 'Daily (30+ minutes)', value: 5 },
      { label: '4-5 times per week', value: 4 },
      { label: '2-3 times per week', value: 3 },
      { label: 'Once a week or less', value: 2 },
      { label: 'Sedentary — rarely exercise', value: 1 },
    ],
  },

  // ===== 4. DIET PATTERNS (8 questions) =====
  {
    id: 'dp_fiber',
    section: 'diet_patterns',
    question: 'How would you rate your daily fiber intake (fruits, vegetables, whole grains)?',
    options: intake,
  },
  {
    id: 'dp_plant_diversity',
    section: 'diet_patterns',
    question: 'How many different plant foods do you eat in a typical week?',
    options: [
      { label: '30+ varieties', value: 5 },
      { label: '20-30 varieties', value: 4 },
      { label: '10-20 varieties', value: 3 },
      { label: '5-10 varieties', value: 2 },
      { label: 'Less than 5', value: 1 },
    ],
  },
  {
    id: 'dp_sugar',
    section: 'diet_patterns',
    question: 'How would you rate your daily sugar consumption?',
    options: intakeReversed,
  },
  {
    id: 'dp_processed_food',
    section: 'diet_patterns',
    question: 'How often do you eat processed or ultra-processed foods?',
    options: [
      { label: 'Rarely or never', value: 5 },
      { label: 'Once or twice a week', value: 4 },
      { label: 'A few times a week', value: 3 },
      { label: 'Daily', value: 2 },
      { label: 'Multiple times daily', value: 1 },
    ],
  },
  {
    id: 'dp_fermented',
    section: 'diet_patterns',
    question: 'How often do you consume fermented foods (yogurt, kimchi, sauerkraut, kefir)?',
    options: [
      { label: 'Daily', value: 5 },
      { label: 'Several times a week', value: 4 },
      { label: 'Once a week', value: 3 },
      { label: 'Occasionally', value: 2 },
      { label: 'Never', value: 1 },
    ],
  },
  {
    id: 'dp_dairy',
    section: 'diet_patterns',
    question: 'How well do you tolerate dairy products?',
    options: tolerance,
  },
  {
    id: 'dp_gluten',
    section: 'diet_patterns',
    question: 'How well do you tolerate gluten-containing foods?',
    options: tolerance,
  },
  {
    id: 'dp_meal_regularity',
    section: 'diet_patterns',
    question: 'How regular are your meal times?',
    options: [
      { label: 'Very consistent schedule', value: 5 },
      { label: 'Mostly regular', value: 4 },
      { label: 'Somewhat irregular', value: 3 },
      { label: 'Very irregular', value: 2 },
      { label: 'Chaotic — skip meals often', value: 1 },
    ],
  },

  // ===== 5. INFLAMMATION INDICATORS (7 questions) =====
  {
    id: 'inf_fatigue',
    section: 'inflammation',
    question: 'How often do you experience unexplained fatigue?',
    options: severity,
  },
  {
    id: 'inf_brain_fog',
    section: 'inflammation',
    question: 'How often do you experience brain fog or difficulty concentrating?',
    options: severity,
  },
  {
    id: 'inf_joint_pain',
    section: 'inflammation',
    question: 'How often do you experience joint pain or stiffness?',
    options: severity,
  },
  {
    id: 'inf_skin',
    section: 'inflammation',
    question: 'How often do you experience skin issues (acne, eczema, rashes, psoriasis)?',
    options: severity,
  },
  {
    id: 'inf_headaches',
    section: 'inflammation',
    question: 'How often do you get unexplained headaches or migraines?',
    options: severity,
  },
  {
    id: 'inf_sinus',
    section: 'inflammation',
    question: 'How often do you experience sinus congestion or post-nasal drip?',
    options: severity,
  },
  {
    id: 'inf_autoimmune',
    section: 'inflammation',
    question: 'Have you been diagnosed with any autoimmune conditions?',
    options: [
      { label: 'No', value: 5 },
      { label: 'Suspected but not diagnosed', value: 3 },
      { label: 'Yes — one condition, well managed', value: 2 },
      { label: 'Yes — one or more, actively struggling', value: 1 },
    ],
  },

  // ===== 6. GUT-BRAIN AXIS (6 questions) =====
  {
    id: 'gb_anxiety',
    section: 'gut_brain',
    question: 'How often do you experience anxiety or nervousness?',
    options: severity,
  },
  {
    id: 'gb_mood_swings',
    section: 'gut_brain',
    question: 'How often do you experience sudden mood swings?',
    options: severity,
  },
  {
    id: 'gb_sleep_disturbance',
    section: 'gut_brain',
    question: 'How often do you experience difficulty falling or staying asleep?',
    options: severity,
  },
  {
    id: 'gb_irritability',
    section: 'gut_brain',
    question: 'How often do you feel irritable or short-tempered?',
    options: severity,
  },
  {
    id: 'gb_depression',
    section: 'gut_brain',
    question: 'How often do you feel low mood or sadness without a clear cause?',
    options: severity,
  },
  {
    id: 'gb_focus',
    section: 'gut_brain',
    question: 'How would you rate your ability to focus and stay productive?',
    options: quality,
  },

  // ===== 7. HORMONAL INDICATORS (6 questions) =====
  {
    id: 'hm_pms',
    section: 'hormonal',
    question: 'Do you experience PMS or menstrual irregularities?',
    description: 'Select "Not applicable" if this doesn\'t apply to you.',
    options: [
      { label: 'Not applicable', value: 5 },
      { label: 'No symptoms', value: 5 },
      { label: 'Mild symptoms', value: 4 },
      { label: 'Moderate symptoms', value: 3 },
      { label: 'Severe symptoms', value: 1 },
    ],
  },
  {
    id: 'hm_sugar_cravings',
    section: 'hormonal',
    question: 'How often do you experience intense sugar or carb cravings?',
    options: severity,
  },
  {
    id: 'hm_thyroid',
    section: 'hormonal',
    question: 'Have you experienced thyroid-related symptoms (weight changes, cold sensitivity, hair loss)?',
    options: [
      { label: 'No symptoms', value: 5 },
      { label: 'Occasional mild symptoms', value: 4 },
      { label: 'Frequent symptoms', value: 3 },
      { label: 'Diagnosed and managed', value: 2 },
      { label: 'Diagnosed and struggling', value: 1 },
    ],
  },
  {
    id: 'hm_energy_crashes',
    section: 'hormonal',
    question: 'How often do you experience energy crashes after meals?',
    options: severity,
  },
  {
    id: 'hm_weight',
    section: 'hormonal',
    question: 'Do you find it difficult to maintain a healthy weight?',
    options: [
      { label: 'No difficulty', value: 5 },
      { label: 'Slight difficulty', value: 4 },
      { label: 'Moderate difficulty', value: 3 },
      { label: 'Significant difficulty', value: 2 },
      { label: 'Extreme difficulty', value: 1 },
    ],
  },
  {
    id: 'hm_bloat_hormonal',
    section: 'hormonal',
    question: 'Do you notice gut symptoms worsening around hormonal changes (cycle, stress)?',
    options: [
      { label: 'Not applicable / No pattern', value: 5 },
      { label: 'Rarely', value: 4 },
      { label: 'Sometimes', value: 3 },
      { label: 'Often', value: 2 },
      { label: 'Always', value: 1 },
    ],
  },
];

// ==========================================
// Scoring
// ==========================================

export interface ScoreResult {
  digestive_symptoms: number;
  stool_health: number;
  lifestyle: number;
  diet_patterns: number;
  inflammation: number;
  gut_brain: number;
  hormonal: number;
  overall: number;
}

export function calculateScores(answers: Record<string, number>): ScoreResult {
  const sectionIds: SectionId[] = [
    'digestive_symptoms', 'stool_health', 'lifestyle', 'diet_patterns',
    'inflammation', 'gut_brain', 'hormonal',
  ];

  const scores: Record<string, number> = {};

  for (const sId of sectionIds) {
    const qs = assessmentQuestions.filter(q => q.section === sId);
    const answeredQs = qs.filter(q => answers[q.id] !== undefined);
    if (answeredQs.length === 0) {
      scores[sId] = 0;
      continue;
    }
    const total = answeredQs.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
    const max = answeredQs.length * 5;
    scores[sId] = Math.round((total / max) * 100);
  }

  const vals = sectionIds.map(s => scores[s]);
  const overall = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);

  return { ...scores, overall } as unknown as ScoreResult;
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Attention';
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-score-excellent';
  if (score >= 60) return 'text-score-good';
  if (score >= 40) return 'text-score-fair';
  return 'text-score-poor';
}

export function getRecommendations(scores: ScoreResult): string[] {
  const recs: string[] = [];

  if (scores.digestive_symptoms < 60) {
    recs.push('Consider keeping a food diary to identify specific trigger foods for your digestive symptoms.');
    recs.push('Eat smaller, more frequent meals and chew thoroughly to reduce bloating and gas.');
  }
  if (scores.stool_health < 60) {
    recs.push('Aim for 25-35g of fiber daily and stay well-hydrated to improve stool consistency.');
    recs.push('Consider a magnesium supplement if constipation is persistent (consult your doctor).');
  }
  if (scores.lifestyle < 60) {
    recs.push('Prioritize 7-9 hours of quality sleep — your gut repairs itself during rest.');
    recs.push('Practice daily stress-reduction: deep breathing, meditation, or gentle yoga.');
  }
  if (scores.diet_patterns < 60) {
    recs.push('Aim for 30+ different plant foods per week to boost microbiome diversity.');
    recs.push('Incorporate daily fermented foods like yogurt, kefir, kimchi, or sauerkraut.');
    recs.push('Reduce processed food and added sugar intake — they feed harmful gut bacteria.');
  }
  if (scores.inflammation < 60) {
    recs.push('Include anti-inflammatory foods: fatty fish, turmeric, ginger, leafy greens, and berries.');
    recs.push('Consider an elimination diet to identify foods that trigger inflammation.');
  }
  if (scores.gut_brain < 60) {
    recs.push('Your gut-brain connection may benefit from regular mindfulness or meditation practice.');
    recs.push('Consider L-theanine or magnesium glycinate supplements for anxiety (consult your doctor).');
  }
  if (scores.hormonal < 60) {
    recs.push('Hormonal gut symptoms may improve with cruciferous vegetables (broccoli, cauliflower, kale).');
    recs.push('Balance blood sugar by pairing carbs with protein and healthy fats to reduce cravings.');
  }
  if (scores.overall >= 80) {
    recs.push('Excellent work! Maintain your healthy habits and consider periodic reassessments to track changes.');
  }
  if (scores.overall >= 60 && scores.overall < 80) {
    recs.push('You're on a good track. Focus on the lowest-scoring areas for the biggest improvements.');
  }

  return recs;
}

export function getQuestionsForSection(sectionId: SectionId): AssessmentQuestion[] {
  return assessmentQuestions.filter(q => q.section === sectionId);
}
