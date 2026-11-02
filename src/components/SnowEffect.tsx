import React, { useMemo } from 'react';

interface Snowflake {
  id: number;
  x: number; // percentage 0 - 100
  size: number; // in pixels
  opacity: number;
  duration: number; // seconds
  delay: number; // seconds
  swayDuration: number;
  char: string;
}

export const SnowEffect: React.FC = () => {
  // Generate 26 balanced, lightweight snowflakes with varying parameters
  const snowflakes = useMemo<Snowflake[]>(() => {
    const chars = ['❄', '❅', '❆', '•'];
    return Array.from({ length: 26 }, (_, i) => ({
      id: i,
      x: (i * 3.8 + Math.random() * 2) % 100,
      size: 10 + (i % 5) * 3, // 10px to 22px
      opacity: 0.2 + (i % 4) * 0.15, // 0.2 to 0.65
      duration: 10 + (i % 6) * 2.5, // 10s to 22.5s
      delay: (i % 10) * 1.2,
      swayDuration: 3 + (i % 4),
      char: chars[i % chars.length],
    }));
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden select-none"
    >
      <style>{`
        @keyframes snowfall {
          0% {
            transform: translateY(-50px);
          }
          100% {
            transform: translateY(105vh);
          }
        }
        @keyframes snowSway {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(18px);
          }
        }
      `}</style>
      {snowflakes.map((s) => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: '-30px',
            fontSize: `${s.size}px`,
            opacity: s.opacity,
            color: '#93c5fd',
            animation: `snowfall ${s.duration}s linear infinite, snowSway ${s.swayDuration}s ease-in-out infinite`,
            animationDelay: `-${s.delay}s`,
            textShadow: '0 0 4px rgba(255,255,255,0.8), 0 0 8px rgba(186,230,253,0.5)',
          }}
        >
          {s.char}
        </div>
      ))}
    </div>
  );
};
