
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

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
  const [loading, setLoading] = useState(false);

  const today = format(new Date(), 'EEEE, MMMM dd, yyyy');

  // Expanded Bible verses collection for better daily variation
  const bibleVerses = [
    {
      verse: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.",
      reference: "Jeremiah 29:11",
      chapter: "Jeremiah 29",
      book: "Jeremiah",
      teluguVerse: "నేను మీ గురించి చేసుకున్న ఆలోచనలు నాకు తెలుసు, అవి కీడు కలిగించే ఆలోచనలు కాదు, మేలు కలిగించే ఆలోచనలు, మీకు భవిష్యత్తును, ఆశను అనుగ్రహించే ఆలోచనలు అని ప్రభువు చెప్పుచున్నాడు."
    },
    {
      verse: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
      reference: "Romans 8:28",
      chapter: "Romans 8",
      book: "Romans",
      teluguVerse: "దేవుని ప్రేమించువారికి, ఆయన సంకల్పము చొప్పున పిలువబడినవారికి సమస్తమును వారి మేలుకు తోడ్పడుమని మనము ఎరుగుచున్నాము."
    },
    {
      verse: "The Lord is my shepherd, I lack nothing.",
      reference: "Psalm 23:1",
      chapter: "Psalm 23",
      book: "Psalms",
      teluguVerse: "యెహోవాయే నా కాపరి; నాకు ఏమియు కొరవకున్నది."
    },
    {
      verse: "Trust in the Lord with all your heart and lean not on your own understanding.",
      reference: "Proverbs 3:5",
      chapter: "Proverbs 3",
      book: "Proverbs",
      teluguVerse: "పూర్ణహృదయముతో యెహోవాను నమ్ముము; నీ బుద్ధిని నమ్మకుము."
    },
    {
      verse: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
      reference: "John 3:16",
      chapter: "John 3",
      book: "John",
      teluguVerse: "దేవుడు లోకమును ఎంతో ప్రేమించెను. తన అద్వితీయ కుమారుని దయచేసెను. ఆయనను విశ్వసించు ప్రతివాడును నశింపక నిత్యజీవము పొందునటుల చేసెను."
    },
    {
      verse: "I can do all this through him who gives me strength.",
      reference: "Philippians 4:13",
      chapter: "Philippians 4",
      book: "Philippians",
      teluguVerse: "నాకు బలమిచ్చు క్రీస్తు దేవునిలో నేను సమస్తమును చేయగలను."
    },
    {
      verse: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
      reference: "Joshua 1:9",
      chapter: "Joshua 1",
      book: "Joshua",
      teluguVerse: "నీవు బలవంతుడవై ధైర్యవంతుడవై యుండుము; భయపడకుము, కలవరపడకుము; ఎందుకంటే నీవు ఎచ్చట వెళ్లినను నీ దేవుడైన యెహోవా నీకు తోడుగా ఉండును."
    },
    {
      verse: "The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you; in his love he will no longer rebuke you, but will rejoice over you with singing.",
      reference: "Zephaniah 3:17",
      chapter: "Zephaniah 3",
      book: "Zephaniah",
      teluguVerse: "నీ దేవుడైన యెహోవా నీ మధ్యను ఉండును; ఆయన రక్షణా శూరుడు; ఆయన నిన్ను బట్టి మిక్కిలి సంతోషించును; తన ప్రేమతో మౌనముగా ఉండును; నిన్ను బట్టి కీర్తనలతో ఆనందించును."
    },
    {
      verse: "Cast all your anxiety on him because he cares for you.",
      reference: "1 Peter 5:7",
      chapter: "1 Peter 5",
      book: "1 Peter",
      teluguVerse: "ఆయన మిమ్మల్ని జాలిపడుచున్నాడు గనుక మీ చింతలన్నిటిని ఆయనపైకి వేయుడు."
    },
    {
      verse: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
      reference: "Isaiah 40:31",
      chapter: "Isaiah 40",
      book: "Isaiah",
      teluguVerse: "యెహోవా కొరకు కనిపెట్టువారు తమ బలమును తిరిగి పొందుదురు; వారు గరుడలవలె రెక్కలు వేసుకొని ఎగురుదురు; పరుగెత్తినను అలుసు పడరు; నడిచినను సొమ్మసిల్లరు."
    },
    {
      verse: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.",
      reference: "Psalm 34:18",
      chapter: "Psalm 34",
      book: "Psalms",
      teluguVerse: "హృదయము విరుగుకొనినవారికి యెహోవా సమీపముగా ఉండును; మనోభంగము పొందినవారిని రక్షించును."
    },
    {
      verse: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
      reference: "Joshua 1:9",
      chapter: "Joshua 1",
      book: "Joshua",
      teluguVerse: "నేను నీకు ఆజ్ఞాపించినది కాదా? బలవంతుడవై ధైర్యవంతుడవై యుండుము; భయపడకుము, కలవరపడకుము; ఎందుకంటే నీవు ఎచ్చట వెళ్లినను నీ దేవుడైన యెహోవా నీకు తోడుగా ఉండును."
    },
    {
      verse: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.",
      reference: "John 14:27",
      chapter: "John 14",
      book: "John",
      teluguVerse: "శాంతిని మీకు చెప్పి వెళ్లుచున్నాను; నా శాంతిని మీకు ఇచ్చుచున్నాను; లోకము ఇచ్చుటవలె నేను మీకు ఇవ్వను; మీ హృదయము కలవరపడనియ్యకుము, భయపడనియ్యకుము."
    },
    {
      verse: "And my God will meet all your needs according to the riches of his glory in Christ Jesus.",
      reference: "Philippians 4:19",
      chapter: "Philippians 4",
      book: "Philippians",
      teluguVerse: "నా దేవుడు క్రీస్తు యేసులో తన మహిమా ఐశ్వర్యమును బట్టి మీ కావలసినవన్నిటిని తీర్చును."
    },
    {
      verse: "Therefore do not worry about tomorrow, for tomorrow will worry about itself. Each day has enough trouble of its own.",
      reference: "Matthew 6:34",
      chapter: "Matthew 6",
      book: "Matthew",
      teluguVerse: "కాగా రేపటి గురించి చింతించకుడి; రేపు తనగురించి తానే చింతించుకొనును; ప్రతిదినమునకు దాని దు:ఖము చాలును."
    },
    {
      verse: "Come to me, all you who are weary and burdened, and I will give you rest.",
      reference: "Matthew 11:28",
      chapter: "Matthew 11",
      book: "Matthew",
      teluguVerse: "కష్టపడి భారము మోయువారందరా, నా దగ్గరకు రండి; నేను మీకు విశ్రాంతి దయచేతును."
    },
    {
      verse: "But seek first his kingdom and his righteousness, and all these things will be given to you as well.",
      reference: "Matthew 6:33",
      chapter: "Matthew 6",
      book: "Matthew",
      teluguVerse: "కాని మొదట దేవుని రాజ్యమును ఆయన నీతిని వెదకుడి; అప్పుడు ఇవన్నియు మీకు కలుగును."
    },
    {
      verse: "For we walk by faith, not by sight.",
      reference: "2 Corinthians 5:7",
      chapter: "2 Corinthians 5",
      book: "2 Corinthians",
      teluguVerse: "మేము కనులతో కాక విశ్వాసముతో నడుచుచున్నాము."
    },
    {
      verse: "The name of the Lord is a fortified tower; the righteous run to it and are safe.",
      reference: "Proverbs 18:10",
      chapter: "Proverbs 18",
      book: "Proverbs",
      teluguVerse: "యెహోవా నామమే దృఢమైన గోపురము; నీతిమంతులు దానిలోనికి పరుగెత్తి కపారపడుదురు."
    },
    {
      verse: "Let us then approach God's throne of grace with confidence, so that we may receive mercy and find grace to help us in our time of need.",
      reference: "Hebrews 4:16",
      chapter: "Hebrews 4",
      book: "Hebrews",
      teluguVerse: "కాబట్టి మనము దయ పొందుటకును అవసరమైన సమయమందు సహాయపడు కృపను కనుగొనుటకును ధైర్యముతో కృప సింహాసనము దగ్గరకు వెళ్లుదము."
    }
  ];

  const imagePool = [
    "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1431794062232-2a99a5431c6c?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1445263670085-85a8e5a3c2d0?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1465189684280-6a8fa9b19a7a?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=600&fit=crop"
  ];

  // Get daily verse based on day of year for consistent daily rotation
  const getDailyVerse = () => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    
    // Use day of year to select verse consistently
    const verseIndex = dayOfYear % bibleVerses.length;
    const selectedVerse = bibleVerses[verseIndex];
    
    // Use a different calculation for images to ensure variety
    const imageIndex1 = (dayOfYear * 3) % imagePool.length;
    const imageIndex2 = (dayOfYear * 7) % imagePool.length;
    
    return {
      ...selectedVerse,
      verseImage: imagePool[imageIndex1],
      teluguImage: imagePool[imageIndex2]
    };
  };

  const getRandomVerse = () => {
    const randomIndex = Math.floor(Math.random() * bibleVerses.length);
    const selectedVerse = bibleVerses[randomIndex];
    const randomImage1 = imagePool[Math.floor(Math.random() * imagePool.length)];
    const randomImage2 = imagePool[Math.floor(Math.random() * imagePool.length)];
    
    return {
      ...selectedVerse,
      verseImage: randomImage1,
      teluguImage: randomImage2
    };
  };

  // Load daily verse on component mount
  useEffect(() => {
    const today = new Date().toDateString();
    const lastUpdate = localStorage.getItem('dailyVerseDate');
    
    if (lastUpdate !== today) {
      const newVerse = getDailyVerse();
      setVerseData(newVerse);
      localStorage.setItem('dailyVerseDate', today);
      localStorage.setItem('dailyVerseData', JSON.stringify(newVerse));
    } else {
      const savedVerse = localStorage.getItem('dailyVerseData');
      if (savedVerse) {
        setVerseData(JSON.parse(savedVerse));
      } else {
        // Fallback if saved data is corrupted
        const newVerse = getDailyVerse();
        setVerseData(newVerse);
        localStorage.setItem('dailyVerseData', JSON.stringify(newVerse));
      }
    }
  }, []);

  const refreshVerse = () => {
    setLoading(true);
    setTimeout(() => {
      const newVerse = getRandomVerse();
      setVerseData(newVerse);
      localStorage.setItem('dailyVerseData', JSON.stringify(newVerse));
      setLoading(false);
    }, 500);
  };

  const openBibleChapter = () => {
    const searchQuery = verseData.chapter.replace(' ', '+');
    window.open(`https://www.biblegateway.com/passage/?search=${searchQuery}&version=NIV`, '_blank');
  };

  return (
    <Card className="glass-effect border-white/20 text-white animate-fade-in">
      <CardHeader className="text-center">
        <div className="flex justify-between items-center">
          <div></div>
          <div>
            <CardTitle className="text-2xl font-bible mb-2">Daily Verse</CardTitle>
            <p className="text-white/80">{today}</p>
          </div>
          <Button
            onClick={refreshVerse}
            variant="ghost"
            size="sm"
            disabled={loading}
            className="text-white hover:bg-white/20"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
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
