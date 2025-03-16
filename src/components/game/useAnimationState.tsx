import { useState, useCallback, useRef } from 'react';

export type AnimationType = 'idle' | 'walk' | 'middleParry' | 'upParry' | 'downParry' | 'attack' | 'thrust' | 'downAttack' | 'death' | 'jump' | 'crouch';

export function useAnimationState() {
  const [animation, setAnimation] = useState<AnimationType>('idle');
  const [animationCooldown, setAnimationCooldown] = useState(false);
  const activeAnimationRef = useRef<NodeJS.Timeout | null>(null);
  
  // Animation cooldown handler
  const triggerAnimation = useCallback((animType: AnimationType) => {
    if (animationCooldown) return;
    
    // Don't trigger new animations if crouching except for standing up
    if (animation === 'crouch' && animType !== 'idle') return;
    
    // Clear any previous timeout
    if (activeAnimationRef.current) {
      clearTimeout(activeAnimationRef.current);
    }
    
    setAnimation(animType);
    setAnimationCooldown(true);
    
    // Set cooldown timer based on animation type
    const cooldownTime = 
      animType === 'attack' ? 600 : // Increased from 500 to 600 to match animation duration
      animType === 'jump' ? 600 : 
      animType === 'thrust' || animType === 'downAttack' ? 400 : 
      animType === 'crouch' ? 200 :
      300;
    
    // Store the timeout reference for potential cancellation
    activeAnimationRef.current = setTimeout(() => {
      setAnimationCooldown(false);
      activeAnimationRef.current = null;
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
