
-- Create table for user statistics tracking
CREATE TABLE public.user_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  host_id TEXT NOT NULL,
  login_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for drive sermons (separate from regular sermons)
CREATE TABLE public.drive_sermons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  drive_audio_url TEXT NOT NULL,
  description TEXT,
  bible_references TEXT[] DEFAULT '{}',
  sermon_date DATE NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for drive sermon likes
CREATE TABLE public.user_drive_sermon_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  drive_sermon_id UUID REFERENCES public.drive_sermons(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, drive_sermon_id)
);

-- Create table for authentication settings
CREATE TABLE public.auth_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_name TEXT UNIQUE NOT NULL,
  setting_value BOOLEAN DEFAULT true,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default auth setting
INSERT INTO public.auth_settings (setting_name, setting_value) 
VALUES ('authentication_enabled', true);

-- Enable RLS
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drive_sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_drive_sermon_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_statistics
CREATE POLICY "Admins can view all statistics" 
  ON public.user_statistics 
  FOR SELECT 
  USING (is_admin());

CREATE POLICY "System can insert statistics" 
  ON public.user_statistics 
  FOR INSERT 
  WITH CHECK (true);

-- RLS Policies for drive_sermons
CREATE POLICY "Users with access can view drive sermons" 
  ON public.drive_sermons 
  FOR SELECT 
  USING ((auth.uid() IS NOT NULL) AND (is_admin() OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.has_access = true))))));

CREATE POLICY "Admins can manage drive sermons" 
  ON public.drive_sermons 
  FOR ALL 
  USING (is_admin());

-- RLS Policies for drive sermon likes
CREATE POLICY "Users can manage their own drive sermon likes" 
  ON public.user_drive_sermon_likes 
  FOR ALL 
  USING (auth.uid() = user_id);

-- RLS Policies for auth_settings
CREATE POLICY "Admins can manage auth settings" 
  ON public.auth_settings 
  FOR ALL 
  USING (is_admin());

CREATE POLICY "Anyone can read auth settings" 
  ON public.auth_settings 
  FOR SELECT 
  USING (true);

-- Function to update drive sermon likes count
CREATE OR REPLACE FUNCTION update_drive_sermon_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.drive_sermons 
    SET likes = likes + 1 
    WHERE id = NEW.drive_sermon_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.drive_sermons 
    SET likes = likes - 1 
    WHERE id = OLD.drive_sermon_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for drive sermon likes
CREATE TRIGGER update_drive_sermon_likes_trigger
  AFTER INSERT OR DELETE ON public.user_drive_sermon_likes
  FOR EACH ROW EXECUTE FUNCTION update_drive_sermon_likes_count();

-- Function to detect host changes and trigger email
CREATE OR REPLACE FUNCTION check_host_change()
RETURNS TRIGGER AS $$
DECLARE
  last_host_id TEXT;
BEGIN
  -- Get the last host_id for this user
  SELECT host_id INTO last_host_id
  FROM public.user_statistics
  WHERE user_id = NEW.user_id
  ORDER BY created_at DESC
  LIMIT 1 OFFSET 1;

  -- If host changed, we'll handle the email notification in the application
  IF last_host_id IS NOT NULL AND last_host_id != NEW.host_id THEN
    -- Insert a notification record that the application can pick up
    INSERT INTO public.user_statistics (user_id, host_id, login_timestamp, ip_address, user_agent)
    VALUES (NEW.user_id, 'HOST_CHANGE_DETECTED', now(), NEW.ip_address, 'Host change notification');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for host change detection
CREATE TRIGGER detect_host_change_trigger
  AFTER INSERT ON public.user_statistics
  FOR EACH ROW EXECUTE FUNCTION check_host_change();
