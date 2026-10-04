CREATE TABLE public.copilot_conversations (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL UNIQUE, messages jsonb NOT NULL DEFAULT '[]'::jsonb, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.copilot_conversations TO authenticated;
GRANT ALL ON public.copilot_conversations TO service_role;
ALTER TABLE public.copilot_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage own copilot conversation" ON public.copilot_conversations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION public.touch_copilot_conversations() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER touch_copilot_conversations BEFORE UPDATE ON public.copilot_conversations FOR EACH ROW EXECUTE FUNCTION public.touch_copilot_conversations();