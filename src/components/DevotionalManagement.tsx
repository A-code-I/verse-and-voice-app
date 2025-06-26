
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";

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
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    type: 'Faith is the Victor',
    content: '',
    bible_references: '',
    devotional_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchDevotionals();
  }, []);

  const fetchDevotionals = async () => {
    try {
      const { data, error } = await supabase
        .from('devotionals')
        .select('*')
        .order('devotional_date', { ascending: false });

      if (error) throw error;
      setDevotionals(data || []);
    } catch (error) {
      console.error('Error fetching devotionals:', error);
      toast({
        title: "Error",
        description: "Failed to fetch devotionals",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const devotionalData = {
        title: formData.title,
        type: formData.type,
        content: formData.content,
        bible_references: formData.bible_references.split(',').map(ref => ref.trim()).filter(ref => ref),
        devotional_date: formData.devotional_date
      };

      if (editingId) {
        const { error } = await supabase
          .from('devotionals')
          .update(devotionalData)
          .eq('id', editingId);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Devotional updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('devotionals')
          .insert([devotionalData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Devotional created successfully",
        });
      }

      resetForm();
      fetchDevotionals();
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

  const handleEdit = (devotional: Devotional) => {
    setFormData({
      title: devotional.title,
      type: devotional.type,
      content: devotional.content,
      bible_references: devotional.bible_references.join(', '),
      devotional_date: devotional.devotional_date
    });
    setEditingId(devotional.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this devotional?')) return;

    try {
      const { error } = await supabase
        .from('devotionals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Devotional deleted successfully",
      });
      
      fetchDevotionals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'Faith is the Victor',
      content: '',
      bible_references: '',
      devotional_date: new Date().toISOString().split('T')[0]
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-white/20 text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bible">Manage Daily Devotionals</CardTitle>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-bible-gold text-bible-navy hover:bg-bible-gold/80"
            >
              {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {showForm ? 'Cancel' : 'Add New'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {showForm && (
            <Card className="bg-white/10 border-white/20 mb-6">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                        placeholder="Enter devotional title"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Type</label>
                      <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger className="bg-white/10 border-white/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Faith is the Victor">Faith is the Victor</SelectItem>
                          <SelectItem value="Streams in the Desert">Streams in the Desert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <Input
                      type="date"
                      value={formData.devotional_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, devotional_date: e.target.value }))}
                      className="bg-white/10 border-white/30 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Bible References</label>
                    <Input
                      value={formData.bible_references}
                      onChange={(e) => setFormData(prev => ({ ...prev, bible_references: e.target.value }))}
                      className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                      placeholder="Enter references separated by commas (e.g., John 3:16, Romans 8:28)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Content</label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      className="bg-white/10 border-white/30 text-white placeholder:text-white/50 min-h-[200px]"
                      placeholder="Enter devotional content"
                      required
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-bible-gold text-bible-navy hover:bg-bible-gold/80"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="border-white/30 text-white hover:bg-white/20"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Devotionals List */}
          <div className="grid gap-4">
            {devotionals.map((devotional) => (
              <Card key={devotional.id} className="bg-white/10 border-white/20">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-white">{devotional.title}</CardTitle>
                      <div className="flex gap-2 mt-2">
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
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(devotional)}
                        className="text-white hover:bg-white/20"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(devotional.id)}
                        className="text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-white/80 text-sm line-clamp-3 mb-3">
                    {devotional.content}
                  </p>
                  {devotional.bible_references.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {devotional.bible_references.map((ref, index) => (
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
                </CardContent>
              </Card>
            ))}
          </div>

          {devotionals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg">No devotionals found. Create your first one!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DevotionalManagement;
