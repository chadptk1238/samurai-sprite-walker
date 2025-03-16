
import React, { useEffect, useRef, useState } from 'react';

// Define animation types for the sprite
type AnimationType = 'idle' | 'walk' | 'middleParry' | 'upParry' | 'downParry' | 'attack' | 'thrust' | 'downAttack' | 'death' | 'jump';

interface SamuraiProps {
  x: number;
  direction: 'left' | 'right';
  isWalking: boolean;
  scale: number;
  animation?: AnimationType;
}

// Sprite sheet position mapping for animations
const animations = {
  idle: { row: 0, frames: 1, startFrame: 0 },
  walk: { row: 0, frames: 4, startFrame: 0 },
  middleParry: { row: 1, frames: 1, startFrame: 0 },
  upParry: { row: 1, frames: 1, startFrame: 1 },
  downParry: { row: 1, frames: 1, startFrame: 2 },
  attack: { row: 2, frames: 2, startFrame: 0 },
  thrust: { row: 3, frames: 1, startFrame: 0 },
  downAttack: { row: 3, frames: 1, startFrame: 1 },
  death: { row: 4, frames: 1, startFrame: 0 },
  jump: { row: 5, frames: 1, startFrame: 0 },
};

const Samurai: React.FC<SamuraiProps> = ({ x, direction, isWalking, scale, animation = 'idle' }) => {
  const samuraiRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(0);
  const [currentAnimation, setCurrentAnimation] = useState<AnimationType>(animation);
  const [jumping, setJumping] = useState(false);
  const [jumpHeight, setJumpHeight] = useState(0);
  
  // Handle animation changes
  useEffect(() => {
    // If walking animation is active, override the current animation
    if (isWalking) {
      setCurrentAnimation('walk');
    } else if (!jumping) {
      // If not walking or jumping, use the provided animation
      setCurrentAnimation(animation);
    }
  }, [isWalking, animation, jumping]);
  
  // Walking animation effect
  useEffect(() => {
    let animationInterval: number | null = null;
    const currentAnimData = animations[currentAnimation];
    
    if (currentAnimation === 'walk' && isWalking) {
      // Start walking animation - cycle through frames
      animationInterval = window.setInterval(() => {
        setFrame(prevFrame => (prevFrame + 1) % currentAnimData.frames);
      }, 150); // Animation speed - adjust as needed
    } else if (currentAnimation === 'attack') {
      // For attack animation, cycle once then return to idle
      animationInterval = window.setInterval(() => {
        setFrame(prevFrame => {
          const nextFrame = prevFrame + 1;
          if (nextFrame >= currentAnimData.frames) {
            // Animation complete, return to idle
            setCurrentAnimation('idle');
            return 0;
          }
          return nextFrame;
        });
      }, 150);
    } else if (currentAnimation === 'jump') {
      // Start jump animation
      setJumping(true);
      let jumpProgress = 0;
      const jumpDuration = 500; // ms
      const jumpInterval = 10; // ms
      const maxJumpHeight = 50; // pixels
      
      const jumpAnimationInterval = window.setInterval(() => {
        jumpProgress += jumpInterval;
        
        // Calculate jump height using a parabolic function
        const progress = jumpProgress / jumpDuration;
        const newHeight = maxJumpHeight * Math.sin(progress * Math.PI);
        
        setJumpHeight(newHeight);
        
        if (jumpProgress >= jumpDuration) {
          // End jump animation
          clearInterval(jumpAnimationInterval);
          setJumping(false);
          setJumpHeight(0);
          setCurrentAnimation('idle');
        }
      }, jumpInterval);
      
      return () => {
        clearInterval(jumpAnimationInterval);
      };
    } else {
      // Reset to first frame for other animations
      setFrame(0);
    }
    
    return () => {
      if (animationInterval !== null) {
        clearInterval(animationInterval);
      }
    };
  }, [currentAnimation, isWalking]);
  
  // Calculate the background position based on the current animation and frame
  const getBackgroundPosition = () => {
    const animData = animations[currentAnimation];
    const frameIndex = animData.startFrame + frame;
    const x = frameIndex * 32; // Each frame is 32px wide
    const y = animData.row * 32; // Each row is 32px tall
    return `-${x}px -${y}px`;
  };
  
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
        backgroundPosition: getBackgroundPosition(),
        width: '32px',
        height: '32px',
        zIndex: 10
      }}
    />
  );
};

export default Samurai;
