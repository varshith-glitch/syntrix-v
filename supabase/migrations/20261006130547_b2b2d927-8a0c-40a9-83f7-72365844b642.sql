CREATE TABLE public.molecular_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  sessions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.molecular_sessions TO authenticated;
GRANT ALL ON public.molecular_sessions TO service_role;
ALTER TABLE public.molecular_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage molecular sessions" ON public.molecular_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER touch_molecular_sessions BEFORE UPDATE ON public.molecular_sessions FOR EACH ROW EXECUTE FUNCTION public.touch_copilot_conversations();