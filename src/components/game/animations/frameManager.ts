
import { animations } from '../animationUtils';
import { AnimationType } from '../useAnimationState';
import { AnimationState } from '../types/animationTypes';

// Helper function to handle frame updates for walking animation
export const updateWalkingFrames = (
  currentAnimation: AnimationType,
  setFrame: React.Dispatch<React.SetStateAction<number>>,
  animationStateRef: React.RefObject<AnimationState>
): number => {
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
    
    return requestAnimationFrame(updateFrame);
  };
  
  return requestAnimationFrame(updateFrame);
};

// Helper function to handle frame updates for attack animations
export const updateAttackFrames = (
  currentAnimation: AnimationType,
  setFrame: React.Dispatch<React.SetStateAction<number>>,
  animationStateRef: React.RefObject<AnimationState>,
  onAnimationComplete?: () => void
): number => {
  const currentAnimData = animations[currentAnimation];
  const frameInterval = currentAnimData.duration / currentAnimData.frames;
  
  // Reset frame to 0 at the start of the animation
  setFrame(0);
  
  let frameCount = 0;
  let lastFrameTime = 0;
  
  const updateAttackFrame = (timestamp: number) => {
    if (!lastFrameTime) lastFrameTime = timestamp;
    
    const elapsed = timestamp - lastFrameTime;
    
    if (elapsed > frameInterval) {
      // Increment frame count
      frameCount++;
      
      // Update the visible frame
      const newFrame = Math.min(frameCount, currentAnimData.frames - 1);
      setFrame(newFrame);
      
      lastFrameTime = timestamp;
      
      // Check if we've completed all frames
      if (frameCount >= currentAnimData.frames) {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
        return 0; // Stop the animation
      }
    }
    
    return requestAnimationFrame(updateAttackFrame);
  };
  
  return requestAnimationFrame(updateAttackFrame);
};

// Helper function to handle frame updates for jump animation
export const updateJumpFrames = (
  setJumpHeight: React.Dispatch<React.SetStateAction<number>>,
  setCurrentAnimation: React.Dispatch<React.SetStateAction<AnimationType>>,
  animationStateRef: React.RefObject<AnimationState>,
  isWalking: boolean
): number => {
  const jumpStartTime = animationStateRef.current?.animationStartTime || Date.now();
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
      return requestAnimationFrame(updateJump);
    } else {
      // End jump animation
      if (animationStateRef.current) {
        animationStateRef.current.isJumping = false;
      }
      setJumpHeight(0);
      
      // Return to appropriate animation
      if (isWalking) {
        setCurrentAnimation('walk');
      } else {
        setCurrentAnimation('idle');
      }
      
      return 0;
    }
  };
  
  return requestAnimationFrame(updateJump);
};
