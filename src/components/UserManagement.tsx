
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserPlus, UserMinus, Shield } from "lucide-react";

interface User {
  id: string;
  email: string;
  hasAccess: boolean;
  isAdmin: boolean;
  createdAt: string;
}

interface UserManagementProps {
  users: User[];
  onToggleAccess: (userId: string) => void;
  onToggleAdmin: (userId: string) => void;
  onInviteUser: (email: string) => void;
}

const UserManagement = ({ 
  users, 
  onToggleAccess, 
  onToggleAdmin, 
  onInviteUser 
}: UserManagementProps) => {
  const [inviteEmail, setInviteEmail] = useState('');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail.trim()) {
      onInviteUser(inviteEmail.trim());
      setInviteEmail('');
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
          <form onSubmit={handleInvite} className="flex gap-4">
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email address"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              required
            />
            <Button 
              type="submit"
              className="bg-bible-gold hover:bg-bible-gold/80 text-bible-navy font-semibold"
            >
              Send Invite
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
                        variant={user.hasAccess ? "default" : "secondary"}
                        className={user.hasAccess ? "bg-green-600" : "bg-gray-600"}
                      >
                        {user.hasAccess ? 'Has Access' : 'No Access'}
                      </Badge>
                      {user.isAdmin && (
                        <Badge variant="outline" className="border-bible-gold text-bible-gold">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-white/60 text-sm mt-1">
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => onToggleAccess(user.id)}
                      variant={user.hasAccess ? "destructive" : "default"}
                      size="sm"
                      className={user.hasAccess ? "" : "bg-green-600 hover:bg-green-700"}
                    >
                      {user.hasAccess ? (
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
                      onClick={() => onToggleAdmin(user.id)}
                      variant="outline"
                      size="sm"
                      className="border-white/30 text-white hover:bg-white/20"
                    >
                      {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
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
