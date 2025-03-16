
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
  idle: { row: 0, frames: 1, startFrame: 0, duration: 0 },
  walk: { row: 0, frames: 4, startFrame: 0, duration: 600 },
  middleParry: { row: 1, frames: 1, startFrame: 0, duration: 400 },
  upParry: { row: 1, frames: 1, startFrame: 1, duration: 400 },
  downParry: { row: 1, frames: 1, startFrame: 2, duration: 400 },
  attack: { row: 2, frames: 2, startFrame: 0, duration: 300 },
  thrust: { row: 3, frames: 1, startFrame: 0, duration: 400 },
  downAttack: { row: 3, frames: 1, startFrame: 1, duration: 400 },
  death: { row: 4, frames: 1, startFrame: 0, duration: 0 },
  jump: { row: 5, frames: 1, startFrame: 0, duration: 500 },
};

const Samurai: React.FC<SamuraiProps> = ({ x, direction, isWalking, scale, animation = 'idle' }) => {
  const samuraiRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(0);
  const [currentAnimation, setCurrentAnimation] = useState<AnimationType>(animation);
  const [jumping, setJumping] = useState(false);
  const [jumpHeight, setJumpHeight] = useState(0);
  const [animationTimer, setAnimationTimer] = useState<number | null>(null);
  const [animationStartTime, setAnimationStartTime] = useState<number | null>(null);
  
  // Handle animation changes
  useEffect(() => {
    // Don't interrupt animations in progress unless it's walking or idle
    if (animationTimer && currentAnimation !== 'idle' && 
        currentAnimation !== 'walk' && animation !== 'idle') {
      return;
    }
    
    // Clear any existing animation timer
    if (animationTimer) {
      clearTimeout(animationTimer);
      setAnimationTimer(null);
    }
    
    // If walking animation is active, override the current animation
    if (isWalking) {
      setCurrentAnimation('walk');
    } else if (animation !== currentAnimation && !jumping) {
      // Start the new animation
      setCurrentAnimation(animation);
      setFrame(0);
      setAnimationStartTime(Date.now());
      
      // For animations with a duration, set a timer to return to idle
      const animDuration = animations[animation].duration;
      if (animDuration > 0 && animation !== 'walk') {
        const timer = window.setTimeout(() => {
          setCurrentAnimation('idle');
          setAnimationTimer(null);
        }, animDuration);
        setAnimationTimer(timer);
      }
    }
  }, [isWalking, animation, jumping, currentAnimation, animationTimer]);
  
  // Walking animation effect
  useEffect(() => {
    let animationId: number | null = null;
    
    if (currentAnimation === 'walk' && isWalking) {
      // Start walking animation - cycle through frames
      const currentAnimData = animations[currentAnimation];
      const frameInterval = currentAnimData.duration / currentAnimData.frames;
      
      let lastFrameTime = 0;
      const updateFrame = (timestamp: number) => {
        if (!lastFrameTime) lastFrameTime = timestamp;
        
        const elapsed = timestamp - lastFrameTime;
        if (elapsed > frameInterval) {
          setFrame(prevFrame => (prevFrame + 1) % currentAnimData.frames);
          lastFrameTime = timestamp;
        }
        
        animationId = requestAnimationFrame(updateFrame);
      };
      
      animationId = requestAnimationFrame(updateFrame);
    } else if (currentAnimation === 'attack' || currentAnimation === 'thrust' || currentAnimation === 'downAttack') {
      // Use animationStartTime to calculate the current frame for attack animations
      const currentAnimData = animations[currentAnimation];
      if (currentAnimData.frames > 1) {
        const frameInterval = currentAnimData.duration / currentAnimData.frames;
        
        const updateAttackFrame = () => {
          if (animationStartTime) {
            const elapsed = Date.now() - animationStartTime;
            const frameIndex = Math.min(
              Math.floor(elapsed / frameInterval),
              currentAnimData.frames - 1
            );
            setFrame(frameIndex);
          }
          
          animationId = requestAnimationFrame(updateAttackFrame);
        };
        
        animationId = requestAnimationFrame(updateAttackFrame);
      }
    } else if (currentAnimation === 'jump' && !jumping) {
      // Start jump animation with improved physics
      setJumping(true);
      setFrame(0);
      
      const jumpStartTime = Date.now();
      const jumpDuration = animations.jump.duration;
      const maxJumpHeight = 50; // pixels
      
      const updateJump = () => {
        const elapsed = Date.now() - jumpStartTime;
        const progress = Math.min(elapsed / jumpDuration, 1);
        
        // Parabolic jump curve (0 at start, 0 at end, max height in middle)
        const jumpCurve = Math.sin(progress * Math.PI);
        const newHeight = maxJumpHeight * jumpCurve;
        
        setJumpHeight(newHeight);
        
        if (progress < 1) {
          animationId = requestAnimationFrame(updateJump);
        } else {
          // End jump animation
          setJumping(false);
          setJumpHeight(0);
          setCurrentAnimation('idle');
        }
      };
      
      animationId = requestAnimationFrame(updateJump);
    } else if (currentAnimation === 'idle' || 
               currentAnimation === 'middleParry' || 
               currentAnimation === 'upParry' || 
               currentAnimation === 'downParry' ||
               currentAnimation === 'death') {
      // Reset to first frame for static animations
      setFrame(0);
    }
    
    return () => {
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [currentAnimation, isWalking, animationStartTime, jumping]);
  
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
