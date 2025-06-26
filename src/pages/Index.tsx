import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import DailyVerse from '@/components/DailyVerse';
import SermonSection from '@/components/SermonSection';
import AudioPlayer from '@/components/AudioPlayer';
import AdminPanel from '@/components/AdminPanel';
import LoginPage from '@/components/LoginPage';
import ProtectedContent from '@/components/ProtectedContent';
import UserManagement from '@/components/UserManagement';
import DailyDevotional from '@/components/DailyDevotional';
import DevotionalManagement from '@/components/DevotionalManagement';
import { useToast } from "@/hooks/use-toast";
import { LogOut, Users, BookOpen, Calendar } from "lucide-react";

export interface Sermon {
  id: string;
  title: string;
  category: string;
  youtube_url?: string;
  audio_drive_url?: string;
  description: string;
  bible_references: string[];
  sermon_date: string;
  likes: number;
  liked?: boolean;
  gdoc_summary_url?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  has_access: boolean;
  created_at: string;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [currentSermon, setCurrentSermon] = useState<Sermon | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showDevotional, setShowDevotional] = useState(false);
  const [showDevotionalManagement, setShowDevotionalManagement] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string>('');
  const { toast } = useToast();

  const categories = [
    'Sunday Service',
    'Wednesday Service', 
    'Saturday Service',
    'Revival Meeting',
    'Anniversary',
    'Special Sunday School',
    'Youth Meeting',
    'Testimonies',
    'Special Meeting',
    'Topic Wise'
  ];

  // Initialize auth
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile with better error handling
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      // First, try to get the profile directly
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile');
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                email: userData.user.email,
                role: 'user',
                has_access: false
              });
            
            if (!insertError) {
              // Fetch the newly created profile
              const { data: newProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
              
              if (newProfile) {
                setUserProfile(newProfile);
                console.log('New profile created:', newProfile);
              }
            }
          }
        }
        return;
      }
      
      setUserProfile(data);
      console.log('User profile loaded:', data);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  // Fetch sermons
  const fetchSermons = async () => {
    try {
      const { data, error } = await supabase
        .from('sermons')
        .select('*')
        .order('sermon_date', { ascending: false });

      if (error) throw error;
      setSermons(data || []);
    } catch (error) {
      console.error('Error fetching sermons:', error);
    }
  };

  useEffect(() => {
    if (userProfile?.has_access) {
      fetchSermons();
    }
  }, [userProfile]);

  // Authentication functions
  const handleLogin = async (email: string, password: string) => {
    try {
      setAuthError('');
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      setAuthError(error.message);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      setAuthError(error.message);
      toast({
        title: "Google login failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setShowAdmin(false);
      setShowUserManagement(false);
      setShowDevotional(false);
      setShowDevotionalManagement(false);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Sermon functions
  const handleLikeSermon = async (sermondId: string) => {
    if (!user) return;

    try {
      const { data: existingLike } = await supabase
        .from('user_sermon_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('sermon_id', sermondId)
        .single();

      if (existingLike) {
        await supabase
          .from('user_sermon_likes')
          .delete()
          .eq('id', existingLike.id);
      } else {
        await supabase
          .from('user_sermon_likes')
          .insert({ user_id: user.id, sermon_id: sermondId });
      }

      fetchSermons();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const resetNavigation = () => {
    setShowAdmin(false);
    setShowUserManagement(false);
    setShowDevotional(false);
    setShowDevotionalManagement(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginPage 
        onLogin={handleLogin}
        onGoogleLogin={handleGoogleLogin}
        error={authError}
      />
    );
  }

  // Check if user has access or is admin
  const hasAccess = userProfile?.has_access || userProfile?.role === 'admin';

  if (!hasAccess) {
    return (
      <ProtectedContent
        isAuthenticated={!!user}
        hasPermission={false}
        onLogin={() => {}}
      >
        <div></div>
      </ProtectedContent>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex justify-between items-center mb-6">
            <div></div>
            <h1 className="text-5xl font-bible font-bold text-white animate-fade-in">
              Living Word Ministry
            </h1>
            <div className="flex gap-2">
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
          <p className="text-xl text-white/80 animate-fade-in mb-6">
            Feeding souls with God's eternal truth
          </p>
          
          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 flex-wrap">
            <Button 
              onClick={() => {
                resetNavigation();
              }}
              variant={!showAdmin && !showUserManagement && !showDevotional && !showDevotionalManagement ? "default" : "outline"}
              className={!showAdmin && !showUserManagement && !showDevotional && !showDevotionalManagement
                ? "bg-bible-gold text-bible-navy hover:bg-bible-gold/80" 
                : "bg-white/20 border-white/30 text-white hover:bg-white/30"
              }
            >
              Sermons
            </Button>
            
            <Button 
              onClick={() => {
                resetNavigation();
                setShowDevotional(true);
              }}
              variant={showDevotional ? "default" : "outline"}
              className={showDevotional
                ? "bg-bible-gold text-bible-navy hover:bg-bible-gold/80" 
                : "bg-white/20 border-white/30 text-white hover:bg-white/30"
              }
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Daily Devotional
            </Button>

            {userProfile?.role === 'admin' && (
              <>
                <Button 
                  onClick={() => {
                    resetNavigation();
                    setShowAdmin(true);
                  }}
                  variant={showAdmin ? "default" : "outline"}
                  className={showAdmin
                    ? "bg-bible-gold text-bible-navy hover:bg-bible-gold/80" 
                    : "bg-white/20 border-white/30 text-white hover:bg-white/30"
                  }
                >
                  Admin Panel
                </Button>
                
                <Button 
                  onClick={() => {
                    resetNavigation();
                    setShowUserManagement(true);
                  }}
                  variant={showUserManagement ? "default" : "outline"}
                  className={showUserManagement
                    ? "bg-bible-gold text-bible-navy hover:bg-bible-gold/80" 
                    : "bg-white/20 border-white/30 text-white hover:bg-white/30"
                  }
                >
                  <Users className="h-4 w-4 mr-2" />
                  Users
                </Button>

                <Button 
                  onClick={() => {
                    resetNavigation();
                    setShowDevotionalManagement(true);
                  }}
                  variant={showDevotionalManagement ? "default" : "outline"}
                  className={showDevotionalManagement
                    ? "bg-bible-gold text-bible-navy hover:bg-bible-gold/80" 
                    : "bg-white/20 border-white/30 text-white hover:bg-white/30"
                  }
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Manage Devotionals
                </Button>
              </>
            )}
          </div>
        </header>

        {/* Content Sections */}
        {showDevotionalManagement && userProfile?.role === 'admin' ? (
          <DevotionalManagement />
        ) : showDevotional ? (
          <DailyDevotional />
        ) : showUserManagement && userProfile?.role === 'admin' ? (
          <UserManagement />
        ) : showAdmin && userProfile?.role === 'admin' ? (
          <AdminPanel 
            categories={categories}
            onRefreshSermons={fetchSermons}
          />
        ) : (
          <div className="grid gap-8">
            {/* Daily Verse */}
            <DailyVerse />

            {/* Sermon Categories */}
            <SermonSection 
              sermons={sermons}
              categories={categories}
              onSelectSermon={setCurrentSermon}
              onLikeSermon={handleLikeSermon}
              currentSermon={currentSermon}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
