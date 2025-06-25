
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { Sermon } from '@/pages/Index';

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

  const filteredSermons = selectedCategory === 'All' 
    ? sermons 
    : sermons.filter(sermon => sermon.category === selectedCategory);

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
              onClick={() => setSelectedCategory('All')}
              className={selectedCategory === 'All' 
                ? 'bg-bible-gold text-bible-navy hover:bg-bible-gold/80' 
                : 'border-white/30 text-white hover:bg-white/20'
              }
            >
              All Sermons
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category 
                  ? 'bg-bible-gold text-bible-navy hover:bg-bible-gold/80' 
                  : 'border-white/30 text-white hover:bg-white/20'
                }
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Sermons Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSermons.map(sermon => (
              <Card 
                key={sermon.id} 
                className={`bg-white/10 border-white/20 hover:bg-white/20 transition-all cursor-pointer ${
                  currentSermon?.id === sermon.id ? 'ring-2 ring-bible-gold' : ''
                }`}
                onClick={() => onSelectSermon(sermon)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bible text-white line-clamp-2">
                      {sermon.title}
                    </CardTitle>
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
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-bible-purple/20 text-white">
                      {sermon.category}
                    </Badge>
                    <Badge variant="outline" className="border-white/30 text-white">
                      {new Date(sermon.date).toLocaleDateString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-white/80 text-sm line-clamp-3">
                    {sermon.description}
                  </p>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-bible-gold">Bible References:</p>
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
                </CardContent>
              </Card>
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
