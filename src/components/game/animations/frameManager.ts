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
  const totalFrames = currentAnimData.frames;
  const frameDuration = currentAnimData.duration / totalFrames;
  
  console.log(`Starting attack animation with ${totalFrames} frames and ${frameDuration}ms per frame`);
  
  // Reset frame to 0 at the start of the animation
  setFrame(0);
  
  let frameStartTime = Date.now();
  let currentFrameIndex = 0;
  
  const updateAttackFrame = () => {
    const now = Date.now();
    const elapsedSinceFrameStart = now - frameStartTime;
    
    // If we've spent enough time on the current frame, move to the next one
    if (elapsedSinceFrameStart >= frameDuration) {
      currentFrameIndex++;
      setFrame(currentFrameIndex);
      frameStartTime = now;
      
      console.log(`Attack animation advancing to frame ${currentFrameIndex}`);
      
      // If we've reached the last frame, trigger completion callback after a short delay
      if (currentFrameIndex >= totalFrames - 1) {
        console.log('Attack animation reached last frame, will complete soon');
        setTimeout(() => {
          console.log('Attack animation complete, calling callback');
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        }, frameDuration);
        return 0; // Stop the animation loop
      }
    }
    
    // Continue the animation
    return requestAnimationFrame(updateAttackFrame);
  };
  
  // Start the attack animation
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
