
import { useState, useRef, useEffect } from 'react';

interface YouTubePlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  loading: boolean;
  error: string;
  playerReady: boolean;
}

export const useYouTubePlayer = (videoId: string | null, sermonId: string) => {
  const [state, setState] = useState<YouTubePlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 70,
    loading: false,
    error: '',
    playerReady: false,
  });
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Reset player when sermon changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      error: '',
      loading: false,
      playerReady: false,
    }));
  }, [sermonId]);

  // Listen for YouTube player events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return;
      
      try {
        const data = JSON.parse(event.data);
        console.log('YouTube player message:', data);
        
        if (data.event === 'video-progress') {
          setState(prev => ({
            ...prev,
            currentTime: data.info.currentTime || 0,
            duration: data.info.duration || 0,
          }));
        } else if (data.event === 'onStateChange') {
          console.log('Player state changed:', data.info);
          setState(prev => ({
            ...prev,
            isPlaying: data.info === 1,
            loading: data.info === 3,
          }));
        } else if (data.event === 'onReady') {
          console.log('YouTube player ready');
          setState(prev => ({
            ...prev,
            playerReady: true,
            error: '',
          }));
        }
      } catch (error) {
        console.log('Error parsing YouTube message:', error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const sendPlayerCommand = (command: string, args?: any[]) => {
    if (!videoId || !iframeRef.current || !state.playerReady) {
      console.log('Cannot send command - player not ready:', { 
        videoId: !!videoId, 
        iframe: !!iframeRef.current, 
        playerReady: state.playerReady 
      });
      setState(prev => ({ ...prev, error: 'Player not ready' }));
      return false;
    }

    try {
      const message = {
        event: 'command',
        func: command,
        args: args || []
      };
      console.log('Sending YouTube command:', message);
      iframeRef.current.contentWindow?.postMessage(JSON.stringify(message), '*');
      return true;
    } catch (error) {
      console.error('Error sending YouTube command:', error);
      setState(prev => ({ ...prev, error: 'Failed to control playback' }));
      return false;
    }
  };

  const togglePlayPause = () => {
    if (!videoId) {
      setState(prev => ({ ...prev, error: 'Invalid YouTube URL' }));
      return;
    }

    setState(prev => ({ ...prev, error: '' }));
    
    if (state.isPlaying) {
      sendPlayerCommand('pauseVideo');
    } else {
      sendPlayerCommand('playVideo');
    }
  };

  const skipTime = (seconds: number) => {
    if (!videoId || !state.playerReady) return;
    
    const newTime = Math.max(0, state.currentTime + seconds);
    sendPlayerCommand('seekTo', [newTime, true]);
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    if (!videoId || !state.playerReady) return;
    
    sendPlayerCommand('seekTo', [newTime, true]);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setState(prev => ({ ...prev, volume: newVolume }));
    sendPlayerCommand('setVolume', [newVolume]);
  };

  return {
    ...state,
    iframeRef,
    togglePlayPause,
    skipTime,
    handleSeek,
    handleVolumeChange,
  };
};
