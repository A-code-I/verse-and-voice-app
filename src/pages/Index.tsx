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
import DevotionalCards from '@/components/DevotionalCards';
import { useToast } from "@/hooks/use-toast";
import { LogOut, Users, BookOpen, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import SermonLibrary from '@/components/SermonLibrary';

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

export interface DevotionalReading {
  id: string;
  title: string;
  type: string;
  devotional_date: string;
  bible_references: string[];
  content: string;
  created_at: string;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [devotionals, setDevotionals] = useState<DevotionalReading[]>([]);
  const [currentSermon, setCurrentSermon] = useState<Sermon | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showDevotional, setShowDevotional] = useState(false);
  const [showDevotionalManagement, setShowDevotionalManagement] = useState(false);
  const [showSermonLibrary, setShowSermonLibrary] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string>('');
  const [expandedSermons, setExpandedSermons] = useState(false);
  const [expandedDevotionals, setExpandedDevotionals] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const { toast } = useToast();

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

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        
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

  const fetchSermons = async () => {
    try {
      const { data: sermonsData, error: sermonsError } = await supabase
        .from('sermons')
        .select('*')
        .order('sermon_date', { ascending: false });

      if (sermonsError) throw sermonsError;

      if (user) {
        const { data: likesData, error: likesError } = await supabase
          .from('user_sermon_likes')
          .select('sermon_id')
          .eq('user_id', user.id);

        if (likesError) {
          console.error('Error fetching likes:', likesError);
        }

        const likedSermonIds = new Set(likesData?.map(like => like.sermon_id) || []);

        const sermonsWithLikes = sermonsData?.map(sermon => ({
          ...sermon,
          liked: likedSermonIds.has(sermon.id),
          bible_references: sermon.bible_references || []
        })) || [];

        setSermons(sermonsWithLikes);
      } else {
        setSermons(sermonsData?.map(sermon => ({
          ...sermon,
          liked: false,
          bible_references: sermon.bible_references || []
        })) || []);
      }
    } catch (error) {
      console.error('Error fetching sermons:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sermons",
        variant: "destructive",
      });
    }
  };

  const fetchDevotionals = async () => {
    try {
      const { data, error } = await supabase
        .from('devotionals')
        .select('*')
        .order('devotional_date', { ascending: false })
        .limit(3);

      if (error) throw error;
      setDevotionals(data || []);
    } catch (error) {
      console.error('Error fetching devotionals:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('sermon_categories')
        .select('name')
        .order('name');

      if (error) throw error;
      const categoryNames = data?.map(cat => cat.name) || [];
      setCategories(categoryNames);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    if (userProfile?.has_access) {
      fetchSermons();
      fetchDevotionals();
      fetchCategories();
    }
  }, [userProfile, user]);

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
      setShowSermonLibrary(false);
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

  const handleLikeSermon = async (sermonId: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to like sermons",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Handling like for sermon:', sermonId, 'by user:', user.id);

      const { data: existingLike, error: fetchError } = await supabase
        .from('user_sermon_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('sermon_id', sermonId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing like:', fetchError);
        return;
      }

      if (existingLike) {
        const { error: deleteError } = await supabase
          .from('user_sermon_likes')
          .delete()
          .eq('id', existingLike.id);

        if (deleteError) {
          console.error('Error removing like:', deleteError);
          toast({
            title: "Error",
            description: "Failed to remove like",
            variant: "destructive",
          });
          return;
        }

        const { error: updateError } = await supabase
          .from('sermons')
          .update({ 
            likes: Math.max(0, (sermons.find(s => s.id === sermonId)?.likes || 1) - 1)
          })
          .eq('id', sermonId);

        if (updateError) {
          console.error('Error updating likes count:', updateError);
        }

        console.log('Sermon unliked successfully');
      } else {
        const { error: insertError } = await supabase
          .from('user_sermon_likes')
          .insert({ 
            user_id: user.id, 
            sermon_id: sermonId 
          });

        if (insertError) {
          console.error('Error adding like:', insertError);
          toast({
            title: "Error",
            description: "Failed to add like",
            variant: "destructive",
          });
          return;
        }

        const { error: updateError } = await supabase
          .from('sermons')
          .update({ 
            likes: (sermons.find(s => s.id === sermonId)?.likes || 0) + 1
          })
          .eq('id', sermonId);

        if (updateError) {
          console.error('Error updating likes count:', updateError);
        }

        console.log('Sermon liked successfully');
      }

      await fetchSermons();

      toast({
        title: existingLike ? "Unliked" : "Liked",
        description: existingLike ? "Removed from favorites" : "Added to favorites",
      });

    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  };

  const resetNavigation = () => {
    setShowAdmin(false);
    setShowUserManagement(false);
    setShowDevotional(false);
    setShowDevotionalManagement(false);
    setShowSermonLibrary(false);
    setCurrentSermon(null);
    setExpandedSermons(false);
    setExpandedDevotionals(false);
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
        <header className="text-center mb-12">
          <div className="flex justify-between items-center mb-6">
            <div></div>
            <h1 className="text-5xl font-bible font-bold text-white animate-fade-in">
              Word from Living God
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
          
          <div className="flex justify-center gap-4 flex-wrap">
            <Button 
              onClick={() => {
                resetNavigation();
              }}
              variant={!showAdmin && !showUserManagement && !showDevotional && !showDevotionalManagement && !showSermonLibrary ? "default" : "outline"}
              className={!showAdmin && !showUserManagement && !showDevotional && !showDevotionalManagement && !showSermonLibrary
                ? "bg-bible-gold text-bible-navy hover:bg-bible-gold/80" 
                : "bg-white/20 border-white/30 text-white hover:bg-white/30"
              }
            >
              Home
            </Button>

            <Button 
              onClick={() => {
                resetNavigation();
                setShowSermonLibrary(true);
              }}
              variant={showSermonLibrary ? "default" : "outline"}
              className={showSermonLibrary
                ? "bg-bible-gold text-bible-navy hover:bg-bible-gold/80" 
                : "bg-white/20 border-white/30 text-white hover:bg-white/30"
              }
            >
              <Calendar className="h-4 w-4 mr-2" />
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

        {showDevotionalManagement && userProfile?.role === 'admin' ? (
          <DevotionalManagement />
        ) : showDevotional ? (
          <DailyDevotional />
        ) : showSermonLibrary ? (
          <SermonLibrary 
            sermons={sermons}
            categories={categories}
            onLikeSermon={handleLikeSermon}
          />
        ) : showUserManagement && userProfile?.role === 'admin' ? (
          <UserManagement />
        ) : showAdmin && userProfile?.role === 'admin' ? (
          <AdminPanel 
            categories={categories}
            onRefreshSermons={fetchSermons}
          />
        ) : (
          <div className="space-y-8">
            <DailyVerse />
            
            <Card className="glass-effect border-white/20 text-white">
              <CardHeader 
                className="cursor-pointer hover:bg-white/10 transition-colors rounded-t-lg"
                onClick={() => setExpandedDevotionals(!expandedDevotionals)}
              >
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-bible flex items-center gap-2">
                    <BookOpen className="h-6 w-6" />
                    Daily Devotionals
                  </CardTitle>
                  <div className="flex items-center gap-2 text-white/60">
                    <span className="text-sm">
                      {expandedDevotionals ? 'Click to minimize' : 'Click to expand'}
                    </span>
                    {expandedDevotionals ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </CardHeader>
              {expandedDevotionals && (
                <CardContent>
                  <DevotionalCards devotionals={devotionals} />
                </CardContent>
              )}
            </Card>

            <Card className="glass-effect border-white/20 text-white">
              <CardHeader 
                className="cursor-pointer hover:bg-white/10 transition-colors rounded-t-lg"
                onClick={() => setExpandedSermons(!expandedSermons)}
              >
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-bible flex items-center gap-2">
                    <Calendar className="h-6 w-6" />
                    Latest Bible Sermons
                  </CardTitle>
                  <div className="flex items-center gap-2 text-white/60">
                    <span className="text-sm">
                      {expandedSermons ? 'Click to minimize' : 'Click to expand'}
                    </span>
                    {expandedSermons ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </CardHeader>
              {expandedSermons && (
                <CardContent>
                  <SermonSection 
                    sermons={sermons}
                    categories={categories}
                    onSelectSermon={setCurrentSermon}
                    onLikeSermon={handleLikeSermon}
                    currentSermon={currentSermon}
                    onViewAllSermons={() => {
                      resetNavigation();
                      setShowSermonLibrary(true);
                    }}
                  />
                </CardContent>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
