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
    
    if (animationStateRef.current?.animationFrameId) {
      return requestAnimationFrame(updateFrame);
    }
    return 0;
  };
  
  const frameId = requestAnimationFrame(updateFrame);
  if (animationStateRef.current) {
    animationStateRef.current.animationFrameId = frameId;
  }
  return frameId;
};

// Helper function to handle frame updates for attack animations
export const updateAttackFrames = (
  currentAnimation: AnimationType,
  setFrame: React.Dispatch<React.SetStateAction<number>>,
  animationStateRef: React.RefObject<AnimationState>,
  onAnimationComplete?: () => void
): number => {
  // Cancel any ongoing animations first
  if (animationStateRef.current?.animationFrameId) {
    cancelAnimationFrame(animationStateRef.current.animationFrameId);
    animationStateRef.current.animationFrameId = null;
  }

  const currentAnimData = animations[currentAnimation];
  const totalFrames = currentAnimData.frames;
  const frameDuration = currentAnimData.duration / totalFrames;
  
  console.log(`Starting attack animation with ${totalFrames} frames and ${frameDuration}ms per frame`);
  
  // Reset frame to 0 at the start of the animation
  setFrame(0);
  
  // Track the animation progress with these variables
  let startTime = performance.now();
  let lastFrameTime = performance.now();
  let currentFrameIndex = 0;
  let animationRunning = true;
  
  const updateAttackFrame = (timestamp: number) => {
    if (!animationRunning) return;
    
    const now = timestamp;
    const elapsedSinceFrameStart = now - lastFrameTime;
    
    // Check if we've spent enough time on the current frame
    if (elapsedSinceFrameStart >= frameDuration) {
      // Increment the frame index
      currentFrameIndex++;
      lastFrameTime = now;
      
      console.log(`Attack animation advancing to frame ${currentFrameIndex} of ${totalFrames}`);
      
      // If we've gone through all frames, finish the animation
      if (currentFrameIndex >= totalFrames) {
        console.log('Attack animation complete, calling callback');
        
        animationRunning = false;
        
        if (animationStateRef.current) {
          animationStateRef.current.animationFrameId = null;
        }
        
        if (onAnimationComplete) {
          onAnimationComplete();
        }
        
        return;
      }
      
      // Update the frame display
      setFrame(currentFrameIndex);
    }
    
    // Continue the animation loop
    if (animationRunning) {
      const nextFrameId = requestAnimationFrame(updateAttackFrame);
      if (animationStateRef.current) {
        animationStateRef.current.animationFrameId = nextFrameId;
      }
    }
  };
  
  // Start the animation
  const frameId = requestAnimationFrame(updateAttackFrame);
  if (animationStateRef.current) {
    animationStateRef.current.animationFrameId = frameId;
  }
  
  return frameId;
};

// Helper function to handle frame updates for jump animation
export const updateJumpFrames = (
  setJumpHeight: React.Dispatch<React.SetStateAction<number>>,
  setCurrentAnimation: React.Dispatch<React.SetStateAction<AnimationType>>,
  animationStateRef: React.RefObject<AnimationState>,
  isWalking: boolean
): number => {
  // Cancel any ongoing animations first
  if (animationStateRef.current?.animationFrameId) {
    cancelAnimationFrame(animationStateRef.current.animationFrameId);
    animationStateRef.current.animationFrameId = null;
  }

  const jumpStartTime = performance.now();
  const jumpDuration = animations.jump.duration;
  const maxJumpHeight = 50; // pixels
  
  const updateJump = (timestamp: number) => {
    const elapsed = timestamp - jumpStartTime;
    const progress = Math.min(elapsed / jumpDuration, 1);
    
    // Parabolic jump curve (0 at start, 0 at end, max height in middle)
    const jumpCurve = Math.sin(progress * Math.PI);
    const newHeight = maxJumpHeight * jumpCurve;
    
    setJumpHeight(newHeight);
    
    if (progress < 1) {
      const nextFrameId = requestAnimationFrame(updateJump);
      if (animationStateRef.current) {
        animationStateRef.current.animationFrameId = nextFrameId;
      }
      return nextFrameId;
    } else {
      // End jump animation
      if (animationStateRef.current) {
        animationStateRef.current.isJumping = false;
        animationStateRef.current.animationFrameId = null;
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
  
  const frameId = requestAnimationFrame(updateJump);
  if (animationStateRef.current) {
    animationStateRef.current.animationFrameId = frameId;
  }
  return frameId;
};
