
import React, { useEffect, useRef, useState } from 'react';
import { AnimationType } from './game/useAnimationState';

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
  crouch: { row: 4, frames: 1, startFrame: 0, duration: 0 },
  jump: { row: 5, frames: 1, startFrame: 0, duration: 500 },
};

const Samurai: React.FC<SamuraiProps> = ({ x, direction, isWalking, scale, animation = 'idle' }) => {
  const samuraiRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(0);
  const [currentAnimation, setCurrentAnimation] = useState<AnimationType>(animation);
  const [jumpHeight, setJumpHeight] = useState(0);
  
  // Use refs to track animation state
  const animationStateRef = useRef({
    isJumping: false,
    currentAnimation: animation as AnimationType,
    animationTimer: null as number | null,
    animationFrameId: null as number | null,
    animationStartTime: 0,
  });
  
  // Handle animation changes
  useEffect(() => {
    // If we're already in the requested animation, we can allow re-triggering for attack and jump
    const canRestart = animation === 'attack' || animation === 'jump';
    
    // Skip if the animation hasn't changed and isn't restartable
    if (animation === animationStateRef.current.currentAnimation && !canRestart) {
      return;
    }

    // Priority animations that should interrupt others
    const priorityAnimations = ['attack', 'jump', 'thrust', 'downAttack'];
    
    // For normal state transitions
    if (animation !== animationStateRef.current.currentAnimation || canRestart) {
      // Clear any existing animation timer
      if (animationStateRef.current.animationTimer) {
        clearTimeout(animationStateRef.current.animationTimer);
        animationStateRef.current.animationTimer = null;
      }
      
      // Cancel any ongoing animation frame
      if (animationStateRef.current.animationFrameId) {
        cancelAnimationFrame(animationStateRef.current.animationFrameId);
        animationStateRef.current.animationFrameId = null;
      }
      
      // Special case for jump animation
      if (animation === 'jump') {
        // Always allow new jumps even if already jumping
        animationStateRef.current.isJumping = true;
        setCurrentAnimation('jump');
        setFrame(0);
        animationStateRef.current.animationStartTime = Date.now();
      } 
      // Handle attack animations
      else if (animation === 'attack' || animation === 'thrust' || animation === 'downAttack') {
        setCurrentAnimation(animation);
        setFrame(0);
        animationStateRef.current.animationStartTime = Date.now();
        
        // Set a timer to return to idle
        const timer = window.setTimeout(() => {
          if (!isWalking) {
            setCurrentAnimation('idle');
          } else {
            setCurrentAnimation('walk');
          }
          animationStateRef.current.animationTimer = null;
        }, animations[animation].duration);
        
        animationStateRef.current.animationTimer = timer;
      }
      // Handle other animations
      else if (!animationStateRef.current.isJumping && animation !== 'jump') {
        setCurrentAnimation(animation);
        setFrame(0);
        animationStateRef.current.animationStartTime = Date.now();
        
        // For animations with a duration, set a timer to return to idle
        const animDuration = animations[animation].duration;
        if (animDuration > 0 && animation !== 'walk') {
          const timer = window.setTimeout(() => {
            if (!isWalking) {
              setCurrentAnimation('idle');
            } else {
              setCurrentAnimation('walk');
            }
            animationStateRef.current.animationTimer = null;
          }, animDuration);
          animationStateRef.current.animationTimer = timer;
        }
      }
      
      // Update the current animation in ref
      animationStateRef.current.currentAnimation = animation;
    }
    
    // Handle walking animation specifically
    if (isWalking && !animationStateRef.current.isJumping && 
        !['attack', 'thrust', 'downAttack'].includes(currentAnimation) && 
        currentAnimation !== 'walk') {
      setCurrentAnimation('walk');
      setFrame(0);
    } else if (!isWalking && currentAnimation === 'walk') {
      setCurrentAnimation('idle');
      setFrame(0);
    }
  }, [isWalking, animation, currentAnimation]);
  
  // Animation frame effect - separate from the state changes to avoid loops
  useEffect(() => {
    // Cancel any existing animation
    if (animationStateRef.current.animationFrameId) {
      cancelAnimationFrame(animationStateRef.current.animationFrameId);
      animationStateRef.current.animationFrameId = null;
    }
    
    let lastFrameTime = 0;
    
    if (currentAnimation === 'walk' && isWalking) {
      // Start walking animation - cycle through frames
      const currentAnimData = animations[currentAnimation];
      const frameInterval = currentAnimData.duration / currentAnimData.frames;
      
      const updateFrame = (timestamp: number) => {
        if (!lastFrameTime) lastFrameTime = timestamp;
        
        const elapsed = timestamp - lastFrameTime;
        if (elapsed > frameInterval) {
          setFrame(prevFrame => (prevFrame + 1) % currentAnimData.frames);
          lastFrameTime = timestamp;
        }
        
        animationStateRef.current.animationFrameId = requestAnimationFrame(updateFrame);
      };
      
      animationStateRef.current.animationFrameId = requestAnimationFrame(updateFrame);
    } else if (currentAnimation === 'attack') {
      // Fixed animation sequence for attack - only 2 frames
      const currentAnimData = animations[currentAnimation];
      const frameInterval = currentAnimData.duration / currentAnimData.frames;
      const startTime = animationStateRef.current.animationStartTime || Date.now();
      
      const updateAttackFrame = (timestamp: number) => {
        const elapsed = Date.now() - startTime;
        const frameIndex = Math.min(
          Math.floor(elapsed / frameInterval),
          currentAnimData.frames - 1
        );
        
        setFrame(frameIndex);
        
        // Only continue the animation if we haven't reached the end
        if (elapsed < currentAnimData.duration) {
          animationStateRef.current.animationFrameId = requestAnimationFrame(updateAttackFrame);
        }
      };
      
      animationStateRef.current.animationFrameId = requestAnimationFrame(updateAttackFrame);
    } else if (currentAnimation === 'jump' && animationStateRef.current.isJumping) {
      // Improved jump animation with physics
      const jumpStartTime = animationStateRef.current.animationStartTime || Date.now();
      const jumpDuration = animations.jump.duration;
      const maxJumpHeight = 50; // pixels
      
      const updateJump = (timestamp: number) => {
        const elapsed = Date.now() - jumpStartTime;
        const progress = Math.min(elapsed / jumpDuration, 1);
        
        // Parabolic jump curve (0 at start, 0 at end, max height in middle)
        const jumpCurve = Math.sin(progress * Math.PI);
        const newHeight = maxJumpHeight * jumpCurve;
        
        setJumpHeight(newHeight);
        
        if (progress < 1) {
          animationStateRef.current.animationFrameId = requestAnimationFrame(updateJump);
        } else {
          // End jump animation
          animationStateRef.current.isJumping = false;
          setJumpHeight(0);
          
          // Return to appropriate animation
          if (isWalking) {
            setCurrentAnimation('walk');
          } else {
            setCurrentAnimation('idle');
          }
        }
      };
      
      animationStateRef.current.animationFrameId = requestAnimationFrame(updateJump);
    }
    
    // Cleanup function
    return () => {
      if (animationStateRef.current.animationFrameId) {
        cancelAnimationFrame(animationStateRef.current.animationFrameId);
        animationStateRef.current.animationFrameId = null;
      }
      
      if (animationStateRef.current.animationTimer) {
        clearTimeout(animationStateRef.current.animationTimer);
        animationStateRef.current.animationTimer = null;
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
