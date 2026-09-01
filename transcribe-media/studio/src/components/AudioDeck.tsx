import React from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2 } from 'lucide-react';
import { useAudio, formatTimecode } from '../context/AudioContext';

export const AudioDeck: React.FC = () => {
  const {
    isPlaying,
    currentTime,
    duration,
    currentTrack,
    playbackRate,
    togglePlay,
    seekTo,
    seekBy,
    setRate,
  } = useAudio();

  if (!currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-panel/95 backdrop-blur-xl border-t border-borderSubtle px-8 flex items-center justify-between z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">
      {/* Track Info */}
      <div className="flex flex-col max-w-xs truncate">
        <span className="text-xs font-bold text-gray-100 truncate">{currentTrack.title}</span>
        <span className="text-[11px] font-mono text-gray-400">
          {formatTimecode(currentTime)} / {formatTimecode(duration)}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 flex-1 max-w-xl mx-8">
        <button
          onClick={() => seekBy(-5)}
          className="p-1.5 rounded-lg bg-card hover:bg-cardHover text-gray-300 hover:text-white transition"
          title="Rewind 5s"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={togglePlay}
          className="p-2.5 rounded-full bg-accent hover:bg-accent-light text-black font-bold transition transform hover:scale-105 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-0.5" />}
        </button>

        <button
          onClick={() => seekBy(5)}
          className="p-1.5 rounded-lg bg-card hover:bg-cardHover text-gray-300 hover:text-white transition"
          title="Forward 5s"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* Progress Bar */}
        <input
          type="range"
          min={0}
          max={100}
          value={progress || 0}
          onChange={(e) => {
            if (duration > 0) {
              seekTo((Number(e.target.value) / 100) * duration);
            }
          }}
          className="flex-1 accent-accent cursor-pointer h-1.5 bg-borderMedium rounded-lg"
        />

        {/* Playback Speed */}
        <select
          value={playbackRate}
          onChange={(e) => setRate(Number(e.target.value))}
          className="bg-card border border-borderSubtle text-xs text-gray-300 rounded px-2 py-1 outline-none cursor-pointer"
        >
          <option value={1}>1.0x</option>
          <option value={1.25}>1.25x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2.0x</option>
        </select>
      </div>

      <div className="flex items-center gap-2 text-gray-400 text-xs">
        <Volume2 className="w-4 h-4 text-accent" />
        <span className="text-[10px] font-mono uppercase tracking-wider">Direct Stream</span>
      </div>
    </div>
  );
};
