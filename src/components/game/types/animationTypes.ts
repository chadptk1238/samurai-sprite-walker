import { AnimationType } from '../useAnimationState';

export interface AnimationState {
  isAnimating: boolean;
  currentAnimation: AnimationType;
  animationStartTime: number;
}

export interface SpriteAnimationResult {
  frame: number;
  currentAnimation: AnimationType;
  jumpHeight: number;
  updateAnimation: (animation: AnimationType) => void;
}
