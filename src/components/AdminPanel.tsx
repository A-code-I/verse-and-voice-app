import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, ExternalLink, Edit, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface AdminPanelProps {
  categories: string[];
  onRefreshSermons: () => void;
}

const AdminPanel = ({ categories, onRefreshSermons }: AdminPanelProps) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    youtube_url: '',
    audio_drive_url: '',
    description: '',
    bible_references: '',
    sermon_date: new Date().toISOString().split('T')[0]
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sermons, setSermons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [useAudioDrive, setUseAudioDrive] = useState(true);
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryValue, setEditCategoryValue] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch categories from database
  const { data: dbCategories = [], refetch: refetchCategories } = useQuery({
    queryKey: ['sermon-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sermon_categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (categoryName: string) => {
      const { data, error } = await supabase
        .from('sermon_categories')
        .insert([{ name: categoryName.trim() }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermon-categories'] });
      setNewCategory('');
      setShowNewCategoryInput(false);
      toast({
        title: "Category added",
        description: "New category has been successfully added.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error adding category",
        description: error.message.includes('unique') ? 'Category already exists' : error.message,
        variant: "destructive",
      });
    }
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from('sermon_categories')
        .update({ name: name.trim(), updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermon-categories'] });
      setEditingCategory(null);
      setEditCategoryValue('');
      toast({
        title: "Category updated",
        description: "Category has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating category",
        description: error.message.includes('unique') ? 'Category name already exists' : error.message,
        variant: "destructive",
      });
    }
  });

  React.useEffect(() => {
    fetchSermons();
  }, []);

  const fetchSermons = async () => {
    try {
      const { data, error } = await supabase
        .from('sermons')
        .select('*')
        .order('sermon_date', { ascending: false });

      if (error) throw error;
      setSermons(data || []);
      onRefreshSermons();
    } catch (error) {
      console.error('Error fetching sermons:', error);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !dbCategories.find(cat => cat.name === newCategory.trim())) {
      addCategoryMutation.mutate(newCategory.trim());
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category.id);
    setEditCategoryValue(category.name);
  };

  const handleSaveEditCategory = () => {
    if (editCategoryValue.trim() && editingCategory) {
      const existingCategory = dbCategories.find(cat => cat.name === editCategoryValue.trim() && cat.id !== editingCategory);
      if (existingCategory) {
        toast({
          title: "Error",
          description: "Category name already exists",
          variant: "destructive",
        });
        return;
      }
      updateCategoryMutation.mutate({ id: editingCategory, name: editCategoryValue.trim() });
    } else {
      setEditingCategory(null);
      setEditCategoryValue('');
    }
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
    setEditCategoryValue('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const referencesArray = formData.bible_references
        .split(',')
        .map(ref => ref.trim())
        .filter(ref => ref);

      const sermonData = {
        title: formData.title,
        category: formData.category,
        youtube_url: formData.youtube_url || null,
        audio_drive_url: formData.audio_drive_url || null,
        description: formData.description,
        bible_references: referencesArray,
        sermon_date: formData.sermon_date
      };

      if (editingId) {
        const { error } = await supabase
          .from('sermons')
          .update(sermonData)
          .eq('id', editingId);

        if (error) throw error;
        
        toast({
          title: "Sermon updated successfully",
          description: "The sermon has been updated.",
        });
      } else {
        const { error } = await supabase
          .from('sermons')
          .insert([sermonData]);

        if (error) throw error;
        
        toast({
          title: "Sermon added successfully",
          description: `"${sermonData.title}" has been added to the collection.`,
        });
      }

      // Reset form
      setFormData({
        title: '',
        category: '',
        youtube_url: '',
        audio_drive_url: '',
        description: '',
        bible_references: '',
        sermon_date: new Date().toISOString().split('T')[0]
      });
      setEditingId(null);
      fetchSermons();
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

  const handleEdit = (sermon: any) => {
    setFormData({
      title: sermon.title,
      category: sermon.category,
      youtube_url: sermon.youtube_url || '',
      audio_drive_url: sermon.audio_drive_url || '',
      description: sermon.description || '',
      bible_references: sermon.bible_references?.join(', ') || '',
      sermon_date: sermon.sermon_date
    });
    setEditingId(sermon.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sermon?')) return;
    
    try {
      const { error } = await supabase
        .from('sermons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sermon deleted",
        description: "The sermon has been removed from the collection.",
      });
      fetchSermons();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: '',
      category: '',
      youtube_url: '',
      audio_drive_url: '',
      description: '',
      bible_references: '',
      sermon_date: new Date().toISOString().split('T')[0]
    });
  };

  // Get all unique categories from both database and existing sermons
  const allCategories = [...new Set([
    ...dbCategories.map(cat => cat.name),
    ...sermons.map(s => s.category)
  ])].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Audio Source Configuration */}
      <Card className="glass-effect border-white/20 text-white">
        <CardHeader>
          <CardTitle className="text-xl font-bible">Audio Player Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            <Switch
              id="audio-source"
              checked={useAudioDrive}
              onCheckedChange={setUseAudioDrive}
            />
            <label htmlFor="audio-source" className="text-sm font-medium">
              {useAudioDrive ? 'Using Google Drive Audio (Recommended)' : 'Using YouTube Audio'}
            </label>
          </div>
          <p className="text-xs text-white/60 mt-2">
            {useAudioDrive 
              ? 'Audio will be played from Google Drive URLs when available' 
              : 'Audio will be extracted from YouTube videos'
            }
          </p>
        </CardContent>
      </Card>

      {/* Category Management */}
      <Card className="glass-effect border-white/20 text-white">
        <CardHeader>
          <CardTitle className="text-xl font-bible">Category Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {dbCategories.map(category => (
                <div key={category.id} className="flex items-center gap-2">
                  {editingCategory === category.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editCategoryValue}
                        onChange={(e) => setEditCategoryValue(e.target.value)}
                        className="h-8 w-32 bg-white/10 border-white/20 text-white text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEditCategory();
                          if (e.key === 'Escape') handleCancelEditCategory();
                        }}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={handleSaveEditCategory}
                        className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                        disabled={updateCategoryMutation.isPending}
                      >
                        ✓
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEditCategory}
                        className="h-8 w-8 p-0 border-white/30 text-white hover:bg-white/20"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="border-bible-gold/50 text-bible-gold">
                        {category.name}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditCategory(category)}
                        className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/20"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {showNewCategoryInput ? (
              <div className="flex items-center gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter new category name"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddCategory();
                    if (e.key === 'Escape') {
                      setShowNewCategoryInput(false);
                      setNewCategory('');
                    }
                  }}
                  autoFocus
                />
                <Button
                  onClick={handleAddCategory}
                  className="bg-bible-gold hover:bg-bible-gold/80 text-bible-navy"
                  disabled={addCategoryMutation.isPending}
                >
                  {addCategoryMutation.isPending ? 'Adding...' : 'Add'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewCategoryInput(false);
                    setNewCategory('');
                  }}
                  className="border-white/30 text-white hover:bg-white/20"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setShowNewCategoryInput(true)}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/20"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Category
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

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
                <div className="flex gap-2">
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white flex-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Or type new category"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 w-48"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">YouTube URL (Optional)</label>
                <Input
                  value={formData.youtube_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, youtube_url: e.target.value }))}
                  type="url"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Audio Drive URL (Optional)</label>
                <Input
                  value={formData.audio_drive_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, audio_drive_url: e.target.value }))}
                  type="url"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Date</label>
                <Input
                  value={formData.sermon_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, sermon_date: e.target.value }))}
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
                value={formData.bible_references}
                onChange={(e) => setFormData(prev => ({ ...prev, bible_references: e.target.value }))}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="John 3:16, Romans 8:28, Psalm 23:1"
              />
            </div>

            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-bible-gold hover:bg-bible-gold/80 text-bible-navy font-semibold"
              >
                {loading ? 'Saving...' : (editingId ? 'Update Sermon' : 'Add Sermon')}
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
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{sermon.title}</h3>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="bg-bible-purple/20 text-white">
                        {sermon.category}
                      </Badge>
                      <Badge variant="outline" className="border-white/30 text-white">
                        {new Date(sermon.sermon_date).toLocaleDateString()}
                      </Badge>
                      {sermon.youtube_url && (
                        <Badge variant="outline" className="border-blue-400/50 text-blue-300">
                          YouTube
                        </Badge>
                      )}
                      {sermon.audio_drive_url && (
                        <Badge variant="outline" className="border-green-400/50 text-green-300">
                          Audio Drive
                        </Badge>
                      )}
                      {sermon.gdoc_summary_url && (
                        <Badge variant="outline" className="border-yellow-400/50 text-yellow-300">
                          Summary
                        </Badge>
                      )}
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
                      onClick={() => handleDelete(sermon.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-white/80 text-sm mb-2">{sermon.description}</p>
                
                {sermon.bible_references && (
                  <div className="flex flex-wrap gap-1">
                    {sermon.bible_references.map((ref: string, index: number) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs border-bible-gold/50 text-bible-gold"
                      >
                        {ref}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
