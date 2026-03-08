// ==========================================
// Skin Health Analyzer — Assessment Data
// ==========================================

export type SkinSectionId =
  | 'skin_basics'
  | 'lifestyle'
  | 'nutrition'
  | 'skin_habits'
  | 'skin_concerns';

export interface SkinQuestion {
  id: string;
  section: SkinSectionId;
  question: string;
  description?: string;
  options: { label: string; value: number }[];
}

export interface SkinSection {
  id: SkinSectionId;
  title: string;
  description: string;
}

export const skinSections: SkinSection[] = [
  {
    id: 'skin_basics',
    title: 'Skin Basics',
    description: 'Let us understand your skin profile.',
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle',
    description: 'Daily habits that impact your skin health.',
  },
  {
    id: 'nutrition',
    title: 'Nutrition',
    description: 'What you eat shows on your skin.',
  },
  {
    id: 'skin_habits',
    title: 'Skin Habits',
    description: 'Your skincare routine matters.',
  },
  {
    id: 'skin_concerns',
    title: 'Skin Concerns',
    description: 'Tell us what bothers you most.',
  },
];

export const skinQuestions: SkinQuestion[] = [
  // ===== SECTION 1: SKIN BASICS (5 questions) =====
  {
    id: 'sb_age_range',
    section: 'skin_basics',
    question: 'What is your age range?',
    description: 'Skin needs change significantly with age.',
    options: [
      { label: 'Under 25', value: 5 },
      { label: '25–34', value: 4 },
      { label: '35–44', value: 3 },
      { label: '45–54', value: 2 },
      { label: '55+', value: 1 },
    ],
  },
  {
    id: 'sb_skin_type',
    section: 'skin_basics',
    question: 'How would you describe your skin type?',
    options: [
      { label: 'Normal — balanced, few issues', value: 5 },
      { label: 'Dry — tight, flaky, rough', value: 3 },
      { label: 'Oily — shiny, enlarged pores', value: 3 },
      { label: 'Combination — oily T-zone, dry cheeks', value: 3 },
      { label: 'Sensitive — reacts easily, redness', value: 2 },
    ],
  },
  {
    id: 'sb_skin_tone',
    section: 'skin_basics',
    question: 'How does your skin typically react to sun exposure?',
    options: [
      { label: 'Tans easily, rarely burns', value: 5 },
      { label: 'Tans gradually, sometimes burns', value: 4 },
      { label: 'Burns moderately, tans minimally', value: 3 },
      { label: 'Burns easily, rarely tans', value: 2 },
      { label: 'Always burns, never tans', value: 1 },
    ],
  },
  {
    id: 'sb_elasticity',
    section: 'skin_basics',
    question: 'How would you rate your skin elasticity (firmness)?',
    options: [
      { label: 'Very firm and bouncy', value: 5 },
      { label: 'Mostly firm', value: 4 },
      { label: 'Starting to lose firmness', value: 3 },
      { label: 'Noticeably less firm', value: 2 },
      { label: 'Significant sagging or laxity', value: 1 },
    ],
  },
  {
    id: 'sb_hydration',
    section: 'skin_basics',
    question: 'How hydrated does your skin feel throughout the day?',
    options: [
      { label: 'Well-hydrated all day', value: 5 },
      { label: 'Mostly hydrated', value: 4 },
      { label: 'Gets dry by afternoon', value: 3 },
      { label: 'Often feels tight and dry', value: 2 },
      { label: 'Constantly dehydrated', value: 1 },
    ],
  },

  // ===== SECTION 2: LIFESTYLE (5 questions) =====
  {
    id: 'ls_sleep',
    section: 'lifestyle',
    question: 'How many hours of sleep do you typically get?',
    options: [
      { label: '7–9 hours (optimal)', value: 5 },
      { label: '6–7 hours', value: 4 },
      { label: '5–6 hours', value: 3 },
      { label: '4–5 hours', value: 2 },
      { label: 'Less than 4 hours', value: 1 },
    ],
  },
  {
    id: 'ls_stress',
    section: 'lifestyle',
    question: 'How would you rate your daily stress level?',
    options: [
      { label: 'Very low — calm and relaxed', value: 5 },
      { label: 'Low — manageable', value: 4 },
      { label: 'Moderate', value: 3 },
      { label: 'High — often overwhelmed', value: 2 },
      { label: 'Very high — constant stress', value: 1 },
    ],
  },
  {
    id: 'ls_exercise',
    section: 'lifestyle',
    question: 'How often do you exercise?',
    options: [
      { label: 'Daily (30+ minutes)', value: 5 },
      { label: '4–5 times per week', value: 4 },
      { label: '2–3 times per week', value: 3 },
      { label: 'Once a week or less', value: 2 },
      { label: 'Rarely or never', value: 1 },
    ],
  },
  {
    id: 'ls_water',
    section: 'lifestyle',
    question: 'How much water do you drink daily?',
    options: [
      { label: '8+ glasses (2+ liters)', value: 5 },
      { label: '6–8 glasses', value: 4 },
      { label: '4–6 glasses', value: 3 },
      { label: '2–4 glasses', value: 2 },
      { label: 'Less than 2 glasses', value: 1 },
    ],
  },
  {
    id: 'ls_smoking',
    section: 'lifestyle',
    question: 'Do you smoke or are you regularly exposed to secondhand smoke?',
    options: [
      { label: 'Never — no exposure', value: 5 },
      { label: 'Rarely exposed', value: 4 },
      { label: 'Occasional exposure', value: 3 },
      { label: 'Regular exposure or light smoker', value: 2 },
      { label: 'Daily smoker', value: 1 },
    ],
  },

  // ===== SECTION 3: NUTRITION (5 questions) =====
  {
    id: 'nu_sugar',
    section: 'nutrition',
    question: 'How would you rate your daily sugar consumption?',
    description: 'Excess sugar accelerates skin aging through glycation.',
    options: [
      { label: 'Very low — rarely consume sugar', value: 5 },
      { label: 'Low', value: 4 },
      { label: 'Moderate', value: 3 },
      { label: 'High', value: 2 },
      { label: 'Very high — daily sweets and sodas', value: 1 },
    ],
  },
  {
    id: 'nu_vegetables',
    section: 'nutrition',
    question: 'How many servings of vegetables do you eat daily?',
    options: [
      { label: '5+ servings', value: 5 },
      { label: '3–4 servings', value: 4 },
      { label: '1–2 servings', value: 3 },
      { label: 'Less than 1 serving', value: 2 },
      { label: 'Rarely eat vegetables', value: 1 },
    ],
  },
  {
    id: 'nu_omega3',
    section: 'nutrition',
    question: 'How often do you eat omega-3 rich foods (salmon, walnuts, flaxseed)?',
    description: 'Omega-3 fatty acids reduce inflammation and support the skin barrier.',
    options: [
      { label: 'Daily', value: 5 },
      { label: 'Several times a week', value: 4 },
      { label: 'Once a week', value: 3 },
      { label: 'Occasionally', value: 2 },
      { label: 'Rarely or never', value: 1 },
    ],
  },
  {
    id: 'nu_processed',
    section: 'nutrition',
    question: 'How often do you eat processed or fast food?',
    options: [
      { label: 'Rarely or never', value: 5 },
      { label: 'Once a week', value: 4 },
      { label: 'A few times a week', value: 3 },
      { label: 'Daily', value: 2 },
      { label: 'Multiple times daily', value: 1 },
    ],
  },
  {
    id: 'nu_antioxidants',
    section: 'nutrition',
    question: 'How often do you consume antioxidant-rich foods (berries, green tea, dark chocolate)?',
    options: [
      { label: 'Daily', value: 5 },
      { label: 'Several times a week', value: 4 },
      { label: 'Once a week', value: 3 },
      { label: 'Occasionally', value: 2 },
      { label: 'Rarely or never', value: 1 },
    ],
  },

  // ===== SECTION 4: SKIN HABITS (5 questions) =====
  {
    id: 'sh_sunscreen',
    section: 'skin_habits',
    question: 'How consistently do you apply sunscreen (SPF 30+)?',
    options: [
      { label: 'Every day, rain or shine', value: 5 },
      { label: 'Most days', value: 4 },
      { label: 'Only on sunny days', value: 3 },
      { label: 'Occasionally', value: 2 },
      { label: 'Rarely or never', value: 1 },
    ],
  },
  {
    id: 'sh_exfoliation',
    section: 'skin_habits',
    question: 'How often do you exfoliate your skin?',
    options: [
      { label: '1–2 times per week (ideal)', value: 5 },
      { label: '3 times per week', value: 4 },
      { label: 'Once a month or less', value: 3 },
      { label: 'Daily (over-exfoliating)', value: 2 },
      { label: 'Never', value: 1 },
    ],
  },
  {
    id: 'sh_moisturizer',
    section: 'skin_habits',
    question: 'How consistently do you use a moisturizer?',
    options: [
      { label: 'Twice daily (morning and night)', value: 5 },
      { label: 'Once daily', value: 4 },
      { label: 'A few times a week', value: 3 },
      { label: 'Occasionally', value: 2 },
      { label: 'Rarely or never', value: 1 },
    ],
  },
  {
    id: 'sh_cleansing',
    section: 'skin_habits',
    question: 'How do you cleanse your face?',
    options: [
      { label: 'Gentle cleanser twice daily', value: 5 },
      { label: 'Cleanser once daily', value: 4 },
      { label: 'Just water', value: 3 },
      { label: 'Harsh soap or irregular cleansing', value: 2 },
      { label: 'Rarely wash face properly', value: 1 },
    ],
  },
  {
    id: 'sh_pillowcase',
    section: 'skin_habits',
    question: 'How often do you change your pillowcase?',
    description: 'Dirty pillowcases harbor bacteria that can cause breakouts.',
    options: [
      { label: 'Every 2–3 days', value: 5 },
      { label: 'Weekly', value: 4 },
      { label: 'Every 2 weeks', value: 3 },
      { label: 'Monthly', value: 2 },
      { label: 'Rarely', value: 1 },
    ],
  },

  // ===== SECTION 5: SKIN CONCERNS (5 questions) =====
  {
    id: 'sc_acne',
    section: 'skin_concerns',
    question: 'How often do you experience acne or breakouts?',
    options: [
      { label: 'Never', value: 5 },
      { label: 'Rarely — occasional pimple', value: 4 },
      { label: 'Sometimes — a few per month', value: 3 },
      { label: 'Often — weekly breakouts', value: 2 },
      { label: 'Constantly — persistent acne', value: 1 },
    ],
  },
  {
    id: 'sc_pigmentation',
    section: 'skin_concerns',
    question: 'Do you have dark spots, hyperpigmentation, or uneven skin tone?',
    options: [
      { label: 'None — even skin tone', value: 5 },
      { label: 'Very mild — barely noticeable', value: 4 },
      { label: 'Moderate — some visible spots', value: 3 },
      { label: 'Significant — many dark spots', value: 2 },
      { label: 'Severe — widespread discoloration', value: 1 },
    ],
  },
  {
    id: 'sc_wrinkles',
    section: 'skin_concerns',
    question: 'How would you describe your fine lines or wrinkles?',
    options: [
      { label: 'None visible', value: 5 },
      { label: 'Very fine lines when smiling', value: 4 },
      { label: 'Noticeable fine lines at rest', value: 3 },
      { label: 'Moderate wrinkles', value: 2 },
      { label: 'Deep wrinkles', value: 1 },
    ],
  },
  {
    id: 'sc_dullness',
    section: 'skin_concerns',
    question: 'How would you rate your skin radiance?',
    options: [
      { label: 'Glowing and radiant', value: 5 },
      { label: 'Mostly bright', value: 4 },
      { label: 'Sometimes dull', value: 3 },
      { label: 'Often dull and tired-looking', value: 2 },
      { label: 'Constantly dull and lifeless', value: 1 },
    ],
  },
  {
    id: 'sc_redness',
    section: 'skin_concerns',
    question: 'Do you experience persistent redness or irritation?',
    options: [
      { label: 'Never', value: 5 },
      { label: 'Rarely', value: 4 },
      { label: 'Sometimes', value: 3 },
      { label: 'Often', value: 2 },
      { label: 'Constantly — diagnosed rosacea or dermatitis', value: 1 },
    ],
  },
];

