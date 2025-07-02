import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Monitor, Calendar, User, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserStatistic {
  id: string;
  user_id: string;
  host_id: string;
  login_timestamp: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  profiles?: {
    email: string;
  } | null;
}

const UserStatisticsPanel = () => {
  const [statistics, setStatistics] = useState<UserStatistic[]>([]);
  const [hostChanges, setHostChanges] = useState<UserStatistic[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      // Try to fetch user statistics with profile information
      const { data: stats, error: statsError } = await supabase
        .from('user_statistics')
        .select(`
          id,
          user_id,
          host_id,
          login_timestamp,
          ip_address,
          user_agent,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (statsError) {
        console.error('Error fetching statistics:', statsError);
        throw statsError;
      }

      if (stats) {
        // Convert ip_address from unknown to string | null and get profile data separately
        const processedStats: UserStatistic[] = [];
        
        for (const stat of stats) {
          // Fetch profile data separately for each user
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', stat.user_id)
            .single();

          const processedStat: UserStatistic = {
            ...stat,
            ip_address: stat.ip_address ? String(stat.ip_address) : null,
            profiles: profile ? { email: profile.email || 'Unknown' } : null
          };
          
          processedStats.push(processedStat);
        }

        // Separate regular statistics from host change notifications
        const regularStats = processedStats.filter(stat => stat.host_id !== 'HOST_CHANGE_DETECTED');
        const changes = processedStats.filter(stat => stat.host_id === 'HOST_CHANGE_DETECTED');

        setStatistics(regularStats);
        setHostChanges(changes);

        if (changes.length > 0) {
          toast({
            title: "Host Changes Detected",
            description: `${changes.length} potential security alerts found`,
            variant: "destructive",
          });
        }
      }

    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  function getUniqueUsers() {
    const uniqueUsers = new Set(statistics.map(stat => stat.user_id));
    return uniqueUsers.size;
  }

  function getUniqueHosts() {
    const uniqueHosts = new Set(statistics.map(stat => stat.host_id));
    return uniqueHosts.size;
  }

  function formatUserAgent(userAgent: string | null) {
    if (!userAgent) return 'Unknown';
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-effect border-white/20 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-bible-gold" />
              <div>
                <p className="text-2xl font-bold">{getUniqueUsers()}</p>
                <p className="text-white/70 text-sm">Unique Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-effect border-white/20 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Monitor className="h-8 w-8 text-bible-gold" />
              <div>
                <p className="text-2xl font-bold">{getUniqueHosts()}</p>
                <p className="text-white/70 text-sm">Unique Hosts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-effect border-white/20 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-bible-gold" />
              <div>
                <p className="text-2xl font-bold">{statistics.length}</p>
                <p className="text-white/70 text-sm">Total Logins</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Host Change Alerts */}
      {hostChanges.length > 0 && (
        <Card className="glass-effect border-red-500/30 text-white">
          <CardHeader>
            <CardTitle className="text-xl font-bible flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-6 w-6" />
              Security Alerts - Host Changes Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hostChanges.map(change => (
                <div key={change.id} className="bg-red-500/20 p-3 rounded-lg border border-red-500/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-red-300">
                        {change.profiles?.email || 'Unknown User'}
                      </p>
                      <p className="text-red-200 text-sm">
                        Host change detected at {new Date(change.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="destructive">
                      Security Alert
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent User Statistics */}
      <Card className="glass-effect border-white/20 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bible flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Recent User Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bible-gold mx-auto"></div>
              <p className="text-white/60 mt-2">Loading user statistics...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {statistics.map(stat => (
                <div 
                  key={stat.id} 
                  className="bg-white/10 rounded-lg p-4 border border-white/20"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold">
                          {stat.profiles?.email || 'Unknown User'}
                        </p>
                        <Badge variant="outline" className="border-white/30 text-white text-xs">
                          {formatUserAgent(stat.user_agent)}
                        </Badge>
                      </div>
                      <div className="text-white/70 text-sm space-y-1">
                        <p className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(stat.login_timestamp || stat.created_at).toLocaleString()}
                        </p>
                        <p className="flex items-center gap-2">
                          <Monitor className="h-3 w-3" />
                          Host ID: {stat.host_id.slice(0, 8)}...
                        </p>
                        {stat.ip_address && (
                          <p className="text-xs opacity-60">
                            IP: {stat.ip_address}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {statistics.length === 0 && (
                <p className="text-white/60 text-center py-8">
                  No user statistics found.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserStatisticsPanel;
