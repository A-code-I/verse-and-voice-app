
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DailyVerse from '@/components/DailyVerse';
import SermonSection from '@/components/SermonSection';
import AudioPlayer from '@/components/AudioPlayer';
import AdminPanel from '@/components/AdminPanel';
import { useToast } from "@/hooks/use-toast";

export interface Sermon {
  id: string;
  title: string;
  category: string;
  youtubeUrl: string;
  description: string;
  bibleReferences: string[];
  date: string;
  likes: number;
  liked: boolean;
}

const Index = () => {
  const [sermons, setSermons] = useState<Sermon[]>([
    {
      id: '1',
      title: '08-06-2025 Sunday Service',
      category: 'Sunday Service',
      youtubeUrl: 'https://www.youtube.com/watch?v=01VYdtdhmSA',
      description: 'A powerful message about trusting God in uncertain times and walking by faith, not by sight.',
      bibleReferences: ['Hebrews 11:1', '2 Corinthians 5:7', 'Romans 10:17'],
      date: '2024-06-08',
      likes: 42,
      liked: false
    },
    {
      id: '2',
      title: 'Praising GOD',
      category: 'Sunday Service',
      youtubeUrl: 'https://www.youtube.com/watch?v=OCcj7gUhM4E',
      description: 'Understanding the importance of prayer in our daily Christian walk and how it transforms our hearts.',
      bibleReferences: ['Matthew 6:9-13', '1 Thessalonians 5:18', 'James 5:16'],
      date: '2024-06-22',
      likes: 38,
      liked: true
    },
    {
      id: '3',
      title: '27 - 04 - 2025 Sunday Service',
      category: 'Sunday Service',
      youtubeUrl: 'https://www.youtube.com/watch?v=xoITHGqJ_WM',
      description: 'A call for spiritual awakening and renewal in our hearts and community.',
      bibleReferences: ['2 Chronicles 7:14', 'Habakkuk 3:2', 'Acts 3:19'],
      date: '2024-06-20',
      likes: 67,
      liked: false
    }
  ]);

  const [currentSermon, setCurrentSermon] = useState<Sermon | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const { toast } = useToast();

  const categories = [
    'Sunday Service',
    'Wednesday Service', 
    'Saturday Service',
    'Revival Meeting',
    'Anniversary',
    'Special Sunday School',
    'Youth Meeting',
    'Testimonies',
    'Special Meeting',
    'Topic Wise'
  ];

  const handleLikeSermon = (sermonId: string) => {
    setSermons(prev => prev.map(sermon => 
      sermon.id === sermonId 
        ? { 
            ...sermon, 
            liked: !sermon.liked,
            likes: sermon.liked ? sermon.likes - 1 : sermon.likes + 1
          }
        : sermon
    ));
    
    const sermon = sermons.find(s => s.id === sermonId);
    if (sermon) {
      toast({
        title: sermon.liked ? "Removed from favorites" : "Added to favorites",
        description: `"${sermon.title}" ${sermon.liked ? 'removed from' : 'added to'} your favorites.`,
      });
    }
  };

  const addSermon = (newSermon: Omit<Sermon, 'id' | 'likes' | 'liked'>) => {
    const sermon: Sermon = {
      ...newSermon,
      id: Date.now().toString(),
      likes: 0,
      liked: false
    };
    setSermons(prev => [sermon, ...prev]);
    toast({
      title: "Sermon added successfully",
      description: `"${sermon.title}" has been added to the collection.`,
    });
  };

  const updateSermon = (id: string, updatedSermon: Omit<Sermon, 'id' | 'likes' | 'liked'>) => {
    setSermons(prev => prev.map(sermon => 
      sermon.id === id 
        ? { ...sermon, ...updatedSermon }
        : sermon
    ));
    toast({
      title: "Sermon updated successfully",
      description: "The sermon has been updated.",
    });
  };

  const deleteSermon = (id: string) => {
    setSermons(prev => prev.filter(sermon => sermon.id !== id));
    if (currentSermon?.id === id) {
      setCurrentSermon(null);
    }
    toast({
      title: "Sermon deleted",
      description: "The sermon has been removed from the collection.",
    });
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bible font-bold text-white mb-4 animate-fade-in">
            Living Word Ministry
          </h1>
          <p className="text-xl text-white/80 animate-fade-in">
            Feeding souls with God's eternal truth
          </p>
          <div className="mt-6">
            <Button 
              onClick={() => setShowAdmin(!showAdmin)}
              variant="outline"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              {showAdmin ? 'View Sermons' : 'Admin Panel'}
            </Button>
          </div>
        </header>

        {showAdmin ? (
          <AdminPanel 
            onAddSermon={addSermon}
            onUpdateSermon={updateSermon}
            onDeleteSermon={deleteSermon}
            sermons={sermons}
            categories={categories}
          />
        ) : (
          <div className="grid gap-8">
            {/* Daily Verse */}
            <DailyVerse />

            {/* Audio Player */}
            {currentSermon && (
              <div className="animate-fade-in">
                <AudioPlayer 
                  sermon={currentSermon}
                  onLike={() => handleLikeSermon(currentSermon.id)}
                />
              </div>
            )}

            {/* Sermon Categories */}
            <SermonSection 
              sermons={sermons}
              categories={categories}
              onSelectSermon={setCurrentSermon}
              onLikeSermon={handleLikeSermon}
              currentSermon={currentSermon}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