// ==========================================
// Scoring
// ==========================================

export interface SkinScoreResult {
  skin_basics: number;
  lifestyle: number;
  nutrition: number;
  skin_habits: number;
  skin_concerns: number;
  overall: number;
}

export function calculateSkinScores(answers: Record<string, number>): SkinScoreResult {
  const sectionIds: SkinSectionId[] = [
    'skin_basics', 'lifestyle', 'nutrition', 'skin_habits', 'skin_concerns',
  ];

  const scores: Record<string, number> = {};

  for (const sId of sectionIds) {
    const qs = skinQuestions.filter(q => q.section === sId);
    const answered = qs.filter(q => answers[q.id] !== undefined);
    if (answered.length === 0) { scores[sId] = 0; continue; }
    const total = answered.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
    const max = answered.length * 5;
    scores[sId] = Math.round((total / max) * 100);
  }

  const vals = sectionIds.map(s => scores[s]);
  const overall = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);

  return { ...scores, overall } as unknown as SkinScoreResult;
}

export function getSkinScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Attention';
}

export function getSkinScoreColor(score: number): string {
  if (score >= 80) return 'text-score-excellent';
  if (score >= 60) return 'text-score-good';
  if (score >= 40) return 'text-score-fair';
  return 'text-score-poor';
}

