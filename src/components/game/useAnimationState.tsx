
import { useState, useCallback } from 'react';

type AnimationType = 'idle' | 'walk' | 'middleParry' | 'upParry' | 'downParry' | 'attack' | 'thrust' | 'downAttack' | 'death' | 'jump' | 'crouch';

export function useAnimationState() {
  const [animation, setAnimation] = useState<AnimationType>('idle');
  const [animationCooldown, setAnimationCooldown] = useState(false);
  
  // Animation cooldown handler
  const triggerAnimation = useCallback((animType: AnimationType) => {
    if (animationCooldown) return;
    
    // Don't trigger new animations if crouching except for standing up
    if (animation === 'crouch' && animType !== 'idle') return;
    
    setAnimation(animType);
    setAnimationCooldown(true);
    
    // Set cooldown timer based on animation type
    const cooldownTime = 
      animType === 'attack' ? 500 : 
      animType === 'jump' ? 600 : 
      animType === 'thrust' || animType === 'downAttack' ? 400 : 
      animType === 'crouch' ? 200 :
      300;
    
    setTimeout(() => {
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
