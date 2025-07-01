
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from '@supabase/supabase-js';
import LoginPage from "@/components/LoginPage";
import ProtectedContent from "@/components/ProtectedContent";
import { useUserStatistics } from "@/hooks/useUserStatistics";
import { useAuthSettings } from "@/hooks/useAuthSettings";

export interface Sermon {
  id: string;
  title: string;
  category: string;
  youtube_url: string;
  audio_drive_url?: string;
  description?: string;
  bible_references?: string[];
  sermon_date: string;
  likes: number;
  liked?: boolean;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { recordUserStatistics, checkHostChanges } = useUserStatistics();
  const { authEnabled, loading: authSettingsLoading } = useAuthSettings();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Record user statistics on login
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            recordUserStatistics(session.user.id);
            checkHostChanges(session.user.id);
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Record statistics for existing session
      if (session?.user) {
        setTimeout(() => {
          recordUserStatistics(session.user.id);
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [recordUserStatistics, checkHostChanges]);

  // Show loading while checking auth settings
  if (authSettingsLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bible-navy via-bible-purple to-bible-navy flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bible-gold mx-auto"></div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is disabled, show content directly
  if (!authEnabled) {
    return <ProtectedContent user={user} session={session} />;
  }

  // If authentication is enabled, check if user is logged in
  if (!user || !session) {
    return <LoginPage />;
  }

  return <ProtectedContent user={user} session={session} />;
};

export default Index;
