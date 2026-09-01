import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

export function parseTimecode(value: string | undefined | null): number | null {
  const text = String(value || '');
  const clock = text.match(/(?:^|[^\d])(\d{1,2}):([0-5]\d(?:\.\d+)?)(?::([0-5]\d(?:\.\d+)?))?/);
  if (clock) {
    return clock[3]
      ? Number(clock[1]) * 3600 + Number(clock[2]) * 60 + Number(clock[3])
      : Number(clock[1]) * 60 + Number(clock[2]);
  }
  const duration = text.match(/(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+(?:\.\d+)?)s)/i);
  return duration ? Number(duration[1] || 0) * 3600 + Number(duration[2] || 0) * 60 + Number(duration[3]) : null;
}

export function formatTimecode(sec: number): string {
  if (typeof sec !== 'number' || isNaN(sec)) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function encodeAudioUrl(path: string | undefined | null): string {
  if (!path) return '';
  const clean = path.replace(/^\.?\/?(?:\.conversations\/)?/, '');
  const parts = clean.split('/');
  return `/.conversations/${parts.map(encodeURIComponent).join('/')}`;
}

interface AudioTrack {
  audioPath: string;
  title: string;
}

interface AudioContextValue {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  currentTrack: AudioTrack | null;
  playbackRate: number;
  playAt: (seconds: number, audioPath?: string, title?: string) => void;
  togglePlay: () => void;
  seekTo: (seconds: number) => void;
  seekBy: (delta: number) => void;
  setRate: (rate: number) => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const playAt = (seconds: number, audioPath?: string, title?: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audioPath && (!currentTrack || currentTrack.audioPath !== audioPath)) {
      const url = encodeAudioUrl(audioPath);
      audio.src = url;
      setCurrentTrack({ audioPath, title: title || audioPath.split('/').at(-1) || 'Audio Track' });
    }

    audio.currentTime = Math.max(0, seconds);
    audio.play().catch(() => {});
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  };

  const seekTo = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration || 0, seconds));
  };

  const seekBy = (delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration || 0, audio.currentTime + delta));
  };

  const setRate = (rate: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = rate;
    setPlaybackRate(rate);
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        currentTime,
        duration,
        currentTrack,
        playbackRate,
        playAt,
        togglePlay,
        seekTo,
        seekBy,
        setRate,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used within an AudioProvider');
  return ctx;
}
