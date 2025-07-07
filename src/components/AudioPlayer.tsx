
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
  const [playerReady, setPlayerReady] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPlayedPosition, setLastPlayedPosition] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);

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
      /(?:youtube\.com\/live\/)([^&\n?#]+)/
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

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube IFrame API Ready');
      };
    }
  }, []);

  // Load last played position from localStorage
  useEffect(() => {
    if (videoId) {
      const savedPosition = localStorage.getItem(`sermon-position-${videoId}`);
      if (savedPosition) {
        const position = parseFloat(savedPosition);
        setLastPlayedPosition(position);
        setCurrentTime(position);
        console.log(`Loaded saved position: ${position}s for video ${videoId}`);
      }
    }
  }, [videoId]);

  // Save current position to localStorage periodically
  useEffect(() => {
    if (videoId && currentTime > 0 && !isDragging && isPlaying) {
      localStorage.setItem(`sermon-position-${videoId}`, currentTime.toString());
    }
  }, [videoId, currentTime, isDragging, isPlaying]);

  // Initialize YouTube player when API is ready
  useEffect(() => {
    if (!videoId || !window.YT?.Player) return;

    const initializePlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          origin: window.location.origin
        },
        events: {
          onReady: (event: any) => {
            console.log('YouTube player ready');
            setPlayerReady(true);
            setError('');
            
            // Set initial volume
            event.target.setVolume(volume);
            
            // Get duration
            const videoDuration = event.target.getDuration();
            if (videoDuration > 0) {
              setDuration(videoDuration);
              console.log('Video duration:', videoDuration);
            }
            
            // Seek to saved position if exists
            if (lastPlayedPosition > 0) {
              console.log(`Seeking to saved position: ${lastPlayedPosition}s`);
              event.target.seekTo(lastPlayedPosition, true);
            }
            
            // Start time tracking
            const timeUpdateInterval = setInterval(() => {
              if (!isDragging && playerRef.current) {
                const currentVideoTime = playerRef.current.getCurrentTime();
                const videoDur = playerRef.current.getDuration();
                
                if (currentVideoTime !== undefined && currentVideoTime >= 0) {
                  setCurrentTime(currentVideoTime);
                }
                
                if (videoDur > 0 && videoDur !== duration) {
                  setDuration(videoDur);
                }
              }
            }, 1000);
            
            // Store interval reference for cleanup
            playerRef.current.timeUpdateInterval = timeUpdateInterval;
          },
          onStateChange: (event: any) => {
            const state = event.data;
            console.log('Player state changed:', state);
            
            // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
            setIsPlaying(state === 1);
            setLoading(state === 3);
            
            // Handle video end
            if (state === 0) {
              setCurrentTime(0);
              if (videoId) {
                localStorage.removeItem(`sermon-position-${videoId}`);
              }
            }
          },
          onError: (event: any) => {
            console.error('YouTube player error:', event.data);
            setError('Failed to load video');
            setPlayerReady(false);
          }
        }
      });
    };

    if (window.YT?.Player) {
      initializePlayer();
    } else {
      window.onYouTubeIframeAPIReady = initializePlayer;
    }

    return () => {
      if (playerRef.current?.timeUpdateInterval) {
        clearInterval(playerRef.current.timeUpdateInterval);
      }
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, lastPlayedPosition, volume, isDragging, duration]);

  // Reset player when sermon changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError('');
    setLoading(false);
    setPlayerReady(false);
    setIsDragging(false);
  }, [sermon.id]);

  const togglePlayPause = () => {
    if (!videoId || !playerRef.current) {
      setError('Player not ready');
      return;
    }

    setError('');
    console.log('Toggle play/pause, current state:', isPlaying);
    
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const skipTime = (seconds: number) => {
    if (!videoId || !playerRef.current || !playerReady) return;
    
    const newTime = Math.max(0, Math.min(duration || currentTime + Math.abs(seconds), currentTime + seconds));
    console.log(`Skipping to: ${newTime}s`);
    setCurrentTime(newTime);
    playerRef.current.seekTo(newTime, true);
  };

  const handleSeekStart = () => {
    setIsDragging(true);
  };

  const handleSeekChange = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
  };

  const handleSeekEnd = (value: number[]) => {
    const newTime = value[0];
    setIsDragging(false);
    
    if (!videoId || !playerRef.current || !playerReady) return;
    
    console.log(`Seeking to: ${newTime}s`);
    playerRef.current.seekTo(newTime, true);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (playerRef.current && playerReady) {
      playerRef.current.setVolume(newVolume);
    }
  };

  const handleLikeClick = () => {
    console.log('Like button clicked for sermon:', sermon.id);
    try {
      onLike();
    } catch (error) {
      console.error('Error in like function:', error);
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
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
            {lastPlayedPosition > 0 && (
              <Badge variant="outline" className="border-bible-gold/50 text-bible-gold">
                Resume at {formatTime(lastPlayedPosition)}
              </Badge>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={handleLikeClick}
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
            <p className="text-sm text-white/70">
              {playerReady ? 'Audio Only Mode' : 'Loading Player...'}
            </p>
            <p className="text-xs text-white/50 mt-2">
              {formatTime(currentTime)} {duration > 0 ? `/ ${formatTime(duration)}` : ''}
            </p>
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
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={duration > 0 ? duration : 100}
              step={1}
              onValueChange={handleSeekChange}
              onPointerDown={handleSeekStart}
              onPointerUp={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                const maxTime = duration > 0 ? duration : 100;
                const newTime = Math.max(0, Math.min(maxTime, percent * maxTime));
                handleSeekEnd([newTime]);
              }}
              className="w-full cursor-pointer"
              disabled={!playerReady || error !== ''}
            />
            <div className="flex justify-between text-xs text-white/60">
              <span>{formatTime(currentTime)}</span>
              <span>{duration > 0 ? formatTime(duration) : '--:--'}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => skipTime(-10)}
              className="text-white hover:bg-white/20"
              disabled={!playerReady || error !== ''}
            >
              <SkipBack className="h-4 w-4" />
              <span className="text-xs ml-1">10s</span>
            </Button>

            <Button
              onClick={togglePlayPause}
              className="bg-bible-gold hover:bg-bible-gold/80 text-bible-navy font-semibold px-8 py-3"
              disabled={!playerReady || error !== ''}
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
              onClick={() => skipTime(10)}
              className="text-white hover:bg-white/20"
              disabled={!playerReady || error !== ''}
            >
              <span className="text-xs mr-1">10s</span>
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
              disabled={!playerReady}
            />
            <span className="text-xs text-white/60 w-8">{volume}%</span>
          </div>
        </div>

        {/* Hidden YouTube player container */}
        <div id="youtube-player" style={{ display: 'none' }}></div>
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
