
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuthSettings = () => {
  const [authEnabled, setAuthEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAuthSettings();
  }, []);

  const fetchAuthSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('auth_settings')
        .select('setting_value')
        .eq('setting_name', 'authentication_enabled')
        .single();

      if (error) throw error;
      
      setAuthEnabled(data?.setting_value || true);
    } catch (error: any) {
      console.error('Error fetching auth settings:', error);
      setAuthEnabled(true); // Default to enabled on error
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthentication = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('auth_settings')
        .update({ 
          setting_value: enabled,
          updated_at: new Date().toISOString()
        })
        .eq('setting_name', 'authentication_enabled');

      if (error) throw error;

      setAuthEnabled(enabled);
      toast({
        title: "Authentication Settings Updated",
        description: `Authentication has been ${enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error: any) {
      console.error('Error updating auth settings:', error);
      toast({
        title: "Error",
        description: "Failed to update authentication settings",
        variant: "destructive",
      });
    }
  };

  return {
    authEnabled,
    loading,
    toggleAuthentication
  };
};
