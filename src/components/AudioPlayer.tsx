
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { Sermon } from '@/pages/Index';
import SermonDetails from './SermonDetails';
import AudioControls from './AudioControls';
import AudioVisualization from './AudioVisualization';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { getYouTubeVideoId } from '@/utils/youtubeAPI';

interface AudioPlayerProps {
  sermon: Sermon;
  onLike: () => void;
}

const AudioPlayer = ({ sermon, onLike }: AudioPlayerProps) => {
  const videoId = sermon.youtube_url ? getYouTubeVideoId(sermon.youtube_url) : null;
  
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    loading,
    error,
    playerReady,
    iframeRef,
    togglePlayPause,
    skipTime,
    handleSeek,
    handleVolumeChange,
  } = useYouTubePlayer(videoId, sermon.id);

  const handleLikeClick = () => {
    console.log('Like button clicked for sermon:', sermon.id);
    try {
      onLike();
    } catch (error) {
      console.error('Error in like function:', error);
    }
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
      
      <div className="space-y-4">
        <AudioVisualization
          title={sermon.title}
          isPlaying={isPlaying}
          loading={loading}
          playerReady={playerReady}
          currentTime={currentTime}
          duration={duration}
        />

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <AudioControls
          isPlaying={isPlaying}
          loading={loading}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          playerReady={playerReady}
          error={error}
          onTogglePlayPause={togglePlayPause}
          onSkipTime={skipTime}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
        />

        {/* Hidden YouTube iframe for audio playback */}
        <div className="absolute top-0 left-0 w-0 h-0 overflow-hidden opacity-0 pointer-events-none">
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=0&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0&showinfo=0&mute=0&loop=0&origin=${encodeURIComponent(window.location.origin)}`}
            title={`${sermon.title} - Audio`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            onLoad={() => {
              console.log('YouTube iframe loaded');
            }}
          />
        </div>
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
