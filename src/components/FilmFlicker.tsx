import { useEffect, useState } from 'react';

export function FilmFlicker() {
  const [opacity, setOpacity] = useState(0.02);

  useEffect(() => {
    const flicker = () => {
      // Random flicker intensity - more mild
      const newOpacity = Math.random() * 0.05 + 0.01;
      setOpacity(newOpacity);
    };

    // Slower, more subtle flicker intervals
    const interval = setInterval(() => {
      flicker();
    }, 100 + Math.random() * 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Grain/noise overlay */}
      <div 
        className="absolute inset-0 z-30 pointer-events-none film-grain"
        style={{
          opacity: opacity,
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />
      
      {/* Vignette effect */}
      <div 
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
        }}
      />
      
      {/* Light flicker overlay */}
      <div 
        className="absolute inset-0 z-25 pointer-events-none animate-flicker"
        style={{
          background: 'rgba(255, 255, 255, 0.008)',
        }}
      />
    </>
  );
}
