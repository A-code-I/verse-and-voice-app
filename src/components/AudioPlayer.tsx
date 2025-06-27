
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Heart, Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Sermon } from '@/pages/Index';
import SermonDetails from './SermonDetails';

interface AudioPlayerProps {
  sermon: Sermon;
  onLike: () => void;
}

const AudioPlayer = ({ sermon, onLike }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // More flexible YouTube video ID extraction including live streams
  const getYouTubeVideoId = (url: string): string | null => {
    if (!url || typeof url !== 'string') return null;
    
    // Handle various YouTube URL formats including live streams
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
      /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
      /(?:youtube\.com\/v\/)([^&\n?#]+)/,
      /(?:youtu\.be\/)([^&\n?#]+)/,
      /(?:youtube\.com\/.*[?&]v=)([^&\n?#]+)/,
      /(?:youtube\.com\/live\/)([^&\n?#]+)/  // Added support for live streams
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1] && match[1].length === 11) {
        return match[1];
      }
    }
    
    // If it looks like a video ID itself (11 characters)
    if (url.length === 11 && /^[a-zA-Z0-9_-]+$/.test(url)) {
      return url;
    }
    
    return null;
  };

  const videoId = sermon.youtube_url ? getYouTubeVideoId(sermon.youtube_url) : null;

  // Reset player when sermon changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError('');
    setLoading(false);
  }, [sermon.id]);

  // Listen for YouTube player events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return;
      
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'video-progress') {
          setCurrentTime(data.info.currentTime || 0);
          setDuration(data.info.duration || 0);
        } else if (data.event === 'onStateChange') {
          // YouTube player state: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
          setIsPlaying(data.info === 1);
          setLoading(data.info === 3);
        }
      } catch (error) {
        // Ignore parsing errors
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const togglePlayPause = () => {
    if (!videoId || !iframeRef.current) {
      setError('Invalid YouTube URL');
      return;
    }

    setError('');
    
    try {
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
    } catch (error) {
      console.error('Error controlling YouTube player:', error);
      setError('Failed to control playback');
    }
  };

  const skipTime = (seconds: number) => {
    if (!videoId || !iframeRef.current) return;
    
    const newTime = Math.max(0, currentTime + seconds);
    iframeRef.current.contentWindow?.postMessage(
      `{"event":"command","func":"seekTo","args":[${newTime},true]}`,
      '*'
    );
    setCurrentTime(newTime);
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    if (!videoId || !iframeRef.current) return;
    
    iframeRef.current.contentWindow?.postMessage(
      `{"event":"command","func":"seekTo","args":[${newTime},true]}`,
      '*'
    );
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!videoId) {
    return (
      <div className="bg-gradient-to-r from-bible-purple/20 to-bible-navy/20 rounded-lg p-4 border border-bible-gold/30">
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 text-center">
          <p className="text-red-300 text-lg">Invalid YouTube URL</p>
          <p className="text-red-300/60 text-sm mt-2">Please check the YouTube link: {sermon.youtube_url}</p>
          <p className="text-red-300/40 text-xs mt-1">
            Supported formats: youtube.com/watch?v=..., youtube.com/live/..., youtu.be/..., or video ID
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-bible-purple/20 to-bible-navy/20 rounded-lg p-4 border border-bible-gold/30">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2 flex-1">
          <h3 className="text-lg font-bible text-white">{sermon.title}</h3>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-bible-purple/20 text-white">
              {sermon.category}
            </Badge>
            <Badge variant="outline" className="border-white/30 text-white">
              {new Date(sermon.sermon_date).toLocaleDateString()}
            </Badge>
            <Badge variant="outline" className="border-red-400/50 text-red-300">
              YouTube Audio
            </Badge>
          </div>
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
      
      {/* Audio Player Interface */}
      <div className="space-y-4">
        {/* Audio Visualization */}
        <div className="relative bg-gradient-to-r from-bible-gold/20 to-bible-purple/20 rounded-lg overflow-hidden p-6">
          <div className="text-center text-white">
            <div className="text-4xl mb-3">
              {loading ? '⏳' : isPlaying ? '🎵' : '⏸️'}
            </div>
            <p className="text-lg font-medium mb-1">{sermon.title}</p>
            <p className="text-sm text-white/70">Audio Only Mode</p>
            {duration > 0 && (
              <p className="text-xs text-white/50 mt-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Audio Controls */}
        <div className="space-y-4">
          {/* Time Slider */}
          {duration > 0 && (
            <div className="space-y-2">
              <Slider
                value={[currentTime]}
                max={duration}
                step={1}
                onValueChange={handleSeek}
                className="w-full"
                disabled={!videoId || error !== ''}
              />
              <div className="flex justify-between text-xs text-white/60">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => skipTime(-5)}
              className="text-white hover:bg-white/20"
              disabled={!videoId || error !== ''}
            >
              <SkipBack className="h-4 w-4" />
              <span className="text-xs ml-1">5s</span>
            </Button>

            <Button
              onClick={togglePlayPause}
              className="bg-bible-gold hover:bg-bible-gold/80 text-bible-navy font-semibold px-8 py-3"
              disabled={!videoId || error !== ''}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-bible-navy"></div>
              ) : isPlaying ? (
                <><Pause className="h-5 w-5 mr-2" /> Pause</>
              ) : (
                <><Play className="h-5 w-5 mr-2" /> Play</>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => skipTime(5)}
              className="text-white hover:bg-white/20"
              disabled={!videoId || error !== ''}
            >
              <span className="text-xs mr-1">5s</span>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3 max-w-xs mx-auto">
            <Volume2 className="h-4 w-4 text-white/60" />
            <Slider
              value={[volume]}
              max={100}
              step={1}
              onValueChange={(value) => {
                setVolume(value[0]);
                if (iframeRef.current) {
                  iframeRef.current.contentWindow?.postMessage(
                    `{"event":"command","func":"setVolume","args":[${value[0]}]}`,
                    '*'
                  );
                }
              }}
              className="flex-1"
            />
            <span className="text-xs text-white/60 w-8">{volume}%</span>
          </div>
        </div>

        {/* Hidden YouTube iframe for audio playback */}
        <div className="absolute top-0 left-0 w-0 h-0 overflow-hidden opacity-0 pointer-events-none">
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=0&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0&showinfo=0&mute=0&loop=0&origin=${window.location.origin}`}
            title={`${sermon.title} - Audio`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </div>

      <div className="mt-6">
        <SermonDetails
          description={sermon.description}
          bibleReferences={sermon.bible_references}
        />
      </div>
    </div>
  );
};

export default AudioPlayer;
