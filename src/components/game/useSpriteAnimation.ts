
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
    console.log('Attack animation completed, returning to', isWalking ? 'walk' : 'idle');
    if (isWalking) {
      setCurrentAnimation('walk');
    } else {
      setCurrentAnimation('idle');
    }
  }, [isWalking, setCurrentAnimation]);

  // Handle animation changes - defined BEFORE the useEffect that uses it
  const updateAnimation = useCallback((animation: AnimationType) => {
    console.log(`updateAnimation called with: ${animation}, current: ${animationStateRef.current.currentAnimation}`);
    
    // If we're already in the requested animation, we can allow re-triggering for attack and jump
    const canRestart = animation === 'attack' || animation === 'jump' || animation === 'thrust' || animation === 'downAttack';
    
    // Skip if the animation hasn't changed and isn't restartable
    if (animation === animationStateRef.current.currentAnimation && !canRestart) {
      console.log('Animation unchanged and not restartable, skipping');
      return;
    }
    
    // Clear any existing animation
    clearAnimations();
    console.log('Cleared existing animations');
    
    // For attack animations, always start from the beginning
    if (animation === 'attack' || animation === 'thrust' || animation === 'downAttack') {
      console.log('Starting attack animation from beginning');
      setCurrentAnimation(animation);
      setFrame(0);
      animationStateRef.current.animationStartTime = Date.now();
    } 
    // Special case for jump animation
    else if (animation === 'jump') {
      console.log('Starting jump animation');
      animationStateRef.current.isJumping = true;
      setCurrentAnimation('jump');
      setFrame(0);
      animationStateRef.current.animationStartTime = Date.now();
    }
    // Handle other animations
    else if (!animationStateRef.current.isJumping) {
      console.log(`Setting animation to ${animation}`);
      setCurrentAnimation(animation);
      setFrame(0);
      animationStateRef.current.animationStartTime = Date.now();
    }
    
    // Update the current animation in ref
    animationStateRef.current.currentAnimation = animation;
    
    // Handle walking animation specifically
    if (isWalking && !animationStateRef.current.isJumping && 
        !['attack', 'thrust', 'downAttack'].includes(animation) && 
        currentAnimation !== 'walk') {
      console.log('Switching to walk animation due to isWalking');
      setCurrentAnimation('walk');
      setFrame(0);
    } else if (!isWalking && currentAnimation === 'walk') {
      console.log('Switching to idle animation since not walking');
      setCurrentAnimation('idle');
      setFrame(0);
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
      animationStateRef.current.animationFrameId = animationFrameId;
    } else if (currentAnimation === 'attack' || currentAnimation === 'thrust' || currentAnimation === 'downAttack') {
      console.log(`Starting attack animation: ${currentAnimation}`);
      animationFrameId = updateAttackFrames(currentAnimation, setFrame, animationStateRef, handleAttackComplete);
      animationStateRef.current.animationFrameId = animationFrameId;
    } else if (currentAnimation === 'jump' && animationStateRef.current.isJumping) {
      console.log('Starting jump animation');
      animationFrameId = updateJumpFrames(setJumpHeight, setCurrentAnimation, animationStateRef, isWalking);
      animationStateRef.current.animationFrameId = animationFrameId;
    }
    
    // Cleanup function
    return () => {
      console.log('Cleaning up animation effect');
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
