
import React, { useEffect, useRef, useState } from 'react';

interface SamuraiProps {
  x: number;
  direction: 'left' | 'right';
  isWalking: boolean;
  scale: number;
}

const Samurai: React.FC<SamuraiProps> = ({ x, direction, isWalking, scale }) => {
  const samuraiRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(0);
  const walkFrames = 4; // Number of frames in the walking animation
  
  useEffect(() => {
    let animationInterval: number | null = null;
    
    if (isWalking) {
      // Start walking animation - cycle through frames 0-3 (the first row in the sprite sheet)
      animationInterval = window.setInterval(() => {
        setFrame(prevFrame => (prevFrame + 1) % walkFrames);
      }, 150); // Animation speed - adjust as needed
    } else {
      // Reset to idle frame when not walking
      setFrame(0);
    }
    
    return () => {
      if (animationInterval !== null) {
        clearInterval(animationInterval);
      }
    };
  }, [isWalking]);
  
  return (
    <div 
      ref={samuraiRef}
      className="samurai-sprite absolute bottom-14 pixelated"
      style={{ 
        left: `${x}px`,
        transform: `scaleX(${direction === 'left' ? -1 : 1}) scale(${scale})`,
        transformOrigin: 'bottom center',
        backgroundImage: 'url("/lovable-uploads/7c92fe0d-ef0e-4f4b-a40d-59ddcb1e32a2.png")',
        backgroundPosition: `-${frame * 32}px 0px`, // Position is based on current frame (first row)
        width: '32px',
        height: '32px',
        zIndex: 10
      }}
    />
  );
};

export default Samurai;
