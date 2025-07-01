
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Play, Pause, Calendar, HardDrive, Volume2 } from "lucide-react";
import { useDriveSermons } from "@/hooks/useDriveSermons";

const DriveSermonSection = () => {
  const { sermons, loading, likeDriveSermon } = useDriveSermons();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentSermon, setCurrentSermon] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const categories = ['Sunday Service', 'Wednesday Service', 'Saturday Service', 'Revival Meeting', 'Special Event'];
  
  const filteredSermons = selectedCategory === 'All' 
    ? sermons.slice(0, 6)
    : sermons.filter(sermon => sermon.category === selectedCategory).slice(0, 6);

  const handleSermonSelect = (sermonId: string) => {
    if (currentSermon === sermonId) {
      setCurrentSermon(null);
      setIsPlaying(false);
    } else {
      setCurrentSermon(sermonId);
      setIsPlaying(true);
    }
  };

  const openBibleReference = (ref: string) => {
    window.open(`https://www.biblegateway.com/passage/?search=${ref}&version=NIV`, '_blank');
  };

  if (loading) {
    return (
      <Card className="glass-effect border-white/20 text-white">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bible-gold mx-auto"></div>
            <p className="text-white/60 mt-2">Loading drive sermons...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-white/20 text-white">
        <CardHeader>
          <div className="text-center">
            <CardTitle className="text-2xl font-bible flex items-center justify-center gap-2">
              <HardDrive className="h-6 w-6" />
              Drive Audio Sermons
            </CardTitle>
            <p className="text-white/80 mt-2">Direct audio sermons from our drive collection</p>
          </div>
        </CardHeader>
        <CardContent>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            <Button
              variant={selectedCategory === 'All' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('All')}
              className={selectedCategory === 'All' 
                ? 'bg-bible-gold text-bible-navy hover:bg-bible-gold/80' 
                : 'border-white/30 text-white bg-white/10 hover:bg-white/20'
              }
            >
              Latest
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
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
                    currentSermon === sermon.id ? 'ring-2 ring-bible-gold bg-white/20' : ''
                  }`}
                  onClick={() => handleSermonSelect(sermon.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-bible text-white line-clamp-2 flex-1 mr-2">
                        {sermon.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="text-bible-gold">
                          {currentSermon === sermon.id && isPlaying ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5" />
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            likeDriveSermon(sermon.id);
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
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(sermon.sermon_date).toLocaleDateString()}
                      </Badge>
                      <Badge variant="outline" className="border-green-400/50 text-green-300">
                        <HardDrive className="h-3 w-3 mr-1" />
                        Drive Audio
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {sermon.description && (
                      <p className="text-white/80 text-sm line-clamp-2">
                        {sermon.description}
                      </p>
                    )}
                    
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
                    
                    {currentSermon === sermon.id && (
                      <div className="mt-3 p-3 bg-bible-gold/20 rounded-lg border border-bible-gold/30">
                        <div className="flex items-center justify-center gap-2 text-bible-gold text-xs font-semibold">
                          <Volume2 className="h-3 w-3" />
                          Audio Player Active
                          <Play className="h-3 w-3" />
                        </div>
                        <audio 
                          controls 
                          className="w-full mt-2"
                          src={sermon.drive_audio_url}
                          autoPlay={isPlaying}
                        >
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {filteredSermons.length === 0 && (
            <div className="text-center py-12">
              <HardDrive className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/60 text-lg">No drive sermons found for this category.</p>
              <p className="text-white/40 text-sm mt-2">Add some drive sermons in the admin panel to see them here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DriveSermonSection;
