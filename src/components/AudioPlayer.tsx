
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
  
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSeekingRef = useRef(false);

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

  // Save position to localStorage
  const savePosition = (time: number) => {
    if (videoId && time > 0) {
      localStorage.setItem(`sermon-position-${videoId}`, time.toString());
      console.log('Saved position:', time);
    }
  };

  // Load saved position
  const loadSavedPosition = (): number => {
    if (videoId) {
      const saved = localStorage.getItem(`sermon-position-${videoId}`);
      if (saved) {
        const pos = parseFloat(saved);
        console.log('Loaded saved position:', pos);
        return pos;
      }
    }
    return 0;
  };

  // Time tracking function
  const updateCurrentTime = () => {
    if (playerRef.current && playerReady && !isSeekingRef.current) {
      try {
        const time = playerRef.current.getCurrentTime();
        const dur = playerRef.current.getDuration();
        
        if (typeof time === 'number' && !isNaN(time)) {
          console.log('Time update:', time);
          setCurrentTime(Math.floor(time));
          savePosition(time);
        }
        
        if (typeof dur === 'number' && !isNaN(dur) && dur > 0) {
          setDuration(Math.floor(dur));
        }
      } catch (e) {
        console.warn('Time update failed:', e);
      }
    }
  };

  // Start interval for time updates
  const startTimeUpdates = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(updateCurrentTime, 1000);
    console.log('Started time updates');
  };

  // Stop interval
  const stopTimeUpdates = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('Stopped time updates');
    }
  };

  // Initialize YouTube API
  useEffect(() => {
    let mounted = true;

    const initializeAPI = () => {
      if (window.YT && window.YT.Player) {
        if (mounted) setPlayerReady(true);
        return;
      }

      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }

      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API ready');
        if (mounted) setPlayerReady(true);
      };

      // Fallback check
      const checkAPI = () => {
        if (window.YT && window.YT.Player) {
          if (mounted) setPlayerReady(true);
        } else {
          setTimeout(checkAPI, 100);
        }
      };
      setTimeout(checkAPI, 1000);
    };

    initializeAPI();

    return () => {
      mounted = false;
    };
  }, []);

  // Initialize player when API is ready and videoId changes
  useEffect(() => {
    if (!playerReady || !videoId) return;

    console.log('Initializing player for video:', videoId);
    setError('');
    setLoading(true);
    stopTimeUpdates();

    // Destroy existing player
    if (playerRef.current?.destroy) {
      try {
        playerRef.current.destroy();
      } catch (e) {
        console.warn('Error destroying player:', e);
      }
    }

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
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            console.log('Player onReady');
            setLoading(false);
            
            // Set volume
            event.target.setVolume(volume);
            
            // Get duration
            const dur = event.target.getDuration();
            if (dur > 0) {
              setDuration(Math.floor(dur));
              console.log('Duration set:', dur);
            }
            
            // Load saved position
            const savedPos = loadSavedPosition();
            if (savedPos > 0 && savedPos < dur) {
              setTimeout(() => {
                try {
                  event.target.seekTo(savedPos, true);
                  setCurrentTime(Math.floor(savedPos));
                  console.log('Restored position:', savedPos);
                } catch (e) {
                  console.warn('Seek error:', e);
                }
              }, 500);
            }
          },
          
          onStateChange: (event: any) => {
            const state = event.data;
            console.log('Player state change:', state);
            
            if (state === 1) { // Playing
              setIsPlaying(true);
              setLoading(false);
              startTimeUpdates();
              updateCurrentTime(); // Immediate update
            } else if (state === 2) { // Paused
              setIsPlaying(false);
              setLoading(false);
              stopTimeUpdates();
              updateCurrentTime(); // Final update
            } else if (state === 3) { // Buffering
              setLoading(true);
            } else if (state === 0) { // Ended
              setIsPlaying(false);
              setLoading(false);
              stopTimeUpdates();
              setCurrentTime(0);
              if (videoId) {
                localStorage.removeItem(`sermon-position-${videoId}`);
              }
            }
          },
          
          onError: (event: any) => {
            console.error('Player error:', event.data);
            setError('Failed to load video');
            setLoading(false);
            setIsPlaying(false);
            stopTimeUpdates();
          }
        }
      });
    } catch (error) {
      console.error('Player creation error:', error);
      setError('Failed to initialize player');
      setLoading(false);
    }

    return () => {
      stopTimeUpdates();
    };
  }, [playerReady, videoId, sermon.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimeUpdates();
      if (playerRef.current?.destroy) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.warn('Cleanup error:', e);
        }
      }
    };
  }, []);

  const togglePlayPause = () => {
    if (!playerRef.current || loading) return;

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
    if (!playerRef.current || loading) return;
    
    isSeekingRef.current = true;
    try {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      playerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
      savePosition(newTime);
    } catch (error) {
      console.error('Skip error:', error);
    } finally {
      setTimeout(() => {
        isSeekingRef.current = false;
      }, 1000);
    }
  };

  const seekToTime = (timeInSeconds: number) => {
    if (!playerRef.current || loading) return;
    
    isSeekingRef.current = true;
    try {
      const clampedTime = Math.max(0, Math.min(duration, timeInSeconds));
      playerRef.current.seekTo(clampedTime, true);
      setCurrentTime(clampedTime);
      savePosition(clampedTime);
    } catch (error) {
      console.error('Seek error:', error);
    } finally {
      setTimeout(() => {
        isSeekingRef.current = false;
      }, 1000);
    }
  };

  const restartFromBeginning = () => {
    if (!playerRef.current || loading) return;
    
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
    const newTime = value[0];
    seekToTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    if (playerRef.current && !loading) {
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
              {!playerReady ? 'Loading Player...' : 'Audio Only Mode'}
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
              disabled={loading || !playerReady || error !== ''}
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
              disabled={loading || !playerReady || error !== ''}
              title="Restart from beginning"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => skipTime(-10)}
              className="text-white hover:bg-white/20"
              disabled={loading || !playerReady || error !== ''}
            >
              <SkipBack className="h-4 w-4" />
              <span className="text-xs ml-1">10s</span>
            </Button>

            <Button
              onClick={togglePlayPause}
              className="bg-bible-gold hover:bg-bible-gold/80 text-bible-navy font-semibold px-8 py-3"
              disabled={loading || !playerReady || error !== ''}
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
              disabled={loading || !playerReady || error !== ''}
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
              disabled={loading || !playerReady}
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
