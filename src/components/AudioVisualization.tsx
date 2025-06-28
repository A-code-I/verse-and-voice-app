
import React from 'react';
import { formatTime } from '@/utils/youtubeAPI';

interface AudioVisualizationProps {
  title: string;
  isPlaying: boolean;
  loading: boolean;
  playerReady: boolean;
  currentTime: number;
  duration: number;
}

const AudioVisualization = ({
  title,
  isPlaying,
  loading,
  playerReady,
  currentTime,
  duration,
}: AudioVisualizationProps) => {
  return (
    <div className="relative bg-gradient-to-r from-bible-gold/20 to-bible-purple/20 rounded-lg overflow-hidden p-6">
      <div className="text-center text-white">
        <div className="text-4xl mb-3">
          {loading ? '⏳' : isPlaying ? '🎵' : '⏸️'}
        </div>
        <p className="text-lg font-medium mb-1">{title}</p>
        <p className="text-sm text-white/70">
          {playerReady ? 'Audio Only Mode' : 'Loading Player...'}
        </p>
        {duration > 0 && (
          <p className="text-xs text-white/50 mt-2">
            {formatTime(currentTime)} / {formatTime(duration)}
          </p>
        )}
      </div>
    </div>
  );
};

export default AudioVisualization;
