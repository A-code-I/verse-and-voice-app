
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface SermonDetailsProps {
  description: string;
  bibleReferences: string[];
}

const SermonDetails = ({ description, bibleReferences }: SermonDetailsProps) => {
  const openBibleReference = (ref: string) => {
    window.open(`https://www.biblegateway.com/passage/?search=${ref}&version=NIV`, '_blank');
  };

  return (
    <div className="space-y-4 pt-4 border-t border-white/20">
      <div>
        <h4 className="font-semibold text-bible-gold mb-2">Description</h4>
        <p className="text-white/80 text-sm leading-relaxed">{description}</p>
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
