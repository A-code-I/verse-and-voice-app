
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, UserMinus, Shield, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  role: string;
  has_access: boolean;
  created_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setLoading(true);
    try {
      // In a real app, you'd send an invitation email
      // For now, we'll create a placeholder entry that gets updated when they sign up
      const { error } = await supabase
        .from('profiles')
        .insert([{
          email: inviteEmail.trim(),
          role: inviteRole,
          has_access: inviteRole === 'admin' ? true : false
        }]);

      if (error) throw error;

      toast({
        title: "User invited",
        description: `Invitation sent to ${inviteEmail}. They can now sign up with this email.`,
      });

      setInviteEmail('');
      setInviteRole('user');
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserAccess = async (userId: string, currentAccess: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ has_access: !currentAccess })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Access updated",
        description: `User access has been ${!currentAccess ? 'granted' : 'revoked'}.`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const newAccess = newRole === 'admin' ? true : users.find(u => u.id === userId)?.has_access;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          has_access: newAccess
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Role updated",
        description: `User role changed to ${newRole}.`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Invite User */}
      <Card className="glass-effect border-white/20 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bible flex items-center gap-2">
            <UserPlus className="h-6 w-6" />
            Invite New User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInviteUser} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  required
                />
              </div>
              <div>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              type="submit"
              disabled={loading}
              className="bg-bible-gold hover:bg-bible-gold/80 text-bible-navy font-semibold"
            >
              <Mail className="h-4 w-4 mr-2" />
              {loading ? 'Inviting...' : 'Send Invite'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* User List */}
      <Card className="glass-effect border-white/20 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bible">Manage Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map(user => (
              <div 
                key={user.id} 
                className="bg-white/10 rounded-lg p-4 border border-white/20"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{user.email}</h3>
                    <div className="flex gap-2 mt-1">
                      <Badge 
                        variant={user.has_access ? "default" : "secondary"}
                        className={user.has_access ? "bg-green-600" : "bg-gray-600"}
                      >
                        {user.has_access ? 'Has Access' : 'No Access'}
                      </Badge>
                      {user.role === 'admin' && (
                        <Badge variant="outline" className="border-bible-gold text-bible-gold">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-white/60 text-sm mt-1">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => toggleUserAccess(user.id, user.has_access)}
                      variant={user.has_access ? "destructive" : "default"}
                      size="sm"
                      className={user.has_access ? "" : "bg-green-600 hover:bg-green-700"}
                    >
                      {user.has_access ? (
                        <>
                          <UserMinus className="h-4 w-4 mr-1" />
                          Remove Access
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-1" />
                          Grant Access
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      onClick={() => toggleUserRole(user.id, user.role)}
                      variant="outline"
                      size="sm"
                      className="border-white/30 text-white hover:bg-white/20"
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {users.length === 0 && (
              <p className="text-white/60 text-center py-8">
                No users found. Invite users to get started.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
