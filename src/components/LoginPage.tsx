
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import DailyVerse from './DailyVerse';

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
  onGoogleLogin: () => void;
  isLoading?: boolean;
  error?: string;
}

const LoginPage = ({ onLogin, onGoogleLogin, isLoading = false, error }: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bible font-bold text-white mb-4 animate-fade-in">
            Word from Living God
          </h1>
          <p className="text-xl text-white/80 animate-fade-in">
            Feeding souls with God's eternal truth
          </p>
        </header>

        {/* Daily Verse */}
        <div className="mb-8">
          <DailyVerse />
        </div>

        {/* Login Form */}
        <div className="max-w-md mx-auto">
          <Card className="glass-effect border-white/20 text-white">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bible">Sign In</CardTitle>
              <p className="text-white/80">Access sermons and spiritual content</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Google Login */}
              <Button 
                onClick={onGoogleLogin}
                disabled={isLoading}
                className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold border border-gray-300"
                variant="outline"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full bg-white/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-white/60">Or continue with email</span>
                </div>
              </div>

              {/* Email/Password Login */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="Enter your password"
                  />
                </div>

                {error && (
                  <div className="text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-bible-gold hover:bg-bible-gold/80 text-bible-navy font-semibold"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
