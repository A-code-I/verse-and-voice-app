
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, SkipBack, SkipForward } from "lucide-react";
import { Sermon } from '@/pages/Index';

interface AudioPlayerProps {
  sermon: Sermon;
  onLike: () => void;
}

const AudioPlayer = ({ sermon, onLike }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Extract video ID from YouTube URL
  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeVideoId(sermon.youtubeUrl);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}` : '';

  const skipTime = (seconds: number) => {
    if (!iframeRef.current || !videoId) return;
    
    // Post message to YouTube iframe to seek
    iframeRef.current.contentWindow?.postMessage(
      `{"event":"command","func":"seekTo","args":[${seconds},true]}`,
      '*'
    );
  };

  const togglePlayPause = () => {
    if (!iframeRef.current || !videoId) return;

    if (isPlaying) {
      iframeRef.current.contentWindow?.postMessage(
        '{"event":"command","func":"pauseVideo","args":""}',
        '*'
      );
    } else {
      iframeRef.current.contentWindow?.postMessage(
        '{"event":"command","func":"playVideo","args":""}',
        '*'
      );
    }
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
        {/* YouTube Player */}
        {videoId ? (
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <iframe
              ref={iframeRef}
              src={embedUrl}
              title={sermon.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-white/60">Invalid YouTube URL</p>
          </div>
        )}

        {/* Player Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => skipTime(-5)}
            className="text-white hover:bg-white/20"
            title="Rewind 5 seconds"
            disabled={!videoId}
          >
            <SkipBack className="h-5 w-5" />
            <span className="text-xs ml-1">5s</span>
          </Button>

          <Button
            onClick={togglePlayPause}
            className="bg-bible-gold hover:bg-bible-gold/80 text-bible-navy font-semibold px-8"
            disabled={!videoId}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => skipTime(5)}
            className="text-white hover:bg-white/20"
            title="Forward 5 seconds"
            disabled={!videoId}
          >
            <span className="text-xs mr-1">5s</span>
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        {/* Sermon Details */}
        <div className="space-y-4 pt-4 border-t border-white/20">
          <div>
            <h4 className="font-semibold text-bible-gold mb-2">Description</h4>
            <p className="text-white/80 text-sm leading-relaxed">{sermon.description}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-bible-gold mb-2">Bible References</h4>
            <div className="flex flex-wrap gap-2">
              {sermon.bibleReferences.map((ref, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="border-bible-gold/50 text-bible-gold cursor-pointer hover:bg-bible-gold/20"
                  onClick={() => window.open(`https://www.biblegateway.com/passage/?search=${ref}&version=NIV`, '_blank')}
                >
                  {ref}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioPlayer;
