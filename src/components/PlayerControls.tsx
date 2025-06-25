
import React from 'react';
import { Button } from "@/components/ui/button";
import { SkipBack, SkipForward } from "lucide-react";

interface PlayerControlsProps {
  isPlaying: boolean;
  onTogglePlayPause: () => void;
  onSkip: (seconds: number) => void;
  disabled: boolean;
}

const PlayerControls = ({ isPlaying, onTogglePlayPause, onSkip, disabled }: PlayerControlsProps) => {
  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onSkip(-5)}
        className="text-white hover:bg-white/20"
        title="Rewind 5 seconds"
        disabled={disabled}
      >
        <SkipBack className="h-5 w-5" />
        <span className="text-xs ml-1">5s</span>
      </Button>

      <Button
        onClick={onTogglePlayPause}
        className="bg-bible-gold hover:bg-bible-gold/80 text-bible-navy font-semibold px-8"
        disabled={disabled}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onSkip(5)}
        className="text-white hover:bg-white/20"
        title="Forward 5 seconds"
        disabled={disabled}
      >
        <span className="text-xs mr-1">5s</span>
        <SkipForward className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default PlayerControls;
