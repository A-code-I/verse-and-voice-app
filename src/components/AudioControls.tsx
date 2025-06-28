
import React from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { formatTime } from '@/utils/youtubeAPI';

interface AudioControlsProps {
  isPlaying: boolean;
  loading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playerReady: boolean;
  error: string;
  onTogglePlayPause: () => void;
  onSkipTime: (seconds: number) => void;
  onSeek: (value: number[]) => void;
  onVolumeChange: (value: number[]) => void;
}

const AudioControls = ({
  isPlaying,
  loading,
  currentTime,
  duration,
  volume,
  playerReady,
  error,
  onTogglePlayPause,
  onSkipTime,
  onSeek,
  onVolumeChange,
}: AudioControlsProps) => {
  return (
    <div className="space-y-4">
      {/* Time Slider */}
      {duration > 0 && (
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={onSeek}
            className="w-full"
            disabled={!playerReady || error !== ''}
          />
          <div className="flex justify-between text-xs text-white/60">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSkipTime(-5)}
          className="text-white hover:bg-white/20"
          disabled={!playerReady || error !== ''}
        >
          <SkipBack className="h-4 w-4" />
          <span className="text-xs ml-1">5s</span>
        </Button>

        <Button
          onClick={onTogglePlayPause}
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
          onClick={() => onSkipTime(5)}
          className="text-white hover:bg-white/20"
          disabled={!playerReady || error !== ''}
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
          onValueChange={onVolumeChange}
          className="flex-1"
          disabled={!playerReady}
        />
        <span className="text-xs text-white/60 w-8">{volume}%</span>
      </div>
    </div>
  );
};

export default AudioControls;
