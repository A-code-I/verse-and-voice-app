
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DailyVerseData {
  verse: string;
  reference: string;
  chapter: string;
  book: string;
  verseImage: string;
  teluguVerse: string;
  teluguImage: string;
}

const DailyVerse = () => {
  const [verseData, setVerseData] = useState<DailyVerseData>({
    verse: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.",
    reference: "Jeremiah 29:11",
    chapter: "Jeremiah 29",
    book: "Jeremiah",
    verseImage: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop",
    teluguVerse: "నేను మీ గురించి చేసుకున్న ఆలోచనలు నాకు తెలుసు, అవి కీడు కలిగించే ఆలోచనలు కాదు, మేలు కలిగించే ఆలోచనలు, మీకు భవిష్యత్తును, ఆశను అనుగ్రహించే ఆలోచనలు అని ప్రభువు చెప్పుచున్నాడు.",
    teluguImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop"
  });

  const today = format(new Date(), 'EEEE, MMMM dd, yyyy');

  const openBibleChapter = () => {
    const searchQuery = verseData.chapter.replace(' ', '+');
    window.open(`https://www.biblegateway.com/passage/?search=${searchQuery}&version=NIV`, '_blank');
  };

  return (
    <Card className="glass-effect border-white/20 text-white animate-fade-in">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bible mb-2">Daily Verse</CardTitle>
        <p className="text-white/80">{today}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Verse Images Side by Side */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* English Verse with Image */}
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden">
              <img 
                src={verseData.verseImage} 
                alt="Daily verse background" 
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
                <div className="text-center">
                  <blockquote className="text-sm font-bible italic leading-relaxed text-white">
                    "{verseData.verse}"
                  </blockquote>
                  <p className="text-sm font-semibold text-bible-gold mt-2">
                    - {verseData.reference}
                  </p>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-bible-gold text-center">English</h3>
          </div>

          {/* Telugu Verse with Image */}
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden">
              <img 
                src={verseData.teluguImage} 
                alt="Telugu verse background" 
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
                <div className="text-center">
                  <blockquote className="text-sm font-bible italic leading-relaxed text-white">
                    "{verseData.teluguVerse}"
                  </blockquote>
                  <p className="text-sm font-semibold text-bible-gold mt-2">
                    - {verseData.reference}
                  </p>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-bible-gold text-center">తెలుగు</h3>
          </div>
        </div>

        {/* Read Full Chapter Button */}
        <div className="text-center">
          <Button 
            onClick={openBibleChapter}
            className="bg-bible-gold hover:bg-bible-gold/80 text-bible-navy font-semibold"
          >
            Read Full Chapter: {verseData.chapter}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyVerse;
