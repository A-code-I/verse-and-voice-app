
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DriveSermon {
  id: string;
  title: string;
  category: string;
  drive_audio_url: string;
  description: string | null;
  bible_references: string[];
  sermon_date: string;
  likes: number;
  liked?: boolean;
  created_at: string;
  updated_at: string;
}

export const useDriveSermons = () => {
  const [sermons, setSermons] = useState<DriveSermon[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDriveSermons();
  }, []);

  const fetchDriveSermons = async () => {
    setLoading(true);
    try {
      console.log('Fetching drive sermons...');
      const { data, error } = await supabase
        .from('drive_sermons')
        .select('*')
        .order('sermon_date', { ascending: false });

      if (error) {
        console.error('Error fetching drive sermons:', error);
        throw error;
      }

      console.log('Fetched drive sermons:', data);

      // Check which sermons the user has liked
      const user = await supabase.auth.getUser();
      if (user.data.user) {
        const { data: likedSermons } = await supabase
          .from('user_drive_sermon_likes')
          .select('drive_sermon_id')
          .eq('user_id', user.data.user.id);

        const likedIds = new Set(likedSermons?.map(like => like.drive_sermon_id) || []);
        
        const sermonsWithLikes = (data || []).map(sermon => ({
          ...sermon,
          liked: likedIds.has(sermon.id)
        }));

        setSermons(sermonsWithLikes);
      } else {
        setSermons(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching drive sermons:', error);
      toast({
        title: "Error",
        description: "Failed to fetch drive sermons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addDriveSermon = async (sermonData: Omit<DriveSermon, 'id' | 'likes' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Adding drive sermon:', sermonData);
      const { data, error } = await supabase
        .from('drive_sermons')
        .insert(sermonData)
        .select()
        .single();

      if (error) throw error;

      console.log('Drive sermon added successfully:', data);
      toast({
        title: "Success",
        description: "Drive sermon added successfully",
      });

      fetchDriveSermons();
      return data;
    } catch (error: any) {
      console.error('Error adding drive sermon:', error);
      toast({
        title: "Error",
        description: `Failed to add drive sermon: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const likeDriveSermon = async (sermonId: string) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to like sermons",
          variant: "destructive",
        });
        return;
      }

      const sermon = sermons.find(s => s.id === sermonId);
      if (!sermon) return;

      if (sermon.liked) {
        // Unlike the sermon
        const { error } = await supabase
          .from('user_drive_sermon_likes')
          .delete()
          .eq('user_id', user.data.user.id)
          .eq('drive_sermon_id', sermonId);

        if (error) throw error;
      } else {
        // Like the sermon
        const { error } = await supabase
          .from('user_drive_sermon_likes')
          .insert({
            user_id: user.data.user.id,
            drive_sermon_id: sermonId
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
      console.error('Error liking drive sermon:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  };

  return {
    sermons,
    loading,
    fetchDriveSermons,
    addDriveSermon,
    likeDriveSermon
  };
};
