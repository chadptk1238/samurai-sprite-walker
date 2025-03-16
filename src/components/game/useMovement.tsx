
import { useState, useEffect, useRef } from 'react';
import { AnimationType } from './useAnimationState';

interface UseMovementProps {
  gameWidth: number;
  characterScale: number;
  movementSpeed: number;
  keysPressed: Record<string, boolean>;
  animation: AnimationType;
  animationCooldown: boolean;
}

export function useMovement({
  gameWidth,
  characterScale,
  movementSpeed,
  keysPressed,
  animation,
  animationCooldown
}: UseMovementProps) {
  const [position, setPosition] = useState(gameWidth / 2);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isWalking, setIsWalking] = useState(false);
  
  // Use ref to track current keysPressed
  const keysPressedRef = useRef(keysPressed);
  keysPressedRef.current = keysPressed;

  // Process movement based on pressed keys
  useEffect(() => {
    let animationId: number;
    let walking = false;
    
    const updateGameState = () => {
      // Don't allow movement during certain animations
      const canMove = animation !== 'crouch';
      
      setPosition(prevPos => {
        let newPos = prevPos;
        const currentKeysPressed = keysPressedRef.current;
        
        if ((currentKeysPressed['ArrowLeft'] || currentKeysPressed['a']) && 
            canMove && !animationCooldown) {
          newPos = Math.max(16 * characterScale, prevPos - movementSpeed);
          // Only change direction when actually moving
          setDirection('left');
          walking = true;
        } else if ((currentKeysPressed['ArrowRight'] || currentKeysPressed['d']) && 
                  canMove && !animationCooldown) {
          newPos = Math.min(gameWidth - (16 * characterScale), prevPos + movementSpeed);
          // Only change direction when actually moving
          setDirection('right');
          walking = true;
        } else {
          walking = false;
        }
        
        // Only set walking if not in a special animation
        if (canMove) {
          setIsWalking(walking);
        } else {
          setIsWalking(false);
        }
        
        return newPos;
      });
      
      animationId = requestAnimationFrame(updateGameState);
    };
    
    animationId = requestAnimationFrame(updateGameState);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [animation, animationCooldown, gameWidth, characterScale, movementSpeed]);

  return {
    position,
    setPosition,
    direction,
    setDirection,
    isWalking,
    setIsWalking
  };
}
