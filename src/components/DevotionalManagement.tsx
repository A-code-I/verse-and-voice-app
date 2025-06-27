import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Calendar, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Devotional {
  id: string;
  title: string;
  type: string;
  content: string;
  bible_references: string[];
  devotional_date: string;
  created_at: string;
}

const DevotionalManagement = () => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'Faith is the Victor',
    content: '',
    bible_references: '',
    devotional_date: new Date().toISOString().split('T')[0]
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const { toast } = useToast();

  const devotionalTypes = ['Faith is the Victor', 'Streams in the Desert'];

  useEffect(() => {
    fetchDevotionals();
  }, []);

  const fetchDevotionals = async () => {
    setFetchLoading(true);
    try {
      console.log('Fetching devotionals...');
      const { data, error } = await supabase
        .from('devotionals')
        .select('*')
        .order('devotional_date', { ascending: false });

      if (error) {
        console.error('Error fetching devotionals:', error);
        throw error;
      }
      
      console.log('Fetched devotionals:', data);
      setDevotionals(data || []);
    } catch (error: any) {
      console.error('Error fetching devotionals:', error);
      toast({
        title: "Error",
        description: `Failed to fetch devotionals: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and content are required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const referencesArray = formData.bible_references
        .split(',')
        .map(ref => ref.trim())
        .filter(ref => ref);

      const devotionalData = {
        title: formData.title.trim(),
        type: formData.type,
        content: formData.content.trim(),
        bible_references: referencesArray,
        devotional_date: formData.devotional_date
      };

      console.log('Submitting devotional data:', devotionalData);

      if (editingId) {
        const { error } = await supabase
          .from('devotionals')
          .update(devotionalData)
          .eq('id', editingId);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        
        toast({
          title: "Success",
          description: "Devotional updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('devotionals')
          .insert([devotionalData]);

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        
        toast({
          title: "Success",
          description: `Devotional "${devotionalData.title}" has been added.`,
        });
      }

      // Reset form
      setFormData({
        title: '',
        type: 'Faith is the Victor',
        content: '',
        bible_references: '',
        devotional_date: new Date().toISOString().split('T')[0]
      });
      setEditingId(null);
      fetchDevotionals();
    } catch (error: any) {
      console.error('Submit error:', error);
      toast({
        title: "Error",
        description: `Failed to save devotional: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (devotional: Devotional) => {
    console.log('Editing devotional:', devotional);
    setFormData({
      title: devotional.title,
      type: devotional.type,
      content: devotional.content,
      bible_references: devotional.bible_references?.join(', ') || '',
      devotional_date: devotional.devotional_date
    });
    setEditingId(devotional.id);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    try {
      console.log('Deleting devotional:', id);
      const { error } = await supabase
        .from('devotionals')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Devotional deleted successfully",
      });
      fetchDevotionals();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: `Failed to delete devotional: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: '',
      type: 'Faith is the Victor',
      content: '',
      bible_references: '',
      devotional_date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Devotional Form */}
      <Card className="glass-effect border-white/20 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bible flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            {editingId ? 'Edit Daily Devotional' : 'Add New Daily Devotional'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  placeholder="Enter devotional title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {devotionalTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Date</label>
                <Input
                  value={formData.devotional_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, devotional_date: e.target.value }))}
                  required
                  type="date"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Content *</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="Enter devotional content"
                rows={6}
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
                {loading ? 'Saving...' : (editingId ? 'Update Devotional' : 'Add Devotional')}
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

      {/* Existing Devotionals */}
      <Card className="glass-effect border-white/20 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bible">Manage Daily Devotionals ({devotionals.length} total)</CardTitle>
        </CardHeader>
        <CardContent>
          {fetchLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bible-gold mx-auto"></div>
              <p className="text-white/60 mt-2">Loading devotionals...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {devotionals.map(devotional => (
                <div 
                  key={devotional.id} 
                  className="bg-white/10 rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-white">{devotional.title}</h3>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Badge variant="secondary" className="bg-bible-purple/20 text-white">
                          {devotional.type}
                        </Badge>
                        <Badge variant="outline" className="border-white/30 text-white">
                          {new Date(devotional.devotional_date).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleEdit(devotional)}
                        variant="outline"
                        size="sm"
                        className="border-white/30 text-white hover:bg-white/20"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        onClick={() => handleDelete(devotional.id, devotional.title)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-white/80 text-sm mb-3 line-clamp-3">{devotional.content}</p>
                  
                  {devotional.bible_references && devotional.bible_references.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {devotional.bible_references.map((ref: string, index: number) => (
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

              {devotionals.length === 0 && !fetchLoading && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60 text-lg">No devotionals found. Add your first one above!</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DevotionalManagement;
