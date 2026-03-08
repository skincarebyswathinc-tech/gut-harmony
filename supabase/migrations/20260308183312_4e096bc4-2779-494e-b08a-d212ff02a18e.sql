
CREATE TABLE public.skin_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',
  scores JSONB NOT NULL DEFAULT '{}',
  overall_score NUMERIC,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.skin_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own skin assessments" ON public.skin_assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own skin assessments" ON public.skin_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
