-- Create table for saving schematic analyses
CREATE TABLE IF NOT EXISTS public.schematic_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  title TEXT NOT NULL,
  image_urls TEXT[] NOT NULL,
  analysis_sections JSONB NOT NULL,
  language TEXT NOT NULL DEFAULT 'ar',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.schematic_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Anyone can view analyses"
ON public.schematic_analyses
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create analyses"
ON public.schematic_analyses
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update analyses"
ON public.schematic_analyses
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete analyses"
ON public.schematic_analyses
FOR DELETE
USING (true);

-- Create index for better query performance
CREATE INDEX idx_schematic_analyses_created_at ON public.schematic_analyses(created_at DESC);
CREATE INDEX idx_schematic_analyses_language ON public.schematic_analyses(language);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_schematic_analyses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_schematic_analyses_timestamp
BEFORE UPDATE ON public.schematic_analyses
FOR EACH ROW
EXECUTE FUNCTION public.update_schematic_analyses_updated_at();