export function getSkinRecommendations(scores: SkinScoreResult): string[] {
  const recs: string[] = [];

  if (scores.skin_basics < 60) {
    recs.push('Focus on hydration — use a hyaluronic acid serum to boost skin moisture levels.');
    recs.push('Consider adding a retinoid to your routine to improve skin elasticity and texture.');
  }
  if (scores.lifestyle < 60) {
    recs.push('Aim for 7-9 hours of quality sleep — skin repairs itself during deep sleep.');
    recs.push('Manage stress with meditation or yoga — cortisol accelerates skin aging.');
    recs.push('Increase water intake to at least 8 glasses daily for better skin hydration.');
  }
  if (scores.nutrition < 60) {
    recs.push('Reduce sugar intake — glycation damages collagen and causes premature aging.');
    recs.push('Eat more omega-3 rich foods (salmon, walnuts) to reduce skin inflammation.');
    recs.push('Add antioxidant-rich foods like berries and green tea to protect against free radicals.');
  }
  if (scores.skin_habits < 60) {
    recs.push('Apply broad-spectrum SPF 30+ sunscreen every day — UV is the #1 cause of skin aging.');
    recs.push('Exfoliate 1-2 times per week with a gentle chemical exfoliant (AHA/BHA).');
    recs.push('Never skip moisturizer — even oily skin needs hydration to maintain its barrier.');
  }
  if (scores.skin_concerns < 60) {
    recs.push('For acne: consider niacinamide and salicylic acid in your routine.');
    recs.push('For pigmentation: use vitamin C serum in the morning and always wear sunscreen.');
    recs.push('For dullness: try a weekly brightening mask with glycolic acid.');
  }
  if (scores.overall >= 80) {
    recs.push('Your skin health is excellent! Maintain your current routine and reassess periodically.');
  }
  if (scores.overall >= 60 && scores.overall < 80) {
    recs.push('Your skin is in good shape. Focus on the lowest-scoring areas for noticeable improvements.');
  }

  return recs;
}

export function getSkinQuestionsForSection(sectionId: SkinSectionId): SkinQuestion[] {
  return skinQuestions.filter(q => q.section === sectionId);
}
