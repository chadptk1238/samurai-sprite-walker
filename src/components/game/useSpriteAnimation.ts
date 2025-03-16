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

  // Flag to track if an animation is currently running
  const isAnimatingRef = useRef(false);

  // Callback for when attack animation completes
  const handleAttackComplete = useCallback(() => {
    console.log('Attack animation completed, returning to', isWalking ? 'walk' : 'idle');
    
    // Clear the animating flag
    isAnimatingRef.current = false;
    
    clearAnimations();
    
    if (isWalking) {
      setCurrentAnimation('walk');
    } else {
      setCurrentAnimation('idle');
    }
    
    // Reset animation state
    if (animationStateRef.current) {
      animationStateRef.current.currentAnimation = isWalking ? 'walk' : 'idle';
    }
  }, [isWalking, setCurrentAnimation, clearAnimations, animationStateRef]);

  // Handle animation changes
  const updateAnimation = useCallback((animation: AnimationType) => {
    console.log(`updateAnimation called with: ${animation}, current: ${animationStateRef.current?.currentAnimation}`);
    
    // Skip if we're already animating an attack or jump and trying to start a new one
    const isActionAnimation = animation === 'attack' || animation === 'jump' || animation === 'thrust' || animation === 'downAttack';
    
    // Skip if already in action animation
    if (isActionAnimation && isAnimatingRef.current) {
      console.log('Already animating, skipping new animation request');
      return;
    }
    
    // Skip if the animation hasn't changed and isn't an action that should be restartable
    if (animation === animationStateRef.current?.currentAnimation && !isActionAnimation) {
      console.log('Animation unchanged and not restartable, skipping');
      return;
    }
    
    // Set animating flag for action animations
    if (isActionAnimation) {
      isAnimatingRef.current = true;
    }
    
    // Clear any existing animation
    clearAnimations();
    console.log('Cleared existing animations');
    
    // Update the current animation in ref first
    if (animationStateRef.current) {
      animationStateRef.current.currentAnimation = animation;
      animationStateRef.current.animationStartTime = Date.now();
    }
    
    // For attack animations, always start from the beginning
    if (animation === 'attack' || animation === 'thrust' || animation === 'downAttack') {
      console.log('Starting attack animation from beginning');
      setCurrentAnimation(animation);
      setFrame(0);
    } 
    // Special case for jump animation
    else if (animation === 'jump') {
      console.log('Starting jump animation');
      if (animationStateRef.current) {
        animationStateRef.current.isJumping = true;
      }
      setCurrentAnimation('jump');
      setFrame(0);
    }
    // Handle other animations
    else if (!animationStateRef.current?.isJumping) {
      console.log(`Setting animation to ${animation}`);
      setCurrentAnimation(animation);
      setFrame(0);
    }
    
    // Prevent walking animation from taking precedence when action animations are triggered
    if (!isActionAnimation) {
      // Handle walking animation specifically
      if (isWalking && !animationStateRef.current?.isJumping && 
          currentAnimation !== 'walk') {
        console.log('Switching to walk animation due to isWalking');
        setCurrentAnimation('walk');
        setFrame(0);
      } else if (!isWalking && currentAnimation === 'walk') {
        console.log('Switching to idle animation since not walking');
        setCurrentAnimation('idle');
        setFrame(0);
      }
    }
  }, [isWalking, currentAnimation, setCurrentAnimation, setFrame, clearAnimations, animationStateRef]);

  // Run animation frames
  useEffect(() => {
    console.log(`Animation effect triggered: ${currentAnimation}, isWalking: ${isWalking}`);
    
    // Cancel any existing animation
    clearAnimations();
    
    let animationFrameId: number | null = null;
    
    if (currentAnimation === 'walk' && isWalking) {
      console.log('Starting walking animation');
      animationFrameId = updateWalkingFrames(currentAnimation, setFrame, animationStateRef);
      if (animationStateRef.current) {
        animationStateRef.current.animationFrameId = animationFrameId;
      }
    } else if (currentAnimation === 'attack' || currentAnimation === 'thrust' || currentAnimation === 'downAttack') {
      console.log(`Starting attack animation: ${currentAnimation}`);
      animationFrameId = updateAttackFrames(currentAnimation, setFrame, animationStateRef, handleAttackComplete);
      if (animationStateRef.current) {
        animationStateRef.current.animationFrameId = animationFrameId;
      }
    } else if (currentAnimation === 'jump' && animationStateRef.current?.isJumping) {
      console.log('Starting jump animation');
      animationFrameId = updateJumpFrames(setJumpHeight, setCurrentAnimation, animationStateRef, isWalking);
      if (animationStateRef.current) {
        animationStateRef.current.animationFrameId = animationFrameId;
      }
    }
    
    // Cleanup function
    return () => {
      console.log('Cleaning up animation effect');
      
      // Don't clear animating flag here, as we want it to persist across effect cleanups
      // for action animations
      
      clearAnimations();
    };
  }, [
    currentAnimation, 
    isWalking, 
    handleAttackComplete, 
    clearAnimations, 
    setFrame, 
    setCurrentAnimation, 
    setJumpHeight, 
    animationStateRef
  ]);

  return {
    frame,
    currentAnimation,
    jumpHeight,
    updateAnimation
  };
};
