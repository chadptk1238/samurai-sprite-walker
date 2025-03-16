
import { useState, useEffect, useCallback } from 'react';

interface UseInputHandlersProps {
  triggerAnimation: (animType: any) => void;
  animationCooldown: boolean;
  animation: string;
  setIsWalking: (walking: boolean) => void;
}

export function useInputHandlers({
  triggerAnimation,
  animationCooldown,
  animation,
  setIsWalking
}: UseInputHandlersProps) {
  const [keysPressed, setKeysPressed] = useState<Record<string, boolean>>({});

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeysPressed(prev => ({ ...prev, [e.key]: true }));
      
      // Only trigger special animations if not already in cooldown
      if (!animationCooldown) {
        // Handle special animation keys
        if (e.key === 'x' || e.key === 'X') {
          triggerAnimation('attack');
        } else if (e.key === 'z' || e.key === 'Z') {
          triggerAnimation('jump');
        } else if (e.key === 'c' || e.key === 'C') {
          // Toggle crouch on/off
          triggerAnimation(animation === 'crouch' ? 'idle' : 'crouch');
        } else if (e.key === '1') {
          triggerAnimation('middleParry');
        } else if (e.key === '2') {
          triggerAnimation('upParry');
        } else if (e.key === '3') {
          triggerAnimation('downParry');
        } else if (e.key === 't' || e.key === 'T') {
          triggerAnimation('thrust');
        } else if (e.key === 'd' || e.key === 'D') {
          triggerAnimation('downAttack');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed(prev => ({ ...prev, [e.key]: false }));
      
      // Return to idle when movement keys are released
      if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(e.key)) {
        if (!keysPressed['ArrowLeft'] && !keysPressed['ArrowRight'] && 
            !keysPressed['a'] && !keysPressed['d']) {
          setIsWalking(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keysPressed, animationCooldown, triggerAnimation, animation, setIsWalking]);

  // Mobile control handlers
  const handleTouchStart = useCallback((dir: 'left' | 'right') => {
    if (animationCooldown) return;
    
    setKeysPressed(prev => ({ 
      ...prev, 
      [dir === 'left' ? 'ArrowLeft' : 'ArrowRight']: true 
    }));
  }, [animationCooldown]);

  const handleTouchEnd = useCallback((dir: 'left' | 'right') => {
    setKeysPressed(prev => ({ 
      ...prev, 
      [dir === 'left' ? 'ArrowLeft' : 'ArrowRight']: false 
    }));
  }, []);

  // Action button handlers for mobile
  const handleActionButton = useCallback((action: 'attack' | 'jump' | 'parry' | 'thrust' | 'downAttack' | 'crouch') => {
    if (animationCooldown && action !== 'crouch') return;
    
    if (action === 'attack') {
      triggerAnimation('attack');
    } else if (action === 'jump') {
      triggerAnimation('jump');
    } else if (action === 'parry') {
      triggerAnimation('middleParry');
    } else if (action === 'thrust') {
      triggerAnimation('thrust');
    } else if (action === 'downAttack') {
      triggerAnimation('downAttack');
    } else if (action === 'crouch') {
      // Toggle crouch
      triggerAnimation(animation === 'crouch' ? 'idle' : 'crouch');
    }
  }, [triggerAnimation, animationCooldown, animation]);

  return {
    keysPressed,
    handleTouchStart,
    handleTouchEnd,
    handleActionButton
  };
}
