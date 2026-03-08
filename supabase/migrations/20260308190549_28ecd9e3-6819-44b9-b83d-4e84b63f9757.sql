
CREATE TABLE public.daily_gut_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  bloating smallint NOT NULL DEFAULT 0,
  gas smallint NOT NULL DEFAULT 0,
  acid_reflux smallint NOT NULL DEFAULT 0,
  abdominal_discomfort smallint NOT NULL DEFAULT 0,
  stool_type smallint,
  stool_frequency smallint DEFAULT 1,
  incomplete_evacuation boolean DEFAULT false,
  mucus_present boolean DEFAULT false,
  sleep_hours numeric(3,1),
  stress_level smallint NOT NULL DEFAULT 0,
  water_intake smallint DEFAULT 0,
  exercise_minutes smallint DEFAULT 0,
  energy_level smallint NOT NULL DEFAULT 0,
  mood smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, log_date)
);

ALTER TABLE public.daily_gut_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own logs" ON public.daily_gut_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own logs" ON public.daily_gut_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update own logs" ON public.daily_gut_logs
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
