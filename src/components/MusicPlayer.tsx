import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Terminal } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: "STREAM_0x01",
    artist: "UNKNOWN_ENTITY",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 2,
    title: "STREAM_0x02",
    artist: "CORRUPTED_SECTOR",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 3,
    title: "STREAM_0x03",
    artist: "GHOST_IN_MACHINE",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  }
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(err => {
        console.error("Audio playback failed:", err);
        setIsPlaying(false);
      });
    } else if (!isPlaying && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleEnded = () => {
    nextTrack();
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const bounds = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const percentage = x / bounds.width;
      audioRef.current.currentTime = percentage * audioRef.current.duration;
      setProgress(percentage * 100);
    }
  };

  return (
    <div className="w-full max-w-3xl bg-black border-4 border-[#0ff] p-4 flex flex-col gap-4 relative overflow-hidden font-arcade text-[#0ff] shadow-[8px_8px_0px_rgba(255,0,255,0.8)] z-20">
      {/* Decorative background visualizer bars */}
      <div className="absolute inset-0 opacity-40 flex items-end justify-around px-2 pb-1 pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div 
            key={i} 
            className={`w-2 bg-[#0ff] visualizer-bar ${isPlaying ? 'playing' : ''}`}
            style={{ 
              height: `${10 + (i % 7) * 10}%`,
              animationDelay: `${i * 0.03}s`,
            }}
          />
        ))}
      </div>

      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      <div className="flex items-center justify-between relative z-10 border-b-2 border-[#f0f] pb-3">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-black border-2 border-[#0ff] flex items-center justify-center tear-effect">
            <Terminal className="text-[#f0f] w-8 h-8" />
          </div>
          <div>
            <h3 className="text-[#0ff] font-bold text-3xl leading-tight glitch" data-text={currentTrack.title}>{currentTrack.title}</h3>
            <p className="text-[#f0f] text-xl">SRC: {currentTrack.artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={prevTrack} className="text-[#0ff] hover:text-[#f0f] hover:bg-[#0ff] p-2 transition-none cursor-pointer border border-transparent hover:border-[#f0f]">
            <SkipBack className="w-8 h-8" />
          </button>
          
          <button 
            onClick={togglePlay} 
            className="w-14 h-14 bg-black border-4 border-[#0ff] flex items-center justify-center text-[#f0f] hover:bg-[#0ff] hover:text-black transition-none cursor-pointer"
          >
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>
          
          <button onClick={nextTrack} className="text-[#0ff] hover:text-[#f0f] hover:bg-[#0ff] p-2 transition-none cursor-pointer border border-transparent hover:border-[#f0f]">
            <SkipForward className="w-8 h-8" />
          </button>
        </div>

        <div className="flex items-center gap-2 hidden sm:flex">
          <button onClick={() => setIsMuted(!isMuted)} className="text-[#f0f] hover:text-[#0ff] hover:bg-[#f0f] p-2 transition-none cursor-pointer">
            {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              setIsMuted(false);
            }}
            className="w-24 accent-[#0ff] cursor-pointer"
          />
        </div>
      </div>

      {/* Progress Bar */}
      <div 
        className="w-full h-6 bg-black border-2 border-[#f0f] cursor-pointer relative z-10 overflow-hidden flex"
        onClick={handleProgressClick}
      >
        <div 
          className="h-full bg-[#0ff] transition-none"
          style={{ width: `${progress}%` }}
        />
        {/* Glitchy progress artifact */}
        <div className="absolute top-0 bottom-0 w-2 bg-[#f0f] tear-effect" style={{ left: `${progress}%` }} />
      </div>
    </div>
  );
}
