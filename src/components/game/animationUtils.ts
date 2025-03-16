// Animation type definitions
import { AnimationType } from './useAnimationState';

// Sprite sheet position mapping for animations
export const animations = {
  idle: { row: 0, frames: 1, startFrame: 0, duration: 0 },
  walk: { row: 0, frames: 4, startFrame: 0, duration: 600 },
  middleParry: { row: 1, frames: 1, startFrame: 0, duration: 400 },
  upParry: { row: 1, frames: 1, startFrame: 1, duration: 400 },
  downParry: { row: 1, frames: 1, startFrame: 2, duration: 400 },
  attack: { row: 2, frames: 4, startFrame: 0, duration: 800 }, // Increased duration
  thrust: { row: 3, frames: 1, startFrame: 0, duration: 400 },
  downAttack: { row: 3, frames: 1, startFrame: 1, duration: 400 },
  death: { row: 4, frames: 1, startFrame: 0, duration: 0 },
  crouch: { row: 4, frames: 1, startFrame: 0, duration: 0 },
  jump: { row: 5, frames: 1, startFrame: 0, duration: 500 },
};

// Helper for calculating background position
export const getBackgroundPosition = (currentAnimation: AnimationType, frame: number) => {
  const animData = animations[currentAnimation];
  
  // If animation data doesn't exist, default to idle
  if (!animData) {
    console.error(`Animation data for ${currentAnimation} not found!`);
    return '0px 0px';
  }
  
  const frameIndex = animData.startFrame + frame;
  const x = frameIndex * 32; // Each frame is 32px wide
  const y = animData.row * 32; // Each row is 32px tall
  
  return `-${x}px -${y}px`;
};

// Calculate the current frame based on time elapsed
export const calculateFrame = (
  animation: AnimationType,
  startTime: number
): number => {
  const animData = animations[animation];
  
  // If animation has only one frame or no duration, it's static
  if (animData.frames <= 1 || animData.duration <= 0) {
    return 0;
  }
  
  const elapsed = Date.now() - startTime;
  const frameDuration = animData.duration / animData.frames;
  
  // Calculate which frame we should be on based on elapsed time
  const frame = Math.floor((elapsed % animData.duration) / frameDuration);
  
  // Ensure frame is within bounds
  return Math.min(frame, animData.frames - 1);
};

// Determine if an animation should be considered complete
export const isAnimationComplete = (
  animation: AnimationType,
  startTime: number
): boolean => {
  const animData = animations[animation];
  
  // If animation has no duration, it's never complete
  if (animData.duration <= 0) {
    return false;
  }
  
  const elapsed = Date.now() - startTime;
  return elapsed >= animData.duration;
};
