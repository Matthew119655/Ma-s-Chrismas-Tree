import React, { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { Music, Hand, Camera, Pause, Play } from 'lucide-react';

// 这里使用占位符路径，实际部署需替换 assets/bgm.mp3 为真实文件
// 为了演示效果，保留一个有效的外部链接作为 Fallback
const LOCAL_BGM_PATH = '/assets/bgm.mp3';
const DEMO_BGM_URL = 'https://cdn.pixabay.com/audio/2022/12/16/audio_3338575005.mp3';

export const UI: React.FC = () => {
  const { phase, gesture, toggleCamera, cameraActive, isMusicPlaying, toggleMusic } = useStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 监听 Store 变化控制播放
  useEffect(() => {
    if (!audioRef.current) {
        audioRef.current = new Audio(DEMO_BGM_URL); // 使用 Demo URL 确保预览有声音
        audioRef.current.loop = true;
    }

    if (isMusicPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed", e));
    } else {
        audioRef.current.pause();
    }
  }, [isMusicPlaying]);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-40">
      
      {/* Header / Instructions */}
      <div className="flex flex-col items-start gap-4 pointer-events-auto">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-white max-w-xs shadow-lg transition-all duration-300 hover:bg-white/15">
            <h3 className="font-bold text-yellow-400 mb-1 flex items-center gap-2">
                <Hand size={16} /> 
                Status: {gesture.replace('_', ' ')}
            </h3>
            <p className="text-xs text-white/80">
                Current Phase: <span className="font-mono text-blue-300 uppercase">{phase}</span>
            </p>
            <div className="mt-2 text-[10px] text-white/60 space-y-1">
                <p>✋ Open Palm: Explode Tree / Spin Nebula</p>
                <p>✊ Closed Fist: Reset to Tree</p>
            </div>
        </div>

        <button 
            onClick={toggleCamera}
            className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border border-white/20 transition-all shadow-lg hover:scale-105 active:scale-95 ${cameraActive ? 'bg-red-500/80 text-white shadow-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
        >
            <Camera size={16} />
            {cameraActive ? 'Stop AI' : 'Start AI Control'}
        </button>
      </div>

      {/* Center Title */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none select-none">
        <h1 className="text-6xl md:text-8xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] animate-pulse" style={{ fontFamily: '"Great Vibes", cursive' }}>
            Merry Christmas
        </h1>
        <p className="text-white/80 text-lg mt-2 font-light tracking-[0.5em] uppercase drop-shadow-md">Interactive WebGL Experience</p>
      </div>

      {/* Footer / Music Player */}
      <div className="self-center pointer-events-auto mb-4">
        <div 
            className={`bg-black/30 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center gap-4 text-white transition-all duration-500 cursor-pointer group hover:bg-black/50 ${isMusicPlaying ? 'shadow-[0_0_20px_rgba(255,255,255,0.2)] border-white/30' : ''}`} 
            onClick={toggleMusic}
        >
            <div className={`relative w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden border border-white/20 ${isMusicPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }}>
                <Music size={16} className="relative z-10" />
            </div>
            
            <div className="flex flex-col w-40 overflow-hidden">
                <div className={`flex flex-col ${isMusicPlaying ? 'opacity-100' : 'opacity-80'}`}>
                    {/* Scrolling text effect container */}
                    <div className="w-full overflow-hidden whitespace-nowrap relative">
                        <span className="text-xs font-bold text-yellow-200 inline-block animate-marquee">
                            Merry Christmas Mr. Lawrence &nbsp;&nbsp;•&nbsp;&nbsp; Ryuichi Sakamoto &nbsp;&nbsp;•&nbsp;&nbsp;
                        </span>
                    </div>
                    <span className="text-[10px] text-white/50">{isMusicPlaying ? 'Playing' : 'Click to Play'}</span>
                </div>
            </div>
            
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 transition-colors">
                {isMusicPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" className="ml-0.5" />}
            </div>
        </div>
      </div>
      
      <style>{`
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-marquee {
            animation: marquee 8s linear infinite;
            min-width: 200%;
        }
      `}</style>
    </div>
  );
};
