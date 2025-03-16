import React, { useEffect, useRef } from 'react';
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
  
  // Handle animation changes from props
  useEffect(() => {
    updateAnimation(animation);
  }, [animation, updateAnimation]);
  
  return (
    <div 
      ref={samuraiRef}
      className="samurai-sprite absolute pixelated"
      style={{ 
        left: `${x}px`,
        bottom: `${14 + jumpHeight}px`, // Base position + jump height
        transform: `scaleX(${direction === 'left' ? -1 : 1}) scale(${scale})`,
        transformOrigin: 'bottom center',
        backgroundImage: 'url("/lovable-uploads/a953a947-c3ee-4308-ae92-0fdf9828dca8.png")',
        backgroundPosition: getBackgroundPosition(currentAnimation, frame),
        width: '32px',
        height: '32px',
        zIndex: 10
      }}
    />
  );
};

export default Samurai;
