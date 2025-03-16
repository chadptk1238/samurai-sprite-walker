import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimationType } from './useAnimationState';
import { animations, calculateFrame, isAnimationComplete, getBackgroundPosition } from './animationUtils';
import { SpriteAnimationResult } from './types/animationTypes';

export const useSpriteAnimation = (
  initialAnimation: AnimationType = 'idle',
  isWalking: boolean
): SpriteAnimationResult => {
  // State for tracking animation
  const [currentAnimation, setCurrentAnimation] = useState<AnimationType>(initialAnimation);
  const [frame, setFrame] = useState(0);
  const [jumpHeight, setJumpHeight] = useState(0);
  
  // Animation tracking refs
  const animStartTimeRef = useRef<number>(Date.now());
  const requestIdRef = useRef<number | null>(null);
  const isActionAnimationRef = useRef<boolean>(false);
  
  // Clean up animation frame
  const cleanupAnimation = useCallback(() => {
    if (requestIdRef.current) {
      cancelAnimationFrame(requestIdRef.current);
      requestIdRef.current = null;
    }
  }, []);
  
  // Update the animation
  const updateAnimation = useCallback((animation: AnimationType) => {
    // Is this an action animation?
    const isActionAnim = ['attack', 'jump', 'thrust', 'downAttack'].includes(animation);
    
    // Don't interrupt action animations in progress
    if (isActionAnimationRef.current && isActionAnim) {
      return;
    }
    
    // Clean up existing animation
    cleanupAnimation();
    
    // Set new animation
    setCurrentAnimation(animation);
    animStartTimeRef.current = Date.now();
    
    // Track if this is an action animation
    isActionAnimationRef.current = isActionAnim;
    
    // Reset jump height if this is a jump
    if (animation === 'jump') {
      setJumpHeight(0);
    }
  }, [cleanupAnimation]);
  
  // Animation loop
  useEffect(() => {
    // Ensure walking animation is set if walking
    if (isWalking && !isActionAnimationRef.current && currentAnimation !== 'walk') {
      setCurrentAnimation('walk');
      animStartTimeRef.current = Date.now();
    }
    
    // Or idle if not walking and no action animation
    if (!isWalking && !isActionAnimationRef.current && currentAnimation !== 'idle') {
      setCurrentAnimation('idle');
    }
    
    // Main animation loop
    const animate = () => {
      // Calculate current frame based on time
      const newFrame = calculateFrame(currentAnimation, animStartTimeRef.current);
      setFrame(newFrame);
      
      // Handle jump animation
      if (currentAnimation === 'jump') {
        const jumpData = animations.jump;
        const elapsed = Date.now() - animStartTimeRef.current;
        const progress = Math.min(elapsed / jumpData.duration, 1);
        const jumpCurve = Math.sin(progress * Math.PI);
        setJumpHeight(50 * jumpCurve); // 50 is max height
      }
      
      // Check if action animation is complete
      if (isActionAnimationRef.current && isAnimationComplete(currentAnimation, animStartTimeRef.current)) {
        isActionAnimationRef.current = false;
        
        // Reset to appropriate animation
        if (isWalking) {
          setCurrentAnimation('walk');
        } else {
          setCurrentAnimation('idle');
        }
        
        animStartTimeRef.current = Date.now();
        
        // Reset jump height if needed
        if (currentAnimation === 'jump') {
          setJumpHeight(0);
        }
      }
      
      // Continue animation loop
      requestIdRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation loop
    requestIdRef.current = requestAnimationFrame(animate);
    
    // Cleanup function
    return () => {
      cleanupAnimation();
    };
  }, [currentAnimation, isWalking, cleanupAnimation]);
  
  return {
    frame,
    currentAnimation,
    jumpHeight,
    updateAnimation
  };
};
