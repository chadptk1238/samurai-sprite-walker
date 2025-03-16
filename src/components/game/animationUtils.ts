
// Animation type definitions
import { AnimationType } from './useAnimationState';

// Sprite sheet position mapping for animations
export const animations = {
  idle: { row: 0, frames: 1, startFrame: 0, duration: 0 },
  walk: { row: 0, frames: 4, startFrame: 0, duration: 600 },
  middleParry: { row: 1, frames: 1, startFrame: 0, duration: 400 },
  upParry: { row: 1, frames: 1, startFrame: 1, duration: 400 },
  downParry: { row: 1, frames: 1, startFrame: 2, duration: 400 },
  attack: { row: 2, frames: 2, startFrame: 0, duration: 300 }, // Ensure we have 2 frames for attack
  thrust: { row: 3, frames: 1, startFrame: 0, duration: 400 },
  downAttack: { row: 3, frames: 1, startFrame: 1, duration: 400 },
  death: { row: 4, frames: 1, startFrame: 0, duration: 0 },
  crouch: { row: 4, frames: 1, startFrame: 0, duration: 0 },
  jump: { row: 5, frames: 1, startFrame: 0, duration: 500 },
};

// Helper for calculating background position
export const getBackgroundPosition = (currentAnimation: AnimationType, frame: number) => {
  const animData = animations[currentAnimation];
  const frameIndex = animData.startFrame + frame;
  const x = frameIndex * 32; // Each frame is 32px wide
  const y = animData.row * 32; // Each row is 32px tall
  return `-${x}px -${y}px`;
};
