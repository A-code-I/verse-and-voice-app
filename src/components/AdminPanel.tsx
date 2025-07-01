
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  BookOpen, 
  Settings, 
  BarChart3, 
  Shield,
  HardDrive
} from "lucide-react";
import UserManagement from './UserManagement';
import DevotionalManagement from './DevotionalManagement';
import UserStatisticsPanel from './UserStatisticsPanel';
import AuthenticationSettings from './AuthenticationSettings';
import DriveSermonManagement from './DriveSermonManagement';

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel = ({ onClose }: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="min-h-screen bg-gradient-to-br from-bible-navy via-bible-purple to-bible-navy p-4">
      <Card className="glass-effect border-white/20 text-white max-w-7xl mx-auto">
        <CardHeader className="border-b border-white/20">
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl font-bible flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Admin Dashboard
            </CardTitle>
            <Button 
              onClick={onClose}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/20"
            >
              Back to App
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white/10">
              <TabsTrigger 
                value="users" 
                className="data-[state=active]:bg-bible-gold data-[state=active]:text-bible-navy"
              >
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger 
                value="devotionals"
                className="data-[state=active]:bg-bible-gold data-[state=active]:text-bible-navy"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Devotionals
              </TabsTrigger>
              <TabsTrigger 
                value="drive-sermons"
                className="data-[state=active]:bg-bible-gold data-[state=active]:text-bible-navy"
              >
                <HardDrive className="h-4 w-4 mr-2" />
                Drive Sermons
              </TabsTrigger>
              <TabsTrigger 
                value="statistics"
                className="data-[state=active]:bg-bible-gold data-[state=active]:text-bible-navy"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Statistics
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="data-[state=active]:bg-bible-gold data-[state=active]:text-bible-navy"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <UserManagement />
            </TabsContent>

            <TabsContent value="devotionals" className="space-y-6">
              <DevotionalManagement />
            </TabsContent>

            <TabsContent value="drive-sermons" className="space-y-6">
              <DriveSermonManagement />
            </TabsContent>

            <TabsContent value="statistics" className="space-y-6">
              <UserStatisticsPanel />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <AuthenticationSettings />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
