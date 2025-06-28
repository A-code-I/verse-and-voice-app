
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Play, Pause, Calendar } from "lucide-react";
import { Sermon } from '@/pages/Index';
import AudioPlayer from './AudioPlayer';

interface SermonLibraryProps {
  sermons: Sermon[];
  categories: string[];
  onLikeSermon: (sermonId: string) => void;
}

const SermonLibrary = ({ sermons, categories, onLikeSermon }: SermonLibraryProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentSermon, setCurrentSermon] = useState<Sermon | null>(null);

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
      setCurrentSermon(null);
    } else {
      setCurrentSermon(sermon);
    }
  };

  const openBibleReference = (ref: string) => {
    window.open(`https://www.biblegateway.com/passage/?search=${ref}&version=NIV`, '_blank');
  };

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-white/20 text-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bible text-center flex items-center justify-center gap-2">
            <Calendar className="h-8 w-8" />
            Sermon Library
          </CardTitle>
          <p className="text-center text-white/80">Complete collection of our Bible sermons</p>
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
              All Sermons ({sermons.length})
            </Button>
            {categories.map(category => {
              const count = sermons.filter(s => s.category === category).length;
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => handleCategorySelect(category)}
                  className={selectedCategory === category 
                    ? 'bg-bible-gold text-bible-navy hover:bg-bible-gold/80' 
                    : 'border-white/30 text-white bg-white/10 hover:bg-white/20'
                  }
                >
                  {category} ({count})
                </Button>
              );
            })}
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
                    
                    {sermon.bible_references && sermon.bible_references.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-bible-gold">Bible References:</p>
                        <div className="flex flex-wrap gap-1">
                          {sermon.bible_references.map((ref, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="text-xs border-bible-gold/50 text-bible-gold cursor-pointer hover:bg-bible-gold/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                openBibleReference(ref);
                              }}
                            >
                              {ref}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
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

export default SermonLibrary;
