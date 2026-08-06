CREATE TABLE public.vault_keys (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  salt TEXT NOT NULL,
  verifier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vault_keys TO authenticated;
GRANT ALL ON public.vault_keys TO service_role;

ALTER TABLE public.vault_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vault key" ON public.vault_keys FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own vault key" ON public.vault_keys FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own vault key" ON public.vault_keys FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own vault key" ON public.vault_keys FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_vault_keys_updated_at BEFORE UPDATE ON public.vault_keys FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();