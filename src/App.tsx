import React from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center font-sans text-[#0ff] overflow-hidden relative selection:bg-[#f0f] selection:text-black">
      {/* Static Noise & Scanlines */}
      <div className="absolute inset-0 bg-static z-50 pointer-events-none"></div>
      <div className="absolute inset-0 scanlines z-40 pointer-events-none"></div>

      <header className="absolute top-0 left-0 w-full p-4 text-center z-10 tear-effect" style={{animationDelay: '0.2s'}}>
        <h1 
          className="text-5xl md:text-7xl font-arcade font-black tracking-tighter text-[#0ff] uppercase glitch"
          data-text="SYS.TERMINAL_//_OVERRIDE"
        >
          SYS.TERMINAL_//_OVERRIDE
        </h1>
        <p className="text-[#f0f] font-arcade text-2xl mt-1 tracking-widest bg-black inline-block px-2 border border-[#f0f]">UNAUTHORIZED_ACCESS_DETECTED</p>
      </header>

      <main className="flex-1 flex items-center justify-center w-full z-10 mt-24 mb-32 tear-effect" style={{animationDelay: '1.5s'}}>
        <SnakeGame />
      </main>

      <div className="absolute bottom-0 left-0 w-full p-4 z-20 flex justify-center tear-effect" style={{animationDelay: '0.7s'}}>
        <MusicPlayer />
      </div>
    </div>
  );
}
