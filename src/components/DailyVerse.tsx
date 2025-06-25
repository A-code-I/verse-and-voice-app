
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DailyVerseData {
  verse: string;
  reference: string;
  chapter: string;
  book: string;
}

const DailyVerse = () => {
  const [verseData, setVerseData] = useState<DailyVerseData>({
    verse: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.",
    reference: "Jeremiah 29:11",
    chapter: "Jeremiah 29",
    book: "Jeremiah"
  });

  const today = format(new Date(), 'EEEE, MMMM dd, yyyy');

  const openBibleChapter = () => {
    // This would typically open a Bible reading interface
    // For now, we'll open Bible Gateway
    const searchQuery = verseData.chapter.replace(' ', '+');
    window.open(`https://www.biblegateway.com/passage/?search=${searchQuery}&version=NIV`, '_blank');
  };

  return (
    <Card className="glass-effect border-white/20 text-white animate-fade-in">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bible mb-2">Daily Verse</CardTitle>
        <p className="text-white/80">{today}</p>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <blockquote className="text-xl font-bible italic leading-relaxed">
          "{verseData.verse}"
        </blockquote>
        <p className="text-lg font-semibold text-bible-gold">
          - {verseData.reference}
        </p>
        <Button 
          onClick={openBibleChapter}
          className="bg-bible-gold hover:bg-bible-gold/80 text-bible-navy font-semibold"
        >
          Read Full Chapter: {verseData.chapter}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DailyVerse;
