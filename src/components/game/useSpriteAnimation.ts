
import { useEffect, useRef, useCallback } from 'react';
import { AnimationType } from './useAnimationState';
import { useAnimationStateManager } from './animations/useAnimationStateManager';
import { 
  updateWalkingFrames, 
  updateAttackFrames, 
  updateJumpFrames 
} from './animations/frameManager';
import { SpriteAnimationResult } from './types/animationTypes';

export const useSpriteAnimation = (
  initialAnimation: AnimationType = 'idle',
  isWalking: boolean
): SpriteAnimationResult => {
  const {
    frame,
    setFrame,
    currentAnimation,
    setCurrentAnimation,
    jumpHeight,
    setJumpHeight,
    animationStateRef,
    clearAnimations,
    setAnimationTimer
  } = useAnimationStateManager(initialAnimation);

  // Callback for when attack animation completes
  const handleAttackComplete = useCallback(() => {
    if (isWalking) {
      setCurrentAnimation('walk');
    } else {
      setCurrentAnimation('idle');
    }
  }, [isWalking, setCurrentAnimation]);

  // Handle animation changes - defined BEFORE the useEffect that uses it
  const updateAnimation = useCallback((animation: AnimationType) => {
    // If we're already in the requested animation, we can allow re-triggering for attack and jump
    const canRestart = animation === 'attack' || animation === 'jump' || animation === 'thrust' || animation === 'downAttack';
    
    // Skip if the animation hasn't changed and isn't restartable
    if (animation === animationStateRef.current.currentAnimation && !canRestart) {
      return;
    }
    
    // For normal state transitions
    if (animation !== animationStateRef.current.currentAnimation || canRestart) {
      // Clear any existing animation
      clearAnimations();
      
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
      }
      // Handle other animations
      else if (!animationStateRef.current.isJumping) {
        setCurrentAnimation(animation);
        setFrame(0);
        animationStateRef.current.animationStartTime = Date.now();
      }
      
      // Update the current animation in ref
      animationStateRef.current.currentAnimation = animation;
    }
    
    // Handle walking animation specifically
    if (isWalking && !animationStateRef.current.isJumping && 
        !['attack', 'thrust', 'downAttack'].includes(animation) && 
        currentAnimation !== 'walk') {
      setCurrentAnimation('walk');
      setFrame(0);
    } else if (!isWalking && currentAnimation === 'walk') {
      setCurrentAnimation('idle');
      setFrame(0);
    }
  }, [isWalking, currentAnimation, setCurrentAnimation, setFrame, clearAnimations, animationStateRef]);

  // Run animation frames
  useEffect(() => {
    // Cancel any existing animation
    clearAnimations();
    
    let animationFrameId: number | null = null;
    
    if (currentAnimation === 'walk' && isWalking) {
      // Start walking animation - cycle through frames
      animationFrameId = updateWalkingFrames(currentAnimation, setFrame, animationStateRef);
      animationStateRef.current.animationFrameId = animationFrameId;
    } else if (currentAnimation === 'attack' || currentAnimation === 'thrust' || currentAnimation === 'downAttack') {
      // Fixed animation sequence for attack animations with callback for completion
      animationFrameId = updateAttackFrames(currentAnimation, setFrame, animationStateRef, handleAttackComplete);
      animationStateRef.current.animationFrameId = animationFrameId;
    } else if (currentAnimation === 'jump' && animationStateRef.current.isJumping) {
      // Improved jump animation with physics
      animationFrameId = updateJumpFrames(setJumpHeight, setCurrentAnimation, animationStateRef, isWalking);
      animationStateRef.current.animationFrameId = animationFrameId;
    }
    
    // Cleanup function
    return () => {
      clearAnimations();
    };
  }, [currentAnimation, isWalking, handleAttackComplete, clearAnimations, setFrame, setCurrentAnimation, setJumpHeight, animationStateRef]);

  return {
    frame,
    currentAnimation,
    jumpHeight,
    updateAnimation
  };
};
