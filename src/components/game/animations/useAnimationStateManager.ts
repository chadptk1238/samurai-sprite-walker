import { useRef, useState } from 'react';
import { AnimationType } from '../useAnimationState';
import { AnimationState } from '../types/animationTypes';
import { animations } from '../animationUtils';

export const useAnimationStateManager = (initialAnimation: AnimationType) => {
  const [frame, setFrame] = useState(0);
  const [currentAnimation, setCurrentAnimation] = useState<AnimationType>(initialAnimation);
  const [jumpHeight, setJumpHeight] = useState(0);

  // Use ref to track animation state
  const animationStateRef = useRef<AnimationState>({
    isJumping: false,
    isAttacking: false, // Initialize the new property
    currentAnimation: initialAnimation,
    animationTimer: null,
    animationFrameId: null,
    animationStartTime: 0,
  });
  
  // Clear existing animations
  const clearAnimations = () => {
    if (animationStateRef.current.animationTimer) {
      clearTimeout(animationStateRef.current.animationTimer);
      animationStateRef.current.animationTimer = null;
    }
    
    if (animationStateRef.current.animationFrameId) {
      cancelAnimationFrame(animationStateRef.current.animationFrameId);
      animationStateRef.current.animationFrameId = null;
    }
  };
  
  // Set a timer for animation to revert back
  const setAnimationTimer = (isWalking: boolean, animation: AnimationType) => {
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
  };
  
  return {
    frame,
    setFrame,
    currentAnimation,
    setCurrentAnimation,
    jumpHeight,
    setJumpHeight,
    animationStateRef,
    clearAnimations,
    setAnimationTimer
  };
};
