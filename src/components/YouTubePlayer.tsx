
import React, { useRef, forwardRef, useImperativeHandle } from 'react';

interface YouTubePlayerProps {
  videoId: string | null;
  title: string;
  embedUrl: string;
}

export interface YouTubePlayerRef {
  skipTime: (seconds: number) => void;
  togglePlayPause: (isPlaying: boolean) => void;
}

const YouTubePlayer = forwardRef<YouTubePlayerRef, YouTubePlayerProps>(
  ({ videoId, title, embedUrl }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useImperativeHandle(ref, () => ({
      skipTime: (seconds: number) => {
        if (!iframeRef.current || !videoId) return;
        
        iframeRef.current.contentWindow?.postMessage(
          `{"event":"command","func":"seekTo","args":[${seconds},true]}`,
          '*'
        );
      },
      togglePlayPause: (isPlaying: boolean) => {
        if (!iframeRef.current || !videoId) return;

        if (isPlaying) {
          iframeRef.current.contentWindow?.postMessage(
            '{"event":"command","func":"pauseVideo","args":""}',
            '*'
          );
        } else {
          iframeRef.current.contentWindow?.postMessage(
            '{"event":"command","func":"playVideo","args":""}',
            '*'
          );
        }
      }
    }));

    if (!videoId) {
      return (
        <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
          <p className="text-white/60">Invalid YouTube URL</p>
        </div>
      );
    }

    // Audio-only player with controls disabled to prevent copying links
    const audioOnlyEmbedUrl = `${embedUrl}&controls=1&disablekb=1&fs=0&modestbranding=1&rel=0&showinfo=0`;

    return (
      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
        {/* Audio-only interface - no video visible */}
        <div className="h-32 bg-gradient-to-r from-bible-purple to-bible-navy flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-2xl mb-2">🎵</div>
            <p className="text-sm font-medium">Audio Playing: {title}</p>
            <p className="text-xs text-white/60 mt-1">Audio Only Mode</p>
          </div>
        </div>
        
        {/* Hidden iframe for audio playback */}
        <div className="absolute top-0 left-0 w-full h-0 overflow-hidden opacity-0 pointer-events-none">
          <iframe
            ref={iframeRef}
            src={audioOnlyEmbedUrl}
            title={title}
            className="w-full h-96"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            style={{ pointerEvents: 'none' }}
          />
        </div>
      </div>
    );
  }
);

YouTubePlayer.displayName = 'YouTubePlayer';

export default YouTubePlayer;
