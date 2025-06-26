
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink, Calendar } from "lucide-react";

interface DevotionalReading {
  id: string;
  title: string;
  type: 'Faith is the Victor' | 'Streams in the Desert';
  date: string;
  bibleReferences: string[];
  gdocUrl: string;
  excerpt: string;
}

const DailyDevotional = () => {
  const [selectedType, setSelectedType] = useState<string>('All');
  
  // Sample devotional readings - in a real app, these would come from your database
  const devotionalReadings: DevotionalReading[] = [
    {
      id: '1',
      title: 'Walking by Faith, Not by Sight',
      type: 'Faith is the Victor',
      date: '2024-12-26',
      bibleReferences: ['2 Corinthians 5:7', 'Hebrews 11:1', 'Romans 10:17'],
      gdocUrl: 'https://docs.google.com/document/d/your-doc-id/edit',
      excerpt: 'Faith is not just believing; it is acting upon what we believe, even when we cannot see the outcome...'
    },
    {
      id: '2',
      title: 'Rivers in the Wasteland',
      type: 'Streams in the Desert',
      date: '2024-12-26',
      bibleReferences: ['Isaiah 43:19', 'Isaiah 35:6-7', 'Psalm 78:16'],
      gdocUrl: 'https://docs.google.com/document/d/your-doc-id/edit',
      excerpt: 'God can make streams flow in the desert places of our lives. When all seems barren and hopeless...'
    },
    {
      id: '3',
      title: 'The Shield of Faith',
      type: 'Faith is the Victor',
      date: '2024-12-25',
      bibleReferences: ['Ephesians 6:16', '1 John 5:4', 'Psalm 91:4'],
      gdocUrl: 'https://docs.google.com/document/d/your-doc-id/edit',
      excerpt: 'Above all, taking the shield of faith with which you will be able to quench all the fiery darts...'
    },
    {
      id: '4',
      title: 'Springs of Living Water',
      type: 'Streams in the Desert',
      date: '2024-12-25',
      bibleReferences: ['John 7:38', 'Isaiah 58:11', 'Jeremiah 2:13'],
      gdocUrl: 'https://docs.google.com/document/d/your-doc-id/edit',
      excerpt: 'He who believes in Me, as the Scripture has said, out of his heart will flow rivers of living water...'
    }
  ];

  const devotionalTypes = ['Faith is the Victor', 'Streams in the Desert'];

  const filteredReadings = selectedType === 'All' 
    ? devotionalReadings 
    : devotionalReadings.filter(reading => reading.type === selectedType);

  const openBibleReference = (ref: string) => {
    window.open(`https://www.biblegateway.com/passage/?search=${ref}&version=NIV`, '_blank');
  };

  const openDevotional = (gdocUrl: string) => {
    window.open(gdocUrl, '_blank');
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
              All Readings
            </Button>
            {devotionalTypes.map(type => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                onClick={() => setSelectedType(type)}
                className={selectedType === type 
                  ? 'bg-bible-gold text-bible-navy hover:bg-bible-gold/80' 
                  : 'border-white/30 text-white bg-white/10 hover:bg-white/20'
                }
              >
                {type}
              </Button>
            ))}
          </div>

          {/* Devotional Readings Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {filteredReadings.map(reading => (
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
                          {new Date(reading.date).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-white/80 text-sm line-clamp-3">
                    {reading.excerpt}
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-bible-gold">Bible References:</p>
                    <div className="flex flex-wrap gap-1">
                      {reading.bibleReferences.map((ref, index) => (
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

                  <div className="pt-2">
                    <Button
                      onClick={() => openDevotional(reading.gdocUrl)}
                      className="w-full bg-bible-gold hover:bg-bible-gold/80 text-bible-navy font-semibold"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Read Full Devotional
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredReadings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg">No devotional readings found for this category.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyDevotional;
