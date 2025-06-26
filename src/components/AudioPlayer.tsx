
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Heart, Play, Pause, SkipBack, SkipForward, Volume2, ExternalLink, FileText, X } from "lucide-react";
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
  const [showInternalSummary, setShowInternalSummary] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const youtubePlayerRef = useRef<HTMLIFrameElement>(null);

  const videoId = sermon.youtube_url ? getYouTubeVideoId(sermon.youtube_url) : null;
  const embedUrl = videoId ? createEmbedUrl(videoId) : '';
  const hasAudioDrive = !!sermon.audio_drive_url;
  const hasSummary = !!sermon.gdoc_summary_url;

  // Reset player when sermon changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setShowInternalSummary(false);
  }, [sermon.id]);

  const togglePlayPause = () => {
    if (hasAudioDrive && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
    } else if (videoId && youtubePlayerRef.current) {
      const command = isPlaying ? 'pauseVideo' : 'playVideo';
      youtubePlayerRef.current.contentWindow?.postMessage(
        `{"event":"command","func":"${command}","args":""}`,
        '*'
      );
      setIsPlaying(!isPlaying);
    }
  };

  const skipTime = (seconds: number) => {
    if (hasAudioDrive && audioRef.current) {
      const newTime = Math.max(0, Math.min(audioRef.current.currentTime + seconds, duration));
      audioRef.current.currentTime = newTime;
    } else if (videoId && youtubePlayerRef.current) {
      const newTime = Math.max(0, currentTime + seconds);
      youtubePlayerRef.current.contentWindow?.postMessage(
        `{"event":"command","func":"seekTo","args":[${newTime},true]}`,
        '*'
      );
      setCurrentTime(newTime);
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
    } else if (videoId && youtubePlayerRef.current) {
      youtubePlayerRef.current.contentWindow?.postMessage(
        `{"event":"command","func":"seekTo","args":[${newTime},true]}`,
        '*'
      );
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

  const openExternalSummary = () => {
    if (sermon.gdoc_summary_url) {
      window.open(sermon.gdoc_summary_url, '_blank');
    }
  };

  const hasAudioSource = hasAudioDrive || videoId;

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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInternalSummary(!showInternalSummary)}
                  className="border-white/30 text-white hover:bg-white/20"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  {showInternalSummary ? 'Hide' : 'View'} Summary
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openExternalSummary}
                  className="border-white/30 text-white hover:bg-white/20"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  G-Doc
                </Button>
              </div>
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
        {hasAudioSource ? (
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
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                  preload="metadata"
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
                    ref={youtubePlayerRef}
                    src={`${embedUrl}&controls=1&disablekb=1&fs=0&modestbranding=1&rel=0&showinfo=0&autoplay=0`}
                    title={sermon.title}
                    className="w-full h-96"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </div>
            ) : null}

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
                  disabled={!hasAudioSource}
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
                  disabled={!hasAudioSource}
                >
                  <SkipBack className="h-5 w-5" />
                  <span className="text-xs ml-1">5s</span>
                </Button>

                <Button
                  onClick={togglePlayPause}
                  className="bg-bible-gold hover:bg-bible-gold/80 text-bible-navy font-semibold px-8 py-3"
                  disabled={!hasAudioSource}
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => skipTime(5)}
                  className="text-white hover:bg-white/20"
                  disabled={!hasAudioSource}
                >
                  <span className="text-xs mr-1">5s</span>
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>

              {/* Volume Control */}
              {hasAudioDrive && (
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
              )}
            </div>
          </div>
        ) : (
          <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-white/60">No audio source available for this sermon</p>
          </div>
        )}

        {/* Internal Summary Display */}
        {showInternalSummary && hasSummary && (
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-bible-gold">Sermon Summary</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInternalSummary(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-white/80">
                <p className="mb-4">
                  This sermon summary is available in the Google Doc. Click "G-Doc" above to view the full detailed summary.
                </p>
                <Button
                  onClick={openExternalSummary}
                  className="bg-bible-gold text-bible-navy hover:bg-bible-gold/80"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Full Summary
                </Button>
              </div>
            </CardContent>
          </Card>
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
