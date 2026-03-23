
CREATE TABLE public.risk_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_address TEXT NOT NULL,
  token_in TEXT NOT NULL,
  token_out TEXT NOT NULL,
  amount_in FLOAT NOT NULL,
  safety_score INTEGER NOT NULL,
  sandwich_risk INTEGER NOT NULL,
  liquidity_health INTEGER NOT NULL,
  wallet_risk INTEGER NOT NULL,
  explanation TEXT,
  recommendation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Edge function can insert assessments"
  ON public.risk_assessments FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view risk assessments"
  ON public.risk_assessments FOR SELECT USING (true);

CREATE INDEX idx_risk_assessments_address ON public.risk_assessments (user_address);
CREATE INDEX idx_risk_assessments_created ON public.risk_assessments (created_at DESC);
