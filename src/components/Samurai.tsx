import React, { useEffect, useRef, useState } from 'react';
import { AnimationType } from './game/useAnimationState';
import { useSpriteAnimation } from './game/useSpriteAnimation';
import { getBackgroundPosition } from './game/animationUtils';

interface SamuraiProps {
  x: number;
  direction: 'left' | 'right';
  isWalking: boolean;
  scale: number;
  animation?: AnimationType;
}

const Samurai: React.FC<SamuraiProps> = ({ 
  x, 
  direction, 
  isWalking, 
  scale, 
  animation = 'idle' 
}) => {
  const samuraiRef = useRef<HTMLDivElement>(null);
  
  // Use our custom hook for animation logic
  const { 
    frame, 
    currentAnimation, 
    jumpHeight, 
    updateAnimation 
  } = useSpriteAnimation(animation, isWalking);
  
  // Manual test for debugging
  const [debugMode, setDebugMode] = useState(false);
  const [manualFrame, setManualFrame] = useState(0);
  
  // Handle animation changes from props
  useEffect(() => {
    updateAnimation(animation);
  }, [animation, updateAnimation]);
  
  // Debug UI for testing frames
  const debugControls = debugMode ? (
    <div 
      style={{
        position: 'absolute',
        bottom: '60px',
        left: `${x - 50}px`,
        zIndex: 100,
        backgroundColor: 'white',
        padding: '4px',
        border: '1px solid black',
        fontSize: '10px'
      }}
    >
      <div>Frame: {frame} of 4</div>
      <div>
        <button onClick={() => setManualFrame(0)}>Frame 0</button>
        <button onClick={() => setManualFrame(1)}>Frame 1</button>
        <button onClick={() => setManualFrame(2)}>Frame 2</button>
        <button onClick={() => setManualFrame(3)}>Frame 3</button>
      </div>
    </div>
  ) : null;
  
  // Calculate position based on debug or actual frame
  const bgPosition = debugMode 
    ? getBackgroundPosition('attack', manualFrame)
    : getBackgroundPosition(currentAnimation, frame);
  
  return (
    <>
      {debugControls}
      <div 
        ref={samuraiRef}
        className="samurai-sprite absolute pixelated"
        onClick={() => setDebugMode(!debugMode)}
        style={{ 
          left: `${x}px`,
          bottom: `${14 + jumpHeight}px`, // Base position + jump height
          transform: `scaleX(${direction === 'left' ? -1 : 1}) scale(${scale})`,
          transformOrigin: 'bottom center',
          backgroundImage: 'url("/lovable-uploads/a953a947-c3ee-4308-ae92-0fdf9828dca8.png")',
          backgroundPosition: bgPosition,
          width: '32px',
          height: '32px',
          zIndex: 10
        }}
      />
    </>
  );
};

export default Samurai;
