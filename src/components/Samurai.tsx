import React, { useEffect, useRef, useState } from 'react';
import { AnimationType } from './game/useAnimationState';

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
  // Track current animation and frame
  const [currentAnimation, setCurrentAnimation] = useState<AnimationType>(animation);
  const [frame, setFrame] = useState(0);
  const [jumpHeight, setJumpHeight] = useState(0);
  
  // Animation configuration
  const animations = {
    idle: { row: 0, frames: 1, startFrame: 0, duration: 0 },
    walk: { row: 0, frames: 4, startFrame: 0, duration: 600 },
    middleParry: { row: 1, frames: 1, startFrame: 0, duration: 400 },
    upParry: { row: 1, frames: 1, startFrame: 1, duration: 400 },
    downParry: { row: 1, frames: 1, startFrame: 2, duration: 400 },
    attack: { row: 2, frames: 4, startFrame: 0, duration: 800 },
    thrust: { row: 3, frames: 1, startFrame: 0, duration: 400 },
    downAttack: { row: 3, frames: 1, startFrame: 1, duration: 400 },
    death: { row: 4, frames: 1, startFrame: 0, duration: 0 },
    crouch: { row: 4, frames: 1, startFrame: 0, duration: 0 },
    jump: { row: 5, frames: 1, startFrame: 0, duration: 500 },
  };
  
  // Animation references
  const animationTimerRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);
  
  // Calculate background position
  const getBackgroundPosition = (anim: AnimationType, frameIndex: number) => {
    const animData = animations[anim];
    if (!animData) return '0px 0px';
    
    const x = (animData.startFrame + frameIndex) * 32;
    const y = animData.row * 32;
    
    return `-${x}px -${y}px`;
  };
  
  // Handle animation changes
  useEffect(() => {
    // Don't interrupt ongoing action animations
    if (isAnimatingRef.current && 
        ['attack', 'jump', 'thrust', 'downAttack'].includes(currentAnimation)) {
      return;
    }
    
    // Clear any existing animation
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }
    
    // Set new animation
    setCurrentAnimation(animation);
    setFrame(0);
    
    // Handle specific animations
    if (animation === 'attack') {
      isAnimatingRef.current = true;
      
      // Manually step through attack frames with timeouts
      setFrame(0);
      
      // Frame 1 after 200ms
      animationTimerRef.current = window.setTimeout(() => {
        setFrame(1);
        
        // Frame 2 after 200ms
        animationTimerRef.current = window.setTimeout(() => {
          setFrame(2);
          
          // Frame 3 after 200ms
          animationTimerRef.current = window.setTimeout(() => {
            setFrame(3);
            
            // Return to idle/walk after 200ms
            animationTimerRef.current = window.setTimeout(() => {
              isAnimatingRef.current = false;
              setCurrentAnimation(isWalking ? 'walk' : 'idle');
              setFrame(0);
            }, 200);
          }, 200);
        }, 200);
      }, 200);
    }
    else if (animation === 'walk' && isWalking) {
      // Set up walking animation
      const walkTimer = () => {
        setFrame(prevFrame => (prevFrame + 1) % animations.walk.frames);
        animationTimerRef.current = window.setTimeout(walkTimer, animations.walk.duration / animations.walk.frames);
      };
      animationTimerRef.current = window.setTimeout(walkTimer, animations.walk.duration / animations.walk.frames);
    }
    else if (animation === 'jump') {
      isAnimatingRef.current = true;
      
      // Jump animation using setTimeout and height calculation
      const jumpDuration = animations.jump.duration;
      const startTime = Date.now();
      
      const jumpTimer = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / jumpDuration, 1);
        
        if (progress < 1) {
          // Parabolic curve
          const jumpCurve = Math.sin(progress * Math.PI);
          setJumpHeight(50 * jumpCurve); // 50 is max height
          
          // Continue animation
          animationTimerRef.current = window.setTimeout(jumpTimer, 16);
        } else {
          // End jump
          setJumpHeight(0);
          isAnimatingRef.current = false;
          setCurrentAnimation(isWalking ? 'walk' : 'idle');
        }
      };
      
      animationTimerRef.current = window.setTimeout(jumpTimer, 16);
    }
    
    // Cleanup function
    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
        animationTimerRef.current = null;
      }
    };
  }, [animation, isWalking]);
  
  // Debug display
  const debugInfo = (
    <div style={{
      position: 'absolute', 
      top: '-40px',
      left: '0',
      background: 'white',
      padding: '2px',
      fontSize: '10px',
      zIndex: 100
    }}>
      {currentAnimation}, frame: {frame}
    </div>
  );
  
  return (
    <div 
      className="samurai-sprite absolute pixelated"
      style={{ 
        left: `${x}px`,
        bottom: `${14 + jumpHeight}px`,
        transform: `scaleX(${direction === 'left' ? -1 : 1}) scale(${scale})`,
        transformOrigin: 'bottom center',
        backgroundImage: 'url("/lovable-uploads/a953a947-c3ee-4308-ae92-0fdf9828dca8.png")',
        backgroundPosition: getBackgroundPosition(currentAnimation, frame),
        width: '32px',
        height: '32px',
        zIndex: 10,
        position: 'relative'
      }}
    >
      {debugInfo}
    </div>
  );
};

export default Samurai;
