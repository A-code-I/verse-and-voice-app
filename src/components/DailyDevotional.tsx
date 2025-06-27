
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DevotionalReading {
  id: string;
  title: string;
  type: string;
  devotional_date: string;
  bible_references: string[];
  content: string;
  created_at: string;
}

const DailyDevotional = () => {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [devotionals, setDevotionals] = useState<DevotionalReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const devotionalTypes = ['Faith is the Victor', 'Streams in the Desert'];

  useEffect(() => {
    fetchDevotionals();
  }, []);

  const fetchDevotionals = async () => {
    setLoading(true);
    try {
      console.log('Fetching devotionals for display...');
      const { data, error } = await supabase
        .from('devotionals')
        .select('*')
        .order('devotional_date', { ascending: false });

      if (error) {
        console.error('Error fetching devotionals:', error);
        throw error;
      }
      
      console.log('Fetched devotionals for display:', data);
      setDevotionals(data || []);
    } catch (error: any) {
      console.error('Error fetching devotionals:', error);
      toast({
        title: "Error",
        description: `Failed to fetch devotionals: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredReadings = selectedType === 'All' 
    ? devotionals 
    : devotionals.filter(reading => reading.type === selectedType);

  const openBibleReference = (ref: string) => {
    window.open(`https://www.biblegateway.com/passage/?search=${ref}&version=NIV`, '_blank');
  };

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

  const getContentPreview = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-white/20 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bible text-center">Daily Devotional Readings</CardTitle>
          <p className="text-center text-white/80">Spiritual nourishment for your daily walk with God</p>
        </CardHeader>
        <CardContent>
          {/* Type Filter */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            <Button
              variant={selectedType === 'All' ? 'default' : 'outline'}
              onClick={() => setSelectedType('All')}
              className={selectedType === 'All' 
                ? 'bg-bible-gold text-bible-navy hover:bg-bible-gold/80' 
                : 'border-white/30 text-white bg-white/10 hover:bg-white/20'
              }
            >
              All Readings ({devotionals.length})
            </Button>
            {devotionalTypes.map(type => {
              const count = devotionals.filter(d => d.type === type).length;
              return (
                <Button
                  key={type}
                  variant={selectedType === type ? 'default' : 'outline'}
                  onClick={() => setSelectedType(type)}
                  className={selectedType === type 
                    ? 'bg-bible-gold text-bible-navy hover:bg-bible-gold/80' 
                    : 'border-white/30 text-white bg-white/10 hover:bg-white/20'
                  }
                >
                  {type} ({count})
                </Button>
              );
            })}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bible-gold mx-auto"></div>
              <p className="text-white/60 mt-2">Loading devotionals...</p>
            </div>
          ) : (
            <>
              {/* Devotional Readings Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                {filteredReadings.map(reading => {
                  const isExpanded = expandedCards.has(reading.id);
                  const shouldShowExpand = reading.content.length > 200;
                  
                  return (
                    <Card 
                      key={reading.id} 
                      className="bg-white/10 border-white/20 hover:bg-white/20 transition-all"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-bible text-white line-clamp-2">
                              {reading.title}
                            </CardTitle>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              <Badge 
                                variant="secondary" 
                                className={reading.type === 'Faith is the Victor' 
                                  ? "bg-blue-500/20 text-blue-300" 
                                  : "bg-teal-500/20 text-teal-300"
                                }
                              >
                                {reading.type}
                              </Badge>
                              <Badge variant="outline" className="border-white/30 text-white">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(reading.devotional_date).toLocaleDateString()}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-white/80 text-sm">
                          {isExpanded ? (
                            <div className="space-y-2">
                              {formatContent(reading.content)}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {formatContent(getContentPreview(reading.content))}
                            </div>
                          )}
                        </div>
                        
                        {shouldShowExpand && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(reading.id)}
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
                        
                        {reading.bible_references && reading.bible_references.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-bible-gold">Bible References:</p>
                            <div className="flex flex-wrap gap-1">
                              {reading.bible_references.map((ref, index) => (
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

              {filteredReadings.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60 text-lg">No devotional readings found for this category.</p>
                  <p className="text-white/40 text-sm mt-2">Add some devotionals in the admin panel to see them here.</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyDevotional;
