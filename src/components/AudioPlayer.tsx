
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Heart, SkipBack, SkipForward } from "lucide-react";
import { Sermon } from '@/pages/Index';

interface AudioPlayerProps {
  sermon: Sermon;
  onLike: () => void;
}

const AudioPlayer = ({ sermon, onLike }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Convert YouTube URL to audio-friendly format (this is a simulation)
  const getAudioUrl = (youtubeUrl: string) => {
    // In a real app, you'd use a YouTube API or audio extraction service
    // For demo purposes, we'll use a placeholder audio URL
    return "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav";
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [sermon]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipTime = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime += seconds;
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    const newVolume = value[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
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
        {/* Audio Element */}
        <audio 
          ref={audioRef} 
          src={getAudioUrl(sermon.youtubeUrl)}
          preload="metadata"
        />

        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-white/60">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => skipTime(-5)}
            className="text-white hover:bg-white/20"
            title="Rewind 5 seconds"
          >
            <SkipBack className="h-5 w-5" />
            <span className="text-xs ml-1">5s</span>
          </Button>

          <Button
            onClick={togglePlayPause}
            className="bg-bible-gold hover:bg-bible-gold/80 text-bible-navy font-semibold px-8"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => skipTime(5)}
            className="text-white hover:bg-white/20"
            title="Forward 5 seconds"
          >
            <span className="text-xs mr-1">5s</span>
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        {/* Volume Control */}
        <div className="space-y-2">
          <label className="text-sm text-white/80">Volume</label>
          <Slider
            value={[volume]}
            max={1}
            min={0}
            step={0.1}
            onValueChange={handleVolumeChange}
            className="w-full"
          />
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
