
CREATE TABLE public.food_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  logged_at timestamptz NOT NULL DEFAULT now(),
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  food_name text NOT NULL,
  food_category text NOT NULL,
  bloating smallint NOT NULL DEFAULT 0,
  gas smallint NOT NULL DEFAULT 0,
  reflux smallint NOT NULL DEFAULT 0,
  fatigue smallint NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own food logs" ON public.food_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own food logs" ON public.food_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update own food logs" ON public.food_logs
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own food logs" ON public.food_logs
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
