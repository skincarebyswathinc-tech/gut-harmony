
-- User roles table for practitioner identification
CREATE TYPE public.app_role AS ENUM ('user', 'practitioner');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Shared reports table
CREATE TABLE public.shared_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_user_id uuid NOT NULL,
  practitioner_email text NOT NULL,
  practitioner_user_id uuid,
  share_token text NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  assessment_id uuid REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'expired')),
  shared_at timestamp with time zone NOT NULL DEFAULT now(),
  viewed_at timestamp with time zone,
  UNIQUE (share_token)
);

ALTER TABLE public.shared_reports ENABLE ROW LEVEL SECURITY;

-- Patients can view/create their own shares
CREATE POLICY "Patients can view own shared reports"
  ON public.shared_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = patient_user_id);

CREATE POLICY "Patients can create shared reports"
  ON public.shared_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = patient_user_id);

-- Practitioners can view reports shared to them
CREATE POLICY "Practitioners can view reports shared to them"
  ON public.shared_reports FOR SELECT
  TO authenticated
  USING (practitioner_user_id = auth.uid());

CREATE POLICY "Practitioners can update shared reports"
  ON public.shared_reports FOR UPDATE
  TO authenticated
  USING (practitioner_user_id = auth.uid());

-- Practitioner notes table
CREATE TABLE public.practitioner_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_report_id uuid REFERENCES public.shared_reports(id) ON DELETE CASCADE NOT NULL,
  practitioner_user_id uuid NOT NULL,
  note text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.practitioner_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Practitioners can manage own notes"
  ON public.practitioner_notes FOR ALL
  TO authenticated
  USING (practitioner_user_id = auth.uid())
  WITH CHECK (practitioner_user_id = auth.uid());

-- Add practitioner profile fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS practice_name text,
  ADD COLUMN IF NOT EXISTS specialization text,
  ADD COLUMN IF NOT EXISTS license_number text;

-- Trigger for auto-assigning user role on signup
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_role();
