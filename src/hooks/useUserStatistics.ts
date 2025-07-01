
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useUserStatistics = () => {
  const { toast } = useToast();

  const generateHostId = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Browser fingerprint', 2, 2);
    
    const fingerprint = canvas.toDataURL();
    const navigator_info = navigator.userAgent + navigator.language + screen.width + screen.height;
    
    return btoa(fingerprint + navigator_info).slice(0, 32);
  };

  const recordUserStatistics = async (userId: string) => {
    try {
      const hostId = generateHostId();
      const userAgent = navigator.userAgent;
      
      console.log('Recording user statistics for user:', userId, 'with host ID:', hostId);
      
      const { error } = await supabase
        .from('user_statistics')
        .insert({
          user_id: userId,
          host_id: hostId,
          login_timestamp: new Date().toISOString(),
          user_agent: userAgent
        });

      if (error) {
        console.error('Error recording user statistics:', error);
        throw error;
      }

      console.log('User statistics recorded successfully');
    } catch (error: any) {
      console.error('Failed to record user statistics:', error);
      toast({
        title: "Warning",
        description: "Failed to record login statistics",
        variant: "destructive",
      });
    }
  };

  const checkHostChanges = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', userId)
        .eq('host_id', 'HOST_CHANGE_DETECTED')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        console.log('Host change detected for user:', userId);
        // Here you would implement email notification logic
        // For now, we'll just show a toast
        toast({
          title: "Security Alert",
          description: "Host change detected - Admin has been notified",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error checking host changes:', error);
    }
  };

  return {
    recordUserStatistics,
    checkHostChanges
  };
};
