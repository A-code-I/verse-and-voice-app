import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { Sermon } from '@/pages/Index';

interface AdminPanelProps {
  onAddSermon: (sermon: Omit<Sermon, 'id' | 'likes' | 'liked'>) => void;
  onUpdateSermon: (id: string, sermon: Omit<Sermon, 'id' | 'likes' | 'liked'>) => void;
  onDeleteSermon: (id: string) => void;
  sermons: Sermon[];
  categories: string[];
}

const AdminPanel = ({ 
  onAddSermon, 
  onUpdateSermon, 
  onDeleteSermon, 
  sermons, 
  categories 
}: AdminPanelProps) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    youtubeUrl: '',
    description: '',
    bibleReferences: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const referencesArray = formData.bibleReferences
      .split(',')
      .map(ref => ref.trim())
      .filter(ref => ref);

    const sermonData = {
      ...formData,
      bibleReferences: referencesArray
    };

    if (editingId) {
      onUpdateSermon(editingId, sermonData);
      setEditingId(null);
    } else {
      onAddSermon(sermonData);
    }

    // Reset form
    setFormData({
      title: '',
      category: '',
      youtubeUrl: '',
      description: '',
      bibleReferences: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleEdit = (sermon: Sermon) => {
    setFormData({
      title: sermon.title,
      category: sermon.category,
      youtubeUrl: sermon.youtubeUrl,
      description: sermon.description,
      bibleReferences: sermon.bibleReferences.join(', '),
      date: sermon.date
    });
    setEditingId(sermon.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: '',
      category: '',
      youtubeUrl: '',
      description: '',
      bibleReferences: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Sermon Form */}
      <Card className="glass-effect border-white/20 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bible">
            {editingId ? 'Edit Sermon' : 'Add New Sermon'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  placeholder="Enter sermon title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">YouTube URL</label>
                <Input
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                  required
                  type="url"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <Input
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                  type="date"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="Enter sermon description"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Bible References (comma separated)
              </label>
              <Input
                value={formData.bibleReferences}
                onChange={(e) => setFormData(prev => ({ ...prev, bibleReferences: e.target.value }))}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="John 3:16, Romans 8:28, Psalm 23:1"
              />
            </div>

            <div className="flex gap-4">
              <Button 
                type="submit" 
                className="bg-bible-gold hover:bg-bible-gold/80 text-bible-navy font-semibold"
              >
                {editingId ? 'Update Sermon' : 'Add Sermon'}
              </Button>
              {editingId && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={cancelEdit}
                  className="border-white/30 text-white hover:bg-white/20"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Existing Sermons */}
      <Card className="glass-effect border-white/20 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bible">Manage Sermons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sermons.map(sermon => (
              <div 
                key={sermon.id} 
                className="bg-white/10 rounded-lg p-4 border border-white/20"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{sermon.title}</h3>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="bg-bible-purple/20 text-white">
                        {sermon.category}
                      </Badge>
                      <Badge variant="outline" className="border-white/30 text-white">
                        {new Date(sermon.date).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleEdit(sermon)}
                      variant="outline"
                      size="sm"
                      className="border-white/30 text-white hover:bg-white/20"
                    >
                      Edit
                    </Button>
                    <Button 
                      onClick={() => onDeleteSermon(sermon.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-white/80 text-sm mb-2">{sermon.description}</p>
                
                <div className="flex flex-wrap gap-1">
                  {sermon.bibleReferences.map((ref, index) => (
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
