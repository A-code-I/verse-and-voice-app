
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Play, Pause, Calendar, ArrowRight } from "lucide-react";
import { Sermon } from '@/pages/Index';
import AudioPlayer from './AudioPlayer';

interface SermonSectionProps {
  sermons: Sermon[];
  categories: string[];
  onSelectSermon: (sermon: Sermon) => void;
  onLikeSermon: (sermonId: string) => void;
  currentSermon: Sermon | null;
  onViewAllSermons?: () => void;
}

const SermonSection = ({ 
  sermons, 
  categories, 
  onSelectSermon, 
  onLikeSermon,
  currentSermon,
  onViewAllSermons
}: SermonSectionProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Reset category selection when sermons change
  useEffect(() => {
    if (sermons.length === 0) {
      setSelectedCategory('All');
    }
  }, [sermons]);

  // Show only latest 6 sermons for main page
  const filteredSermons = selectedCategory === 'All' 
    ? sermons.slice(0, 6)
    : sermons.filter(sermon => sermon.category === selectedCategory).slice(0, 6);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSermonSelect = (sermon: Sermon) => {
    if (currentSermon?.id === sermon.id) {
      onSelectSermon(null);
    } else {
      onSelectSermon(sermon);
    }
  };

  const openBibleReference = (ref: string) => {
    window.open(`https://www.biblegateway.com/passage/?search=${ref}&version=NIV`, '_blank');
  };

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-white/20 text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <CardTitle className="text-2xl font-bible flex items-center justify-center gap-2">
                <Calendar className="h-6 w-6" />
                Latest Bible Sermons
              </CardTitle>
              <p className="text-white/80 mt-2">Recent spiritual messages and teachings</p>
            </div>
            {onViewAllSermons && (
              <Button 
                onClick={onViewAllSermons}
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Compact Category Filter - Show only popular categories */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            <Button
              variant={selectedCategory === 'All' ? 'default' : 'outline'}
              onClick={() => handleCategorySelect('All')}
              className={selectedCategory === 'All' 
                ? 'bg-bible-gold text-bible-navy hover:bg-bible-gold/80' 
                : 'border-white/30 text-white bg-white/10 hover:bg-white/20'
              }
            >
              Latest
            </Button>
            {['Sunday Service', 'Wednesday Service', 'Saturday Service', 'Revival Meeting'].map(category => (
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

          {/* Conditional Layout - Full width when audio player is expanded */}
          {currentSermon ? (
            <div className="space-y-6">
              {/* Show expanded audio player first */}
              <div className="animate-fade-in">
                <AudioPlayer 
                  sermon={currentSermon}
                  onLike={() => onLikeSermon(currentSermon.id)}
                />
              </div>
              
              {/* Show other sermons in a compact grid below */}
              <div className="border-t border-white/20 pt-6">
                <h4 className="text-lg font-bible text-white mb-4 text-center">Other Recent Sermons</h4>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredSermons
                    .filter(sermon => sermon.id !== currentSermon.id)
                    .slice(0, 3)
                    .map(sermon => (
                    <Card 
                      key={sermon.id}
                      className="bg-white/10 border-white/20 hover:bg-white/20 transition-all cursor-pointer"
                      onClick={() => handleSermonSelect(sermon)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-sm font-bible text-white line-clamp-2 flex-1 mr-2">
                            {sermon.title}
                          </CardTitle>
                          <div className="flex items-center gap-1">
                            {sermon.audio_drive_url && <Play className="h-4 w-4 text-bible-gold" />}
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
                                className={`h-4 w-4 ${sermon.liked ? 'fill-red-500 text-red-500' : ''}`} 
                              />
                              <span className="ml-1 text-xs">{sermon.likes}</span>
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          <Badge variant="secondary" className="bg-bible-purple/20 text-white text-xs">
                            {sermon.category}
                          </Badge>
                          <Badge variant="outline" className="border-white/30 text-white text-xs">
                            {new Date(sermon.sermon_date).toLocaleDateString()}
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Regular Grid Layout when no sermon is selected */
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredSermons.map(sermon => (
                <Card 
                  key={sermon.id}
                  className="bg-white/10 border-white/20 hover:bg-white/20 transition-all cursor-pointer"
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
                            <Play className="h-5 w-5" />
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
                          Audio
                        </Badge>
                      )}
                      {sermon.youtube_url && (
                        <Badge variant="outline" className="border-red-400/50 text-red-300">
                          Video
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-white/80 text-sm line-clamp-2">
                      {sermon.description}
                    </p>
                    
                    {sermon.bible_references && sermon.bible_references.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-bible-gold">Bible References:</p>
                        <div className="flex flex-wrap gap-1">
                          {sermon.bible_references.slice(0, 3).map((ref, index) => (
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
                          {sermon.bible_references.length > 3 && (
                            <Badge variant="outline" className="text-xs border-white/30 text-white/60">
                              +{sermon.bible_references.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 p-2 bg-bible-gold/10 rounded-lg border border-bible-gold/30">
                      <p className="text-bible-gold text-xs font-semibold text-center flex items-center justify-center gap-2">
                        🎵 Click to Play Audio
                        <Play className="h-3 w-3" />
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredSermons.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg">No sermons found for this category.</p>
            </div>
          )}

          {/* View All Button at bottom */}
          {onViewAllSermons && sermons.length > 6 && !currentSermon && (
            <div className="text-center mt-8">
              <Button 
                onClick={onViewAllSermons}
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                View All {sermons.length} Sermons <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SermonSection;
