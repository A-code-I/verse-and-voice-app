
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const audioRef = useRef<HTMLAudioElement>(null);

  const hasAudioDrive = !!sermon.audio_drive_url;

  // Reset player when sermon changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [sermon.id]);

  // Set initial volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const togglePlayPause = async () => {
    if (!audioRef.current || !hasAudioDrive) return;
    
    setLoading(true);
    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setLoading(false);
    }
  };

  const skipTime = (seconds: number) => {
    if (audioRef.current && hasAudioDrive) {
      const newTime = Math.max(0, Math.min(audioRef.current.currentTime + seconds, duration));
      audioRef.current.currentTime = newTime;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    if (audioRef.current && hasAudioDrive) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="glass-effect border-white/20 text-white">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-xl font-bible">{sermon.title}</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary" className="bg-bible-purple/20 text-white">
                {sermon.category}
              </Badge>
              <Badge variant="outline" className="border-white/30 text-white">
                {new Date(sermon.sermon_date).toLocaleDateString()}
              </Badge>
              {hasAudioDrive && (
                <Badge variant="outline" className="border-green-400/50 text-green-300">
                  Drive Audio
                </Badge>
              )}
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
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Audio Player */}
        {hasAudioDrive ? (
          <div className="space-y-4">
            <div className="relative bg-gradient-to-r from-bible-purple to-bible-navy rounded-lg overflow-hidden p-6">
              <div className="text-center text-white mb-4">
                <div className="text-4xl mb-2">🎵</div>
                <p className="text-lg font-medium">Now Playing: {sermon.title}</p>
                <p className="text-sm text-white/60">Drive Audio</p>
              </div>
              
              <audio
                ref={audioRef}
                src={sermon.audio_drive_url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
                preload="metadata"
              />
            </div>

            {/* Audio Controls */}
            <div className="space-y-4">
              {/* Time Slider */}
              <div className="space-y-2">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={1}
                  onValueChange={handleSeek}
                  className="w-full"
                  disabled={!hasAudioDrive}
                />
                <div className="flex justify-between text-xs text-white/60">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => skipTime(-5)}
                  className="text-white hover:bg-white/20"
                  disabled={!hasAudioDrive}
                >
                  <SkipBack className="h-5 w-5" />
                  <span className="text-xs ml-1">5s</span>
                </Button>

                <Button
                  onClick={togglePlayPause}
                  className="bg-bible-gold hover:bg-bible-gold/80 text-bible-navy font-semibold px-8 py-3"
                  disabled={!hasAudioDrive || loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-bible-navy"></div>
                  ) : isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => skipTime(5)}
                  className="text-white hover:bg-white/20"
                  disabled={!hasAudioDrive}
                >
                  <span className="text-xs mr-1">5s</span>
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-3 max-w-xs mx-auto">
                <Volume2 className="h-4 w-4 text-white/60" />
                <Slider
                  value={[volume]}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="flex-1"
                />
                <span className="text-xs text-white/60 w-8">{volume}%</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-white/60">No audio source available for this sermon</p>
          </div>
        )}

        <SermonDetails
          description={sermon.description}
          bibleReferences={sermon.bible_references}
        />
      </CardContent>
    </Card>
  );
};

export default AudioPlayer;
