
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Heart, Play, Pause, SkipBack, SkipForward, Volume2, ExternalLink, FileText } from "lucide-react";
import { Sermon } from '@/pages/Index';
import { getYouTubeVideoId, createEmbedUrl } from '@/utils/youtube';
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
  const [showSummary, setShowSummary] = useState(false);
  const playerRef = useRef<HTMLIFrameElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const videoId = sermon.youtube_url ? getYouTubeVideoId(sermon.youtube_url) : null;
  const embedUrl = videoId ? createEmbedUrl(videoId) : '';
  const hasAudioDrive = sermon.audio_drive_url;
  const hasSummary = sermon.gdoc_summary_url;

  const togglePlayPause = () => {
    if (hasAudioDrive && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else if (videoId && playerRef.current) {
      if (isPlaying) {
        playerRef.current.contentWindow?.postMessage(
          '{"event":"command","func":"pauseVideo","args":""}',
          '*'
        );
      } else {
        playerRef.current.contentWindow?.postMessage(
          '{"event":"command","func":"playVideo","args":""}',
          '*'
        );
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipTime = (seconds: number) => {
    if (hasAudioDrive && audioRef.current) {
      audioRef.current.currentTime += seconds;
    } else if (videoId && playerRef.current) {
      const newTime = Math.max(0, currentTime + seconds);
      playerRef.current.contentWindow?.postMessage(
        `{"event":"command","func":"seekTo","args":[${newTime},true]}`,
        '*'
      );
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
    if (hasAudioDrive && audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    } else if (videoId && playerRef.current) {
      playerRef.current.contentWindow?.postMessage(
        `{"event":"command","func":"seekTo","args":[${newTime},true]}`,
        '*'
      );
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

  const openSummary = () => {
    if (sermon.gdoc_summary_url) {
      window.open(sermon.gdoc_summary_url, '_blank');
    }
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
              {videoId && (
                <Badge variant="outline" className="border-red-400/50 text-red-300">
                  YouTube Audio
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {hasSummary && (
              <Button
                variant="outline"
                size="sm"
                onClick={openSummary}
                className="border-white/30 text-white hover:bg-white/20"
              >
                <FileText className="h-4 w-4 mr-1" />
                Summary
                <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            )}
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
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Audio Player */}
        <div className="space-y-4">
          {hasAudioDrive ? (
            <div className="relative bg-gray-900 rounded-lg overflow-hidden p-6">
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
                className="hidden"
              />
            </div>
          ) : videoId ? (
            <div className="relative bg-gray-900 rounded-lg overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-bible-purple to-bible-navy flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-2xl mb-2">🎵</div>
                  <p className="text-sm font-medium">Audio Playing: {sermon.title}</p>
                  <p className="text-xs text-white/60 mt-1">YouTube Audio Only</p>
                </div>
              </div>
              
              <div className="absolute top-0 left-0 w-full h-0 overflow-hidden opacity-0 pointer-events-none">
                <iframe
                  ref={playerRef}
                  src={`${embedUrl}&controls=1&disablekb=1&fs=0&modestbranding=1&rel=0&showinfo=0`}
                  title={sermon.title}
                  className="w-full h-96"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
              <p className="text-white/60">No audio source available</p>
            </div>
          )}

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
                disabled={!hasAudioDrive && !videoId}
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
                disabled={!hasAudioDrive && !videoId}
              >
                <SkipBack className="h-5 w-5" />
                <span className="text-xs ml-1">5s</span>
              </Button>

              <Button
                onClick={togglePlayPause}
                className="bg-bible-gold hover:bg-bible-gold/80 text-bible-navy font-semibold px-8 py-3"
                disabled={!hasAudioDrive && !videoId}
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => skipTime(5)}
                className="text-white hover:bg-white/20"
                disabled={!hasAudioDrive && !videoId}
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

        <SermonDetails
          description={sermon.description}
          bibleReferences={sermon.bible_references}
        />
      </CardContent>
    </Card>
  );
};

export default AudioPlayer;
