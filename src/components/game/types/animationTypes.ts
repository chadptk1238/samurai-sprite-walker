import { AnimationType } from '../useAnimationState';

export interface AnimationState {
  isJumping: boolean;
  currentAnimation: AnimationType;
  animationTimer: number | null;
  animationFrameId: number | null;
  animationStartTime: number;
}

export interface SpriteAnimationResult {
  frame: number;
  currentAnimation: AnimationType;
  jumpHeight: number;
  updateAnimation: (animation: AnimationType) => void;
}
