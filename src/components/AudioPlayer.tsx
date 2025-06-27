
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
  const [error, setError] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement>(null);

  // Determine audio source preference - prioritize Google Drive if available
  const audioSource = sermon.audio_drive_url || sermon.youtube_url;
  const isUsingDrive = !!sermon.audio_drive_url;

  // Function to convert Google Drive URL to direct audio URL
  const convertGoogleDriveUrl = (url: string): string => {
    if (!url.includes('drive.google.com')) return url;
    
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
    }
    return url;
  };

  // Function to extract YouTube audio URL (placeholder - in reality you'd need a backend service)
  const getYouTubeAudioUrl = (url: string): string => {
    // This is a placeholder - in reality, you'd need a backend service to extract audio
    // For now, we'll show an error message for YouTube URLs
    return '';
  };

  const audioUrl = isUsingDrive 
    ? convertGoogleDriveUrl(audioSource || '') 
    : getYouTubeAudioUrl(audioSource || '');

  console.log('Audio URL:', audioUrl, 'Is using drive:', isUsingDrive);

  // Reset player when sermon changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError('');
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [sermon.id]);

  // Set initial volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const togglePlayPause = async () => {
    if (!audioRef.current || !audioUrl) {
      setError('No audio source available');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setError('Failed to play audio. Please check the audio URL.');
    } finally {
      setLoading(false);
    }
  };

  const skipTime = (seconds: number) => {
    if (audioRef.current && audioUrl) {
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
    if (audioRef.current && audioUrl) {
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

  const handleAudioError = () => {
    setError('Failed to load audio. Please check the audio URL or try a different source.');
    setLoading(false);
  };

  const handleCanPlay = () => {
    setError('');
  };

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
            {isUsingDrive ? (
              <Badge variant="outline" className="border-green-400/50 text-green-300">
                Drive Audio
              </Badge>
            ) : (
              <Badge variant="outline" className="border-red-400/50 text-red-300">
                YouTube Audio
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
      
      {/* Audio Player */}
      {audioUrl ? (
        <div className="space-y-4">
          <div className="relative bg-gradient-to-r from-bible-gold/20 to-bible-purple/20 rounded-lg overflow-hidden p-4">
            <div className="text-center text-white mb-4">
              <div className="text-3xl mb-2">🎵</div>
              <p className="text-sm font-medium">Now Playing: {sermon.title}</p>
              <p className="text-xs text-white/60">
                {isUsingDrive ? 'Google Drive Audio' : 'YouTube Audio'}
              </p>
            </div>
            
            <audio
              ref={audioRef}
              src={audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              onError={handleAudioError}
              onCanPlay={handleCanPlay}
              className="hidden"
              preload="metadata"
              crossOrigin="anonymous"
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Audio Controls */}
          <div className="space-y-3">
            {/* Time Slider */}
            <div className="space-y-2">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="w-full"
                disabled={!audioUrl || error !== ''}
              />
              <div className="flex justify-between text-xs text-white/60">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => skipTime(-5)}
                className="text-white hover:bg-white/20"
                disabled={!audioUrl || error !== ''}
              >
                <SkipBack className="h-4 w-4" />
                <span className="text-xs ml-1">5s</span>
              </Button>

              <Button
                onClick={togglePlayPause}
                className="bg-bible-gold hover:bg-bible-gold/80 text-bible-navy font-semibold px-6 py-2"
                disabled={!audioUrl || loading || error !== ''}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-bible-navy"></div>
                ) : isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => skipTime(5)}
                className="text-white hover:bg-white/20"
                disabled={!audioUrl || error !== ''}
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
                onValueChange={handleVolumeChange}
                className="flex-1"
              />
              <span className="text-xs text-white/60 w-8">{volume}%</span>
            </div>
          </div>

          {!isUsingDrive && sermon.youtube_url && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
              <p className="text-yellow-300 text-sm">
                Note: YouTube audio extraction requires additional setup. Consider uploading audio files to Google Drive for better playback.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-800/50 rounded-lg p-6 text-center">
          <p className="text-white/60">No audio source available for this sermon</p>
        </div>
      )}

      <div className="mt-4">
        <SermonDetails
          description={sermon.description}
          bibleReferences={sermon.bible_references}
        />
      </div>
    </div>
  );
};

export default AudioPlayer;
