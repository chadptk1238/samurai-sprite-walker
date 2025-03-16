import { useState, useCallback } from 'react';
import { animations } from './animationUtils';

export type AnimationType = 'idle' | 'walk' | 'middleParry' | 'upParry' | 'downParry' | 'attack' | 'thrust' | 'downAttack' | 'death' | 'jump' | 'crouch';

export function useAnimationState() {
  const [animation, setAnimation] = useState<AnimationType>('idle');
  const [animationCooldown, setAnimationCooldown] = useState(false);
  
  // Animation cooldown handler
  const triggerAnimation = useCallback((animType: AnimationType) => {
    if (animationCooldown) {
      console.log(`Animation cooldown active, skipping ${animType}`);
      return;
    }
    
    // Don't trigger new animations if crouching except for standing up
    if (animation === 'crouch' && animType !== 'idle') return;
    
    console.log(`Triggering animation: ${animType}`);
    setAnimation(animType);
    setAnimationCooldown(true);
    
    // Use the actual animation duration from our config
    const animDuration = animations[animType]?.duration || 500;
    // Add a small buffer to ensure animation completes
    const cooldownTime = animDuration + 100;
    
    console.log(`Setting cooldown for ${cooldownTime}ms`);
    
    setTimeout(() => {
      console.log(`Cooldown for ${animType} ended`);
      setAnimationCooldown(false);
    }, cooldownTime);
  }, [animationCooldown, animation]);

  return {
    animation,
    setAnimation,
    animationCooldown,
    setAnimationCooldown,
    triggerAnimation
  };
}
