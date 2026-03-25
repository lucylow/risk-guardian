CREATE TABLE IF NOT EXISTS public.user_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address text NOT NULL UNIQUE,
  auto_protect_enabled boolean NOT NULL DEFAULT true,
  risk_threshold integer NOT NULL DEFAULT 60 CHECK (risk_threshold BETWEEN 0 AND 100),
  auto_adjust_slippage boolean NOT NULL DEFAULT true,
  notify_on_high_risk boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to user_settings"
  ON public.user_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
