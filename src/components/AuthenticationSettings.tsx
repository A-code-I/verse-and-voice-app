
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, AlertTriangle } from "lucide-react";
import { useAuthSettings } from "@/hooks/useAuthSettings";

const AuthenticationSettings = () => {
  const { authEnabled, loading, toggleAuthentication } = useAuthSettings();

  if (loading) {
    return (
      <Card className="glass-effect border-white/20 text-white">
        <CardContent className="p-6">
          <div className="text-center">Loading authentication settings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect border-white/20 text-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bible flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Authentication Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg border border-white/20">
          <div className="space-y-2">
            <Label htmlFor="auth-toggle" className="text-lg font-semibold">
              Require Authentication
            </Label>
            <p className="text-white/70 text-sm">
              When disabled, users can access the application without logging in
            </p>
          </div>
          <Switch
            id="auth-toggle"
            checked={authEnabled}
            onCheckedChange={toggleAuthentication}
            className="data-[state=checked]:bg-bible-gold"
          />
        </div>
        
        {!authEnabled && (
          <div className="flex items-start gap-3 p-4 bg-orange-500/20 border border-orange-500/30 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-orange-300">Authentication Disabled</h4>
              <p className="text-orange-200 text-sm mt-1">
                The application is currently open to everyone. Enable authentication to restrict access to authorized users only.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthenticationSettings;
