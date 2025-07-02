
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface ProtectedContentProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  hasPermission: boolean;
  onLogin: () => void;
}

const ProtectedContent = ({ 
  children, 
  isAuthenticated, 
  hasPermission, 
  onLogin 
}: ProtectedContentProps) => {
  if (!isAuthenticated) {
    return (
      <Card className="glass-effect border-white/20 text-white">
        <CardHeader className="text-center">
          <Lock className="h-12 w-12 mx-auto text-bible-gold mb-4" />
          <CardTitle className="text-2xl font-bible">Authentication Required</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-white/80">
            Please sign in to access sermons and spiritual content.
          </p>
          <Button 
            onClick={onLogin}
            className="bg-bible-gold hover:bg-bible-gold/80 text-bible-navy font-semibold"
          >
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!hasPermission) {
    return (
      <Card className="glass-effect border-white/20 text-white">
        <CardHeader className="text-center">
          <Lock className="h-12 w-12 mx-auto text-red-400 mb-4" />
          <CardTitle className="text-2xl font-bible">Access Restricted</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-white/80">
            You don't have permission to access this content. Please contact an administrator.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

export default ProtectedContent;
