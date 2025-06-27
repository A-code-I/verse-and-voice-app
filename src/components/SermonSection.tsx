
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Play, Pause } from "lucide-react";
import { Sermon } from '@/pages/Index';
import AudioPlayer from './AudioPlayer';

interface SermonSectionProps {
  sermons: Sermon[];
  categories: string[];
  onSelectSermon: (sermon: Sermon) => void;
  onLikeSermon: (sermonId: string) => void;
  currentSermon: Sermon | null;
}

const SermonSection = ({ 
  sermons, 
  categories, 
  onSelectSermon, 
  onLikeSermon,
  currentSermon 
}: SermonSectionProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Reset category selection when sermons change
  useEffect(() => {
    if (sermons.length === 0) {
      setSelectedCategory('All');
    }
  }, [sermons]);

  const filteredSermons = selectedCategory === 'All' 
    ? sermons 
    : sermons.filter(sermon => sermon.category === selectedCategory);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSermonSelect = (sermon: Sermon) => {
    if (currentSermon?.id === sermon.id) {
      // If clicking the same sermon, deselect it
      onSelectSermon(null);
    } else {
      onSelectSermon(sermon);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-white/20 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bible text-center">Bible Sermons</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            <Button
              variant={selectedCategory === 'All' ? 'default' : 'outline'}
              onClick={() => handleCategorySelect('All')}
              className={selectedCategory === 'All' 
                ? 'bg-bible-gold text-bible-navy hover:bg-bible-gold/80' 
                : 'border-white/30 text-white bg-white/10 hover:bg-white/20'
              }
            >
              All Sermons
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => handleCategorySelect(category)}
                className={selectedCategory === category 
                  ? 'bg-bible-gold text-bible-navy hover:bg-bible-gold/80' 
                  : 'border-white/30 text-white bg-white/10 hover:bg-white/20'
                }
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Sermons Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSermons.map(sermon => (
              <div key={sermon.id} className="space-y-4">
                <Card 
                  className={`bg-white/10 border-white/20 hover:bg-white/20 transition-all cursor-pointer ${
                    currentSermon?.id === sermon.id ? 'ring-2 ring-bible-gold bg-white/20' : ''
                  }`}
                  onClick={() => handleSermonSelect(sermon)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-bible text-white line-clamp-2 flex-1 mr-2">
                        {sermon.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {sermon.audio_drive_url && (
                          <div className="text-bible-gold">
                            {currentSermon?.id === sermon.id ? (
                              <Pause className="h-5 w-5" />
                            ) : (
                              <Play className="h-5 w-5" />
                            )}
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onLikeSermon(sermon.id);
                          }}
                          className="text-white hover:bg-white/20 p-1"
                        >
                          <Heart 
                            className={`h-5 w-5 ${sermon.liked ? 'fill-red-500 text-red-500' : ''}`} 
                          />
                          <span className="ml-1 text-sm">{sermon.likes}</span>
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary" className="bg-bible-purple/20 text-white">
                        {sermon.category}
                      </Badge>
                      <Badge variant="outline" className="border-white/30 text-white">
                        {new Date(sermon.sermon_date).toLocaleDateString()}
                      </Badge>
                      {sermon.audio_drive_url && (
                        <Badge variant="outline" className="border-green-400/50 text-green-300">
                          Drive Audio
                        </Badge>
                      )}
                      {sermon.youtube_url && (
                        <Badge variant="outline" className="border-red-400/50 text-red-300">
                          YouTube
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-white/80 text-sm line-clamp-3">
                      {sermon.description}
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-bible-gold">Bible References:</p>
                      <div className="flex flex-wrap gap-1">
                        {sermon.bible_references?.map((ref, index) => (
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
                    
                    {currentSermon?.id === sermon.id && (
                      <div className="mt-3 p-3 bg-bible-gold/20 rounded-lg border border-bible-gold/30">
                        <p className="text-bible-gold text-xs font-semibold text-center flex items-center justify-center gap-2">
                          🎵 Audio Player Expanded Below
                          <Play className="h-3 w-3" />
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Audio Player Expanded View */}
                {currentSermon?.id === sermon.id && (
                  <div className="animate-fade-in">
                    <AudioPlayer 
                      sermon={currentSermon}
                      onLike={() => onLikeSermon(currentSermon.id)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredSermons.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg">No sermons found for this category.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SermonSection;
