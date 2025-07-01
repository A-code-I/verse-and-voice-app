
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, HardDrive, Calendar, Heart, Trash2 } from "lucide-react";
import { useDriveSermons } from "@/hooks/useDriveSermons";

const DriveSermonManagement = () => {
  const { sermons, loading, addDriveSermon } = useDriveSermons();
  const [isAddingSermon, setIsAddingSermon] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    drive_audio_url: '',
    description: '',
    bible_references: '',
    sermon_date: new Date().toISOString().split('T')[0]
  });

  const categories = ['Sunday Service', 'Wednesday Service', 'Saturday Service', 'Revival Meeting', 'Special Event'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.category || !formData.drive_audio_url.trim()) return;

    try {
      await addDriveSermon({
        title: formData.title.trim(),
        category: formData.category,
        drive_audio_url: formData.drive_audio_url.trim(),
        description: formData.description.trim() || null,
        bible_references: formData.bible_references 
          ? formData.bible_references.split(',').map(ref => ref.trim()).filter(ref => ref)
          : [],
        sermon_date: formData.sermon_date
      });

      // Reset form
      setFormData({
        title: '',
        category: '',
        drive_audio_url: '',
        description: '',
        bible_references: '',
        sermon_date: new Date().toISOString().split('T')[0]
      });
      setIsAddingSermon(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Drive Sermon */}
      <Card className="glass-effect border-white/20 text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bible flex items-center gap-2">
              <HardDrive className="h-6 w-6" />
              Drive Sermon Management
            </CardTitle>
            <Button 
              onClick={() => setIsAddingSermon(!isAddingSermon)}
              className="bg-bible-gold hover:bg-bible-gold/80 text-bible-navy"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Drive Sermon
            </Button>
          </div>
        </CardHeader>
        {isAddingSermon && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter sermon title"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Drive Audio URL *</label>
                <Input
                  value={formData.drive_audio_url}
                  onChange={(e) => setFormData({...formData, drive_audio_url: e.target.value})}
                  placeholder="Enter Google Drive audio file URL"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter sermon description"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  rows={3}
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Bible References</label>
                  <Input
                    value={formData.bible_references}
                    onChange={(e) => setFormData({...formData, bible_references: e.target.value})}
                    placeholder="John 3:16, Romans 8:28 (comma separated)"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sermon Date *</label>
                  <Input
                    type="date"
                    value={formData.sermon_date}
                    onChange={(e) => setFormData({...formData, sermon_date: e.target.value})}
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="submit"
                  className="bg-bible-gold hover:bg-bible-gold/80 text-bible-navy"
                >
                  Add Sermon
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingSermon(false)}
                  className="border-white/30 text-white hover:bg-white/20"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Drive Sermons List */}
      <Card className="glass-effect border-white/20 text-white">
        <CardHeader>
          <CardTitle className="text-xl font-bible">Existing Drive Sermons ({sermons.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bible-gold mx-auto"></div>
              <p className="text-white/60 mt-2">Loading drive sermons...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sermons.map(sermon => (
                <div 
                  key={sermon.id} 
                  className="bg-white/10 rounded-lg p-4 border border-white/20"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{sermon.title}</h3>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Badge variant="secondary" className="bg-bible-purple/20 text-white">
                          {sermon.category}
                        </Badge>
                        <Badge variant="outline" className="border-white/30 text-white">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(sermon.sermon_date).toLocaleDateString()}
                        </Badge>
                        <Badge variant="outline" className="border-green-400/50 text-green-300">
                          <HardDrive className="h-3 w-3 mr-1" />
                          Drive Audio
                        </Badge>
                      </div>
                      {sermon.description && (
                        <p className="text-white/70 text-sm mt-2">{sermon.description}</p>
                      )}
                      {sermon.bible_references && sermon.bible_references.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-bible-gold mb-1">Bible References:</p>
                          <div className="flex flex-wrap gap-1">
                            {sermon.bible_references.map((ref, index) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className="text-xs border-bible-gold/50 text-bible-gold"
                              >
                                {ref}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <div className="flex items-center gap-1 text-white/60">
                        <Heart className="h-4 w-4" />
                        <span className="text-sm">{sermon.likes}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {sermons.length === 0 && (
                <p className="text-white/60 text-center py-8">
                  No drive sermons found. Add some sermons to get started.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DriveSermonManagement;
