
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { Sermon } from '@/pages/Index';
import { getYouTubeVideoId, createEmbedUrl } from '@/utils/youtube';
import YouTubePlayer, { YouTubePlayerRef } from './YouTubePlayer';
import PlayerControls from './PlayerControls';
import SermonDetails from './SermonDetails';

interface AudioPlayerProps {
  sermon: Sermon;
  onLike: () => void;
}

const AudioPlayer = ({ sermon, onLike }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<YouTubePlayerRef>(null);

  const videoId = getYouTubeVideoId(sermon.youtubeUrl);
  const embedUrl = videoId ? createEmbedUrl(videoId) : '';

  const skipTime = (seconds: number) => {
    playerRef.current?.skipTime(seconds);
  };

  const togglePlayPause = () => {
    playerRef.current?.togglePlayPause(isPlaying);
    setIsPlaying(!isPlaying);
  };

  return (
    <Card className="glass-effect border-white/20 text-white">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <CardTitle className="text-xl font-bible">{sermon.title}</CardTitle>
            <Badge variant="secondary" className="bg-bible-purple/20 text-white">
              {sermon.category}
            </Badge>
          </div>
          <Button
            variant="ghost"
            onClick={onLike}
            className="text-white hover:bg-white/20"
          >
            <Heart 
              className={`h-6 w-6 ${sermon.liked ? 'fill-red-500 text-red-500' : ''}`} 
            />
            <span className="ml-2">{sermon.likes}</span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <YouTubePlayer
          ref={playerRef}
          videoId={videoId}
          title={sermon.title}
          embedUrl={embedUrl}
        />

        <PlayerControls
          isPlaying={isPlaying}
          onTogglePlayPause={togglePlayPause}
          onSkip={skipTime}
          disabled={!videoId}
        />

        <SermonDetails
          description={sermon.description}
          bibleReferences={sermon.bibleReferences}
        />
      </CardContent>
    </Card>
  );
};

export default AudioPlayer;
