
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { DevotionalReading } from '@/pages/Index';

interface DevotionalCardsProps {
  devotionals: DevotionalReading[];
}

const DevotionalCards = ({ devotionals }: DevotionalCardsProps) => {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-2 last:mb-0">
        {paragraph}
      </p>
    ));
  };

  const getContentPreview = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const openBibleReference = (ref: string) => {
    window.open(`https://www.biblegateway.com/passage/?search=${ref}&version=NIV`, '_blank');
  };

  if (devotionals.length === 0) {
    return null;
  }

  return (
    <Card className="glass-effect border-white/20 text-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bible text-center flex items-center justify-center gap-2">
          <BookOpen className="h-6 w-6" />
          Latest Daily Devotionals
        </CardTitle>
        <p className="text-center text-white/80">Fresh spiritual nourishment for your daily walk</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {devotionals.map(devotional => {
            const isExpanded = expandedCards.has(devotional.id);
            const shouldShowExpand = devotional.content.length > 150;
            const isToday = new Date(devotional.devotional_date).toDateString() === new Date().toDateString();
            
            return (
              <Card 
                key={devotional.id} 
                className={`bg-white/10 border-white/20 hover:bg-white/20 transition-all ${
                  isToday ? 'ring-2 ring-bible-gold' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bible text-white line-clamp-2">
                        {devotional.title}
                      </CardTitle>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Badge 
                          variant="secondary" 
                          className={devotional.type === 'Faith is the Victor' 
                            ? "bg-blue-500/20 text-blue-300" 
                            : "bg-teal-500/20 text-teal-300"
                          }
                        >
                          {devotional.type}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`border-white/30 text-white ${
                            isToday ? 'bg-bible-gold/20 border-bible-gold text-bible-gold' : ''
                          }`}
                        >
                          <Calendar className="h-3 w-3 mr-1" />
                          {isToday ? 'Today' : new Date(devotional.devotional_date).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-white/80 text-sm">
                    {isExpanded ? (
                      <div className="space-y-2">
                        {formatContent(devotional.content)}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {formatContent(getContentPreview(devotional.content))}
                      </div>
                    )}
                  </div>
                  
                  {shouldShowExpand && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(devotional.id)}
                      className="text-bible-gold hover:bg-bible-gold/20 p-1 h-auto"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Read More
                        </>
                      )}
                    </Button>
                  )}
                  
                  {devotional.bible_references && devotional.bible_references.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-bible-gold">Bible References:</p>
                      <div className="flex flex-wrap gap-1">
                        {devotional.bible_references.map((ref, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs border-bible-gold/50 text-bible-gold cursor-pointer hover:bg-bible-gold/20"
                            onClick={() => openBibleReference(ref)}
                          >
                            {ref}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {devotionals.length >= 3 && (
          <div className="text-center mt-6">
            <p className="text-white/60 text-sm">
              View all devotionals in the Daily Devotional section
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DevotionalCards;
