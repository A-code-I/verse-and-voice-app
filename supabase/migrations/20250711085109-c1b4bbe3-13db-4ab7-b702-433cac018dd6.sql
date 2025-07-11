
-- Create a table to store sermon categories
CREATE TABLE public.sermon_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.sermon_categories ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage categories
CREATE POLICY "Admins can manage categories" 
  ON public.sermon_categories 
  FOR ALL 
  USING (is_admin());

-- Allow users with access to view categories
CREATE POLICY "Users with access can view categories" 
  ON public.sermon_categories 
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND 
    (is_admin() OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND has_access = true
    ))
  );

-- Insert the existing predefined categories
INSERT INTO public.sermon_categories (name) VALUES
  ('Sunday Service'),
  ('Wednesday Service'),
  ('Saturday Service'),
  ('Revival Meeting'),
  ('Anniversary'),
  ('Special Sunday School'),
  ('Youth Meeting'),
  ('Testimonies'),
  ('Special Meeting'),
  ('Topic Wise')
ON CONFLICT (name) DO NOTHING;
