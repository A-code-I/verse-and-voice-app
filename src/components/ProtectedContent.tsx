import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";
import { Sermon } from "@/pages/Index";
import DailyVerse from "@/components/DailyVerse";
import SermonSection from "@/components/SermonSection";
import SermonLibrary from "@/components/SermonLibrary";
import DailyDevotional from "@/components/DailyDevotional";
import DriveSermonSection from "@/components/DriveSermonSection";
import AdminPanel from "@/components/AdminPanel";

interface ProtectedContentProps {
  user: User | null;
  session: Session | null;
}

const ProtectedContent = ({ user, session }: ProtectedContentProps) => {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentSermon, setCurrentSermon] = useState<Sermon | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'sermons' | 'admin'>('home');
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchSermons();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchSermons = async () => {
    setLoading(true);
    try {
      console.log('Fetching sermons...');
      const { data, error } = await supabase
        .from('sermons')
        .select('*')
        .order('sermon_date', { ascending: false });

      if (error) {
        console.error('Error fetching sermons:', error);
        throw error;
      }
      
      console.log('Fetched sermons:', data);

      // Check which sermons the user has liked
      if (user) {
        const { data: likedSermons } = await supabase
          .from('user_sermon_likes')
          .select('sermon_id')
          .eq('user_id', user.id);

        const likedIds = new Set(likedSermons?.map(like => like.sermon_id) || []);
        
        const sermonsWithLikes = (data || []).map(sermon => ({
          ...sermon,
          liked: likedIds.has(sermon.id)
        }));

        setSermons(sermonsWithLikes);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(sermonsWithLikes.map(sermon => sermon.category))];
        setCategories(uniqueCategories);
      } else {
        setSermons(data || []);
        const uniqueCategories = [...new Set((data || []).map(sermon => sermon.category))];
        setCategories(uniqueCategories);
      }
    } catch (error: any) {
      console.error('Error fetching sermons:', error);
      toast({
        title: "Error",
        description: `Failed to fetch sermons: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLikeSermon = async (sermonId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like sermons",
        variant: "destructive",
      });
      return;
    }

    try {
      const sermon = sermons.find(s => s.id === sermonId);
      if (!sermon) return;

      if (sermon.liked) {
        // Unlike the sermon
        const { error } = await supabase
          .from('user_sermon_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('sermon_id', sermonId);

        if (error) throw error;
      } else {
        // Like the sermon
        const { error } = await supabase
          .from('user_sermon_likes')
          .insert({
            user_id: user.id,
            sermon_id: sermonId
          });

        if (error) throw error;
      }

      // Update local state
      setSermons(sermons.map(s => 
        s.id === sermonId 
          ? { 
              ...s, 
              liked: !s.liked,
              likes: s.liked ? s.likes - 1 : s.likes + 1
            }
          : s
      ));

    } catch (error: any) {
      console.error('Error liking sermon:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Check if user has access (unless they're admin)
  if (user && userProfile && !userProfile.has_access && userProfile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bible-navy via-bible-purple to-bible-navy flex items-center justify-center">
        <div className="text-center text-white p-8">
          <h1 className="text-4xl font-bible mb-4">Access Pending</h1>
          <p className="text-xl mb-6">Your account is pending approval from an administrator.</p>
          <p className="text-white/70">Please contact the church administrator for access.</p>
          <button 
            onClick={handleLogout}
            className="mt-6 px-6 py-2 bg-bible-gold text-bible-navy rounded-lg hover:bg-bible-gold/80 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'admin') {
    return <AdminPanel onClose={() => setCurrentView('home')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bible-navy via-bible-purple to-bible-navy">
      {/* Header */}
      <header className="border-b border-white/20 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bible text-white">Faith Fellowship</h1>
              <nav className="hidden md:flex space-x-4">
                <button 
                  onClick={() => setCurrentView('home')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentView === 'home' 
                      ? 'bg-bible-gold text-bible-navy' 
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  Home
                </button>
                <button 
                  onClick={() => setCurrentView('sermons')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentView === 'sermons' 
                      ? 'bg-bible-gold text-bible-navy' 
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  All Sermons
                </button>
                {userProfile?.role === 'admin' && (
                  <button 
                    onClick={() => setCurrentView('admin')}
                    className="px-4 py-2 rounded-lg text-white hover:bg-white/20 transition-colors"
                  >
                    Admin
                  </button>
                )}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white hidden md:inline">
                Welcome, {userProfile?.email || user?.email}
              </span>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bible-gold mx-auto"></div>
            <p className="text-white/60 mt-4">Loading content...</p>
          </div>
        ) : (
          <>
            {currentView === 'home' && (
              <>
                <DailyVerse />
                <SermonSection 
                  sermons={sermons}
                  categories={categories}
                  onSelectSermon={setCurrentSermon}
                  onLikeSermon={handleLikeSermon}
                  currentSermon={currentSermon}
                  onViewAllSermons={() => setCurrentView('sermons')}
                />
                <DriveSermonSection />
                <DailyDevotional />
              </>
            )}
            
            {currentView === 'sermons' && (
              <SermonLibrary 
                sermons={sermons}
                categories={categories}
                onLikeSermon={handleLikeSermon}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ProtectedContent;
