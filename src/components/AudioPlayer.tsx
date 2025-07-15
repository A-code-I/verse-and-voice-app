
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Heart, Play, Pause, SkipBack, SkipForward, Volume2, RotateCcw } from "lucide-react";
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
  const [apiReady, setApiReady] = useState(false);
  
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const currentSermonIdRef = useRef<string>(sermon.id);

  const getYouTubeVideoId = (url: string): string | null => {
    if (!url || typeof url !== 'string') return null;
    
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
    
    if (url.length === 11 && /^[a-zA-Z0-9_-]+$/.test(url)) {
      return url;
    }
    
    return null;
  };

  const videoId = sermon.youtube_url ? getYouTubeVideoId(sermon.youtube_url) : null;

  // Simple time update function
  const updateTime = () => {
    if (playerRef.current && playerReady && mountedRef.current) {
      try {
        const time = playerRef.current.getCurrentTime();
        const dur = playerRef.current.getDuration();
        
        if (typeof time === 'number' && !isNaN(time)) {
          setCurrentTime(Math.floor(time));
          
          // Save position
          if (videoId && time > 0) {
            localStorage.setItem(`sermon-position-${videoId}`, time.toString());
          }
        }
        
        if (typeof dur === 'number' && !isNaN(dur) && dur > 0) {
          setDuration(Math.floor(dur));
        }
      } catch (e) {
        console.warn('Time update error:', e);
      }
    }
  };

  // Start time tracking
  const startTimeTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(updateTime, 1000);
    updateTime(); // Immediate update
  };

  // Stop time tracking
  const stopTimeTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Load YouTube API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }

    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
    
    window.onYouTubeIframeAPIReady = () => {
      if (mountedRef.current) {
        setApiReady(true);
      }
    };

    const checkApi = () => {
      if (window.YT && window.YT.Player) {
        if (mountedRef.current) {
          setApiReady(true);
        }
      } else {
        setTimeout(checkApi, 100);
      }
    };
    setTimeout(checkApi, 1000);
  }, []);

  // Initialize player
  useEffect(() => {
    if (!videoId || !apiReady || !mountedRef.current) return;

    // Reset for new sermon
    if (currentSermonIdRef.current !== sermon.id) {
      currentSermonIdRef.current = sermon.id;
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
    }

    stopTimeTracking();
    
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {
        console.warn('Error destroying player:', e);
      }
    }

    setPlayerReady(false);
    setError('');
    setLoading(true);

    try {
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
          origin: window.location.origin,
          playsinline: 1,
          iv_load_policy: 3
        },
        events: {
          onReady: (event: any) => {
            if (!mountedRef.current) return;
            
            console.log('Player ready');
            setPlayerReady(true);
            setLoading(false);
            setError('');
            
            // Set volume
            try {
              event.target.setVolume(volume);
            } catch (e) {
              console.warn('Volume error:', e);
            }
            
            // Get duration
            const dur = event.target.getDuration();
            if (dur > 0) {
              setDuration(Math.floor(dur));
            }
            
            // Load saved position
            const savedPos = localStorage.getItem(`sermon-position-${videoId}`);
            if (savedPos) {
              const pos = parseFloat(savedPos);
              if (pos > 0 && pos < dur) {
                setTimeout(() => {
                  if (mountedRef.current && playerRef.current) {
                    try {
                      event.target.seekTo(pos, true);
                      setCurrentTime(Math.floor(pos));
                    } catch (e) {
                      console.warn('Seek error:', e);
                    }
                  }
                }, 500);
              }
            }
          },
          onStateChange: (event: any) => {
            if (!mountedRef.current) return;
            
            const state = event.data;
            console.log('State change:', state);
            
            if (state === 1) { // Playing
              setIsPlaying(true);
              setLoading(false);
              startTimeTracking();
            } else if (state === 2) { // Paused
              setIsPlaying(false);
              setLoading(false);
              stopTimeTracking();
              updateTime(); // Final update
            } else if (state === 3) { // Buffering
              setLoading(true);
            } else if (state === 0) { // Ended
              setIsPlaying(false);
              setLoading(false);
              setCurrentTime(0);
              stopTimeTracking();
              if (videoId) {
                localStorage.removeItem(`sermon-position-${videoId}`);
              }
            }
          },
          onError: (event: any) => {
            console.error('Player error:', event.data);
            setError('Failed to load video');
            setPlayerReady(false);
            setLoading(false);
            setIsPlaying(false);
            stopTimeTracking();
          }
        }
      });
    } catch (error) {
      console.error('Player creation error:', error);
      setError('Failed to initialize player');
      setLoading(false);
    }

    return () => {
      stopTimeTracking();
      if (playerRef.current?.destroy) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.warn('Cleanup error:', e);
        }
      }
    };
  }, [videoId, apiReady, sermon.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      stopTimeTracking();
    };
  }, []);

  const togglePlayPause = () => {
    if (!playerRef.current || !playerReady) {
      setError('Player not ready');
      return;
    }

    setError('');
    
    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } catch (error) {
      console.error('Play/pause error:', error);
      setError('Failed to control playback');
    }
  };

  const skipTime = (seconds: number) => {
    if (!playerRef.current || !playerReady) return;
    
    try {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      playerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    } catch (error) {
      console.error('Skip error:', error);
    }
  };

  const seekToTime = (timeInSeconds: number) => {
    if (!playerRef.current || !playerReady) return;
    
    try {
      const clampedTime = Math.max(0, Math.min(duration, timeInSeconds));
      playerRef.current.seekTo(clampedTime, true);
      setCurrentTime(clampedTime);
      
      if (!isPlaying) {
        playerRef.current.playVideo();
      }
    } catch (error) {
      console.error('Seek error:', error);
    }
  };

  const restartFromBeginning = () => {
    if (!playerRef.current || !playerReady) return;
    
    try {
      playerRef.current.seekTo(0, true);
      setCurrentTime(0);
      
      if (videoId) {
        localStorage.removeItem(`sermon-position-${videoId}`);
      }
    } catch (error) {
      console.error('Restart error:', error);
    }
  };

  const handleSeekChange = (value: number[]) => {
    if (!playerReady || !playerRef.current) return;
    
    try {
      const newTime = value[0];
      playerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    } catch (error) {
      console.error('Manual seek error:', error);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    if (playerRef.current && playerReady) {
      try {
        playerRef.current.setVolume(newVolume);
      } catch (error) {
        console.error('Volume error:', error);
      }
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike();
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
          onClick={handleLikeClick}
          className="text-white hover:bg-white/20"
        >
          <Heart 
            className={`h-6 w-6 ${sermon.liked ? 'fill-red-500 text-red-500' : ''}`} 
          />
          <span className="ml-2">{sermon.likes || 0}</span>
        </Button>
      </div>
      
      <div className="space-y-4">
        <div className="relative bg-gradient-to-r from-bible-gold/20 to-bible-purple/20 rounded-lg overflow-hidden p-6">
          <div className="text-center text-white">
            <div className="text-4xl mb-3">
              {loading ? '⏳' : isPlaying ? '🎵' : '⏸️'}
            </div>
            <p className="text-lg font-medium mb-1">{sermon.title}</p>
            <p className="text-sm text-white/70">
              {!apiReady ? 'Loading API...' : playerReady ? 'Audio Only Mode' : 'Loading Player...'}
            </p>
            <p className="text-lg font-mono text-bible-gold mt-2">
              {formatTime(currentTime)} {duration > 0 ? `/ ${formatTime(duration)}` : ''}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={duration > 0 ? duration : 100}
              step={1}
              onValueChange={handleSeekChange}
              className="w-full cursor-pointer"
              disabled={!playerReady || error !== ''}
            />
            <div className="flex justify-between text-xs text-white/60">
              <span>{formatTime(currentTime)}</span>
              <span>{duration > 0 ? formatTime(duration) : '--:--'}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={restartFromBeginning}
              className="text-white hover:bg-white/20"
              disabled={!playerReady || error !== ''}
              title="Restart from beginning"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

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

        <div id="youtube-player" style={{ display: 'none' }}></div>
      </div>

      <div className="mt-6">
        <SermonDetails
          description={sermon.description}
          bibleReferences={sermon.bible_references}
          onSeekToTime={seekToTime}
        />
      </div>
    </div>
  );
};

export default AudioPlayer;
