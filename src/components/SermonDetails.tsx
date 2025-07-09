
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface SermonDetailsProps {
  description: string;
  bibleReferences: string[];
  onSeekToTime?: (timeInSeconds: number) => void;
}

const SermonDetails = ({ description, bibleReferences, onSeekToTime }: SermonDetailsProps) => {
  const openBibleReference = (ref: string) => {
    window.open(`https://www.biblegateway.com/passage/?search=${ref}&version=NIV`, '_blank');
  };

  // Parse timestamps from description and make them clickable
  const parseTimestamps = (text: string) => {
    // Match timestamps in formats like 1:12, 12:34, 1:23:45
    const timestampRegex = /(\d{1,2}:\d{2}(?::\d{2})?)/g;
    const parts = text.split(timestampRegex);
    
    return parts.map((part, index) => {
      if (timestampRegex.test(part)) {
        const timeInSeconds = parseTimeToSeconds(part);
        return (
          <span
            key={index}
            className="text-bible-gold cursor-pointer hover:text-bible-gold/80 underline font-semibold"
            onClick={() => onSeekToTime && onSeekToTime(timeInSeconds)}
            title={`Click to seek to ${part}`}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Convert timestamp string to seconds
  const parseTimeToSeconds = (timeString: string): number => {
    const parts = timeString.split(':').map(Number);
    
    if (parts.length === 2) {
      // Format: mm:ss
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      // Format: hh:mm:ss
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    
    return 0;
  };

  return (
    <div className="space-y-4 pt-4 border-t border-white/20">
      <div>
        <h4 className="font-semibold text-bible-gold mb-2">Description</h4>
        <p className="text-white/80 text-sm leading-relaxed">
          {onSeekToTime ? parseTimestamps(description) : description}
        </p>
        {onSeekToTime && (
          <p className="text-xs text-white/50 mt-1 italic">
            Click on timestamps to seek to that time in the audio
          </p>
        )}
      </div>
      
      <div>
        <h4 className="font-semibold text-bible-gold mb-2">Bible References</h4>
        <div className="flex flex-wrap gap-2">
          {bibleReferences.map((ref, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="border-bible-gold/50 text-bible-gold cursor-pointer hover:bg-bible-gold/20"
              onClick={() => openBibleReference(ref)}
            >
              {ref}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SermonDetails;
