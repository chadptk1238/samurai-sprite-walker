
import React, { useEffect, useRef } from 'react';

interface SamuraiProps {
  x: number;
  direction: 'left' | 'right';
  isWalking: boolean;
  scale: number;
}

const Samurai: React.FC<SamuraiProps> = ({ x, direction, isWalking, scale }) => {
  const samuraiRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Apply animation class based on walking state
    if (samuraiRef.current) {
      if (isWalking) {
        samuraiRef.current.style.animation = 'walk 0.5s steps(4) infinite';
      } else {
        samuraiRef.current.style.animation = 'none';
        samuraiRef.current.style.backgroundPosition = '0px 0px';
      }
    }
  }, [isWalking]);

  return (
    <div 
      ref={samuraiRef}
      className={`samurai-sprite absolute bottom-14 ${direction === 'left' ? 'samurai-flip' : ''}`}
      style={{ 
        left: `${x}px`,
        transform: `scaleX(${direction === 'left' ? -1 : 1}) scale(${scale})`,
        transformOrigin: 'bottom center',
        backgroundImage: 'url("/lovable-uploads/7c92fe0d-ef0e-4f4b-a40d-59ddcb1e32a2.png")',
        zIndex: 10
      }}
    />
  );
};

export default Samurai;
