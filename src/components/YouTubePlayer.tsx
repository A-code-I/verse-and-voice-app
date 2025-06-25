
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

    return (
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
);

YouTubePlayer.displayName = 'YouTubePlayer';

export default YouTubePlayer;
