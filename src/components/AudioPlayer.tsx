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
  const [isDragging, setIsDragging] = useState(false);
  const [lastPlayedPosition, setLastPlayedPosition] = useState(0);
  const [apiReady, setApiReady] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const playerRef = useRef<any>(null);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const seekTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Handle visibility changes and page lifecycle
  useEffect(() => {
    const handleVisibilityChange = () => {
      console.log('Visibility changed:', document.hidden);
      // Don't pause on visibility change - let user control playback
    };

    const handlePageHide = () => {
      console.log('Page hidden - maintaining audio playback');
      // Don't pause on page hide - audio should continue
    };

    const handlePageShow = () => {
      console.log('Page shown - checking player state');
      // Resume time updates when page becomes visible again
      if (playerRef.current && playerReady && !timeUpdateIntervalRef.current) {
        startTimeUpdates();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [playerReady]);

  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        console.log('YouTube API already loaded');
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
        console.log('YouTube IFrame API Ready');
        setApiReady(true);
      };

      const checkApiReady = () => {
        if (window.YT && window.YT.Player) {
          console.log('YouTube API detected as ready');
          setApiReady(true);
        } else {
          setTimeout(checkApiReady, 100);
        }
      };
      setTimeout(checkApiReady, 1000);
    };

    loadYouTubeAPI();
  }, []);

  useEffect(() => {
    if (videoId) {
      const savedPosition = localStorage.getItem(`sermon-position-${videoId}`);
      if (savedPosition) {
        const position = parseFloat(savedPosition);
        setLastPlayedPosition(position);
        setCurrentTime(position);
        setSeekValue(position);
        console.log(`Loaded saved position: ${position}s for video ${videoId}`);
      }
    }
  }, [videoId]);

  useEffect(() => {
    if (videoId && currentTime > 0 && !isDragging && isPlaying) {
      const savePosition = () => {
        localStorage.setItem(`sermon-position-${videoId}`, currentTime.toString());
      };
      
      const timeoutId = setTimeout(savePosition, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [videoId, currentTime, isDragging, isPlaying]);

  const startTimeUpdates = () => {
    const updateTime = () => {
      if (!isDragging && playerRef.current) {
        try {
          const currentVideoTime = playerRef.current.getCurrentTime();
          const videoDur = playerRef.current.getDuration();
          
          if (currentVideoTime !== undefined && currentVideoTime >= 0) {
            const time = Math.floor(currentVideoTime * 10) / 10;
            setCurrentTime(time);
            setSeekValue(time);
          }
          
          if (videoDur > 0 && Math.abs(videoDur - duration) > 1) {
            setDuration(videoDur);
          }
        } catch (error) {
          console.warn('Error updating time:', error);
        }
      }
      
      if (playerRef.current && playerReady) {
        timeUpdateIntervalRef.current = setTimeout(updateTime, 500);
      }
    };
    
    updateTime();
  };

  useEffect(() => {
    if (!videoId || !apiReady) {
      console.log('Waiting for video ID and API ready:', { videoId, apiReady });
      return;
    }

    console.log('Initializing YouTube player for video:', videoId);

    const initializePlayer = () => {
      if (playerRef.current) {
        if (timeUpdateIntervalRef.current) {
          clearInterval(timeUpdateIntervalRef.current);
        }
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.warn('Error destroying previous player:', e);
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
              console.log('YouTube player ready for video:', videoId);
              setPlayerReady(true);
              setLoading(false);
              setError('');
              
              event.target.setVolume(volume);
              
              const videoDuration = event.target.getDuration();
              if (videoDuration > 0) {
                setDuration(videoDuration);
                console.log('Video duration:', videoDuration);
              }
              
              if (lastPlayedPosition > 0) {
                console.log(`Seeking to saved position: ${lastPlayedPosition}s`);
                event.target.seekTo(lastPlayedPosition, true);
              }
              
              startTimeUpdates();
            },
            onStateChange: (event: any) => {
              const state = event.data;
              console.log('Player state changed:', state);
              
              setIsPlaying(state === 1);
              setLoading(state === 3);
              
              if (state === 0) {
                setCurrentTime(0);
                setSeekValue(0);
                if (videoId) {
                  localStorage.removeItem(`sermon-position-${videoId}`);
                }
              }
            },
            onError: (event: any) => {
              console.error('YouTube player error:', event.data);
              setError('Failed to load video');
              setPlayerReady(false);
              setLoading(false);
            }
          }
        });
      } catch (error) {
        console.error('Error creating YouTube player:', error);
        setError('Failed to initialize player');
        setLoading(false);
      }
    };

    initializePlayer();

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearTimeout(timeUpdateIntervalRef.current);
      }
      if (seekTimeoutRef.current) {
        clearTimeout(seekTimeoutRef.current);
      }
      if (playerRef.current?.destroy) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.warn('Error destroying player on cleanup:', e);
        }
      }
    };
  }, [videoId, apiReady, lastPlayedPosition, volume]);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setSeekValue(0);
    setDuration(0);
    setError('');
    setLoading(false);
    setPlayerReady(false);
    setIsDragging(false);
    setLastPlayedPosition(0);
  }, [sermon.id]);

  const togglePlayPause = () => {
    if (!videoId || !playerRef.current || !playerReady) {
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
    setSeekValue(newTime);
    playerRef.current.seekTo(newTime, true);
  };

  const seekToTime = (timeInSeconds: number) => {
    if (!videoId || !playerRef.current || !playerReady) return;
    
    const clampedTime = Math.max(0, Math.min(duration, timeInSeconds));
    console.log(`Seeking to specific time: ${clampedTime}s`);
    setCurrentTime(clampedTime);
    setSeekValue(clampedTime);
    playerRef.current.seekTo(clampedTime, true);
    
    if (!isPlaying) {
      playerRef.current.playVideo();
    }
  };

  const restartFromBeginning = () => {
    if (!videoId || !playerRef.current || !playerReady) return;
    
    console.log('Restarting from beginning');
    setCurrentTime(0);
    setSeekValue(0);
    playerRef.current.seekTo(0, true);
    
    if (videoId) {
      localStorage.removeItem(`sermon-position-${videoId}`);
      setLastPlayedPosition(0);
    }
  };

  const handleSeekChange = (value: number[]) => {
    const newTime = value[0];
    setSeekValue(newTime);
    setIsDragging(true);
  };

  const handleSeekCommit = (value: number[]) => {
    const newTime = value[0];
    console.log('Seek commit:', newTime);
    
    if (playerRef.current && playerReady) {
      console.log(`Seeking to: ${newTime}s`);
      playerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    }
    setIsDragging(false);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (playerRef.current && playerReady) {
      playerRef.current.setVolume(newVolume);
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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
            {!apiReady && (
              <Badge variant="outline" className="border-yellow-400/50 text-yellow-300">
                Loading API...
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
            <p className="text-xs text-white/50 mt-2">
              {formatTime(isDragging ? seekValue : currentTime)} {duration > 0 ? `/ ${formatTime(duration)}` : ''}
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
              value={[isDragging ? seekValue : currentTime]}
              max={duration > 0 ? duration : 100}
              step={1}
              onValueChange={handleSeekChange}
              onValueCommit={handleSeekCommit}
              className="w-full cursor-pointer"
              disabled={!playerReady || error !== ''}
            />
            <div className="flex justify-between text-xs text-white/60">
              <span>{formatTime(isDragging ? seekValue : currentTime)}</span>
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
