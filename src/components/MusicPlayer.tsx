import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Music,
  ExternalLink,
  Disc3,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface MusicPlayerProps {
  videoId?: string;
  autoPlay?: boolean;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  videoId = 'E8gmARGvPlI',
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [userInteracted, setUserInteracted] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Send command to YouTube iframe via postMessage
  const postMessageToPlayer = (func: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      );
    }
  };

  const togglePlay = () => {
    setUserInteracted(true);
    if (isPlaying) {
      postMessageToPlayer('pauseVideo');
      setIsPlaying(false);
    } else {
      postMessageToPlayer('playVideo');
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    setUserInteracted(true);
    if (isMuted) {
      postMessageToPlayer('unMute');
      setIsMuted(false);
    } else {
      postMessageToPlayer('mute');
      setIsMuted(true);
    }
  };

  return (
    <div className="relative">
      {/* Hidden/Compact YouTube Iframe Player */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          isExpanded
            ? 'fixed bottom-4 right-4 z-50 w-80 bg-slate-900 border border-emerald-500/50 rounded-2xl shadow-2xl p-3'
            : 'absolute w-1 h-1 opacity-0 pointer-events-none -left-[9999px]'
        }`}
      >
        {isExpanded && (
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-200">
            <span className="text-xs font-bold flex items-center gap-1.5 text-emerald-400">
              <Disc3 className="w-3.5 h-3.5 text-rose-400 animate-spin" />
              <span>Nhạc Giáng Sinh 2026 🎄</span>
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className={isExpanded ? 'aspect-video w-full rounded-xl overflow-hidden' : 'w-1 h-1'}>
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&loop=1&playlist=${videoId}&controls=1`}
            title="Nhạc Giáng Sinh kiểm toán 2026"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="w-full h-full border-0"
          />
        </div>
      </div>

      {/* Main Navbar Control */}
      <div className="flex items-center gap-2 bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 px-3 py-1.5 rounded-xl border border-emerald-500/40 shadow-sm">
        {/* Animated Disc / Christmas Tree indicator */}
        <div className="flex items-center gap-1.5">
          <Disc3
            className={`w-4 h-4 text-emerald-400 ${
              isPlaying ? 'animate-spin [animation-duration:3s]' : 'opacity-60'
            }`}
          />
          <span className="text-xs font-bold text-emerald-100 hidden md:inline-block max-w-[125px] truncate">
            Last Christmas 🎄
          </span>
        </div>

        {/* Sound Waves Animation */}
        {isPlaying && (
          <div className="hidden sm:flex items-end gap-0.5 h-3.5 px-1">
            <span className="w-0.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0ms] h-3" />
            <span className="w-0.5 bg-rose-400 rounded-full animate-bounce [animation-delay:150ms] h-2" />
            <span className="w-0.5 bg-amber-300 rounded-full animate-bounce [animation-delay:300ms] h-3.5" />
            <span className="w-0.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:75ms] h-2.5" />
          </div>
        )}

        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-xs"
          title={isPlaying ? 'Tạm dừng nhạc Giáng Sinh' : 'Bật nhạc Giáng Sinh'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        {/* Mute Button */}
        <button
          type="button"
          onClick={toggleMute}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-teal-300" />
          )}
        </button>

        {/* Open or Expand YouTube View */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors hidden sm:inline-flex cursor-pointer"
          title="Xem video trên màn hình nhỏ"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        <a
          href={`https://www.youtube.com/watch?v=${videoId}&list=RD${videoId}&start_radio=1`}
          target="_blank"
          rel="noreferrer"
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Mở video trên YouTube"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
