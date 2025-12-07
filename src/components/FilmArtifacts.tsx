import { useEffect, useState } from 'react';

interface Scratch {
  id: number;
  left: number;
  height: number;
  opacity: number;
  thickness: number;
}

interface Dust {
  id: number;
  left: number;
  top: number;
  size: number;
  opacity: number;
}

export function FilmArtifacts() {
  const [scratches, setScratches] = useState<Scratch[]>([]);
  const [dust, setDust] = useState<Dust[]>([]);

  useEffect(() => {
    // Generate initial scratches
    const generateScratches = () => {
      const newScratches: Scratch[] = [];
      const scratchCount = Math.floor(Math.random() * 3) + 2; // 2-4 scratches
      
      for (let i = 0; i < scratchCount; i++) {
        newScratches.push({
          id: Math.random(),
          left: Math.random() * 100,
          height: Math.random() * 60 + 40, // 40-100% height
          opacity: Math.random() * 0.15 + 0.05, // 0.05-0.2 opacity
          thickness: Math.random() * 1.5 + 0.3, // 0.3-1.8px thickness
        });
      }
      
      setScratches(newScratches);
    };

    // Generate dust particles
    const generateDust = () => {
      const newDust: Dust[] = [];
      const dustCount = Math.floor(Math.random() * 15) + 10; // 10-25 dust particles
      
      for (let i = 0; i < dustCount; i++) {
        newDust.push({
          id: Math.random(),
          left: Math.random() * 100,
          top: Math.random() * 100,
          size: Math.random() * 2 + 0.5, // 0.5-2.5px
          opacity: Math.random() * 0.4 + 0.1, // 0.1-0.5 opacity
        });
      }
      
      setDust(newDust);
    };

    generateScratches();
    generateDust();

    // Occasionally update scratches
    const scratchInterval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance to update
        generateScratches();
      }
    }, 3000);

    // Frequently update dust
    const dustInterval = setInterval(() => {
      generateDust();
    }, 500);

    return () => {
      clearInterval(scratchInterval);
      clearInterval(dustInterval);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
      {/* Vertical scratches */}
      {scratches.map((scratch) => (
        <div
          key={scratch.id}
          className="absolute top-0"
          style={{
            left: `${scratch.left}%`,
            width: `${scratch.thickness}px`,
            height: `${scratch.height}%`,
            backgroundColor: '#ffffff',
            opacity: scratch.opacity,
            boxShadow: `0 0 ${scratch.thickness * 2}px rgba(255, 255, 255, ${scratch.opacity * 0.5})`,
          }}
        />
      ))}

      {/* Dust particles */}
      {dust.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: '#ffffff',
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size}px rgba(255, 255, 255, ${particle.opacity})`,
          }}
        />
      ))}

      {/* Occasional horizontal line */}
      <HorizontalLine />
    </div>
  );
}

function HorizontalLine() {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState(50);

  useEffect(() => {
    const interval = setInterval(() => {
      // 5% chance to show a horizontal line
      if (Math.random() > 0.95) {
        setPosition(Math.random() * 100);
        setVisible(true);
        
        // Hide after a brief moment
        setTimeout(() => setVisible(false), 100);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="absolute w-full h-[1px]"
      style={{
        top: `${position}%`,
        backgroundColor: '#ffffff',
        opacity: 0.3,
        boxShadow: '0 0 2px rgba(255, 255, 255, 0.3)',
      }}
    />
  );
}
