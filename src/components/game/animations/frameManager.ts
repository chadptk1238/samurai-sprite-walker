
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
  animationStateRef: React.RefObject<AnimationState>
): number => {
  const currentAnimData = animations[currentAnimation];
  const frameInterval = currentAnimData.duration / currentAnimData.frames;
  const startTime = animationStateRef.current?.animationStartTime || Date.now();
  
  const updateAttackFrame = (timestamp: number) => {
    const elapsed = Date.now() - startTime;
    const frameIndex = Math.min(
      Math.floor(elapsed / frameInterval),
      currentAnimData.frames - 1
    );
    
    setFrame(frameIndex);
    
    // Only continue the animation if we haven't reached the end
    if (elapsed < currentAnimData.duration) {
      return requestAnimationFrame(updateAttackFrame);
    }
    
    return 0;
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
