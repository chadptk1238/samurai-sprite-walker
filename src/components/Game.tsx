
import React, { useState, useEffect, useCallback } from 'react';
import Samurai from './Samurai';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 300;
const MOVEMENT_SPEED = 3;
const CHARACTER_SCALE = 2;

type AnimationType = 'idle' | 'walk' | 'middleParry' | 'upParry' | 'downParry' | 'attack' | 'thrust' | 'downAttack' | 'death' | 'jump' | 'crouch';

const Game: React.FC = () => {
  const [position, setPosition] = useState(GAME_WIDTH / 2);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isWalking, setIsWalking] = useState(false);
  const [animation, setAnimation] = useState<AnimationType>('idle');
  const [keysPressed, setKeysPressed] = useState<Record<string, boolean>>({});
  const [animationCooldown, setAnimationCooldown] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Show welcome toast on initial load
  useEffect(() => {
    toast({
      title: "Samurai Sprite Walker",
      description: `Use ${isMobile ? "the on-screen controls" : "arrow keys to move, X to attack, Z to jump, C to crouch, 1-3 for parry stances"}.`,
      duration: 5000,
    });
  }, [toast, isMobile]);

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
  }, [keysPressed, animationCooldown, triggerAnimation, animation]);

  // Process movement based on pressed keys
  useEffect(() => {
    let animationId: number;
    let walking = false;
    
    const updateGameState = () => {
      // Don't allow movement during certain animations
      const canMove = animation !== 'crouch';
      
      setPosition(prevPos => {
        let newPos = prevPos;
        
        if ((keysPressed['ArrowLeft'] || keysPressed['a']) && 
            canMove && !animationCooldown) {
          newPos = Math.max(16 * CHARACTER_SCALE, prevPos - MOVEMENT_SPEED);
          // Only change direction when actually moving
          setDirection('left');
          walking = true;
        } else if ((keysPressed['ArrowRight'] || keysPressed['d']) && 
                  canMove && !animationCooldown) {
          newPos = Math.min(GAME_WIDTH - (16 * CHARACTER_SCALE), prevPos + MOVEMENT_SPEED);
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
  }, [keysPressed, animationCooldown, animation]);

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
    if (animationCooldown) return;
    
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

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-2xl relative overflow-hidden rounded-lg shadow-lg mb-4">
        {/* Game area with background */}
        <div 
          className="relative"
          style={{ 
            width: '100%', 
            height: `${GAME_HEIGHT}px`,
            backgroundImage: 'linear-gradient(to bottom, #87CEEB, #ADD8E6)',
            overflow: 'hidden'
          }}
        >
          {/* Ground */}
          <div 
            className="absolute bottom-0 left-0 right-0"
            style={{ 
              height: '50px',
              backgroundColor: '#8B4513'
            }}
          ></div>
          
          {/* Samurai character */}
          <Samurai 
            x={position} 
            direction={direction} 
            isWalking={isWalking}
            scale={CHARACTER_SCALE}
            animation={animation}
          />
        </div>
      </div>
      
      {/* Control instructions */}
      <div className="mb-4 text-sm text-center">
        <p className="font-semibold text-indigo-700">Keyboard Controls:</p>
        <p>Arrow keys: Move | X: Attack | Z: Jump | C: Crouch</p>
        <p>1-3: Parry Stances | T: Thrust | D: Down Attack</p>
      </div>
      
      {/* Mobile controls */}
      {isMobile && (
        <div className="mt-4 flex flex-col gap-4 items-center">
          {/* Movement buttons */}
          <div className="flex gap-8 justify-center">
            <Button
              variant="outline"
              size="lg"
              className="h-16 w-16 rounded-full text-2xl"
              onTouchStart={() => handleTouchStart('left')}
              onTouchEnd={() => handleTouchEnd('left')}
              onMouseDown={() => handleTouchStart('left')}
              onMouseUp={() => handleTouchEnd('left')}
              onMouseLeave={() => handleTouchEnd('left')}
            >
              ←
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-16 w-16 rounded-full text-2xl"
              onTouchStart={() => handleTouchStart('right')}
              onTouchEnd={() => handleTouchEnd('right')}
              onMouseDown={() => handleTouchStart('right')}
              onMouseUp={() => handleTouchEnd('right')}
              onMouseLeave={() => handleTouchEnd('right')}
            >
              →
            </Button>
          </div>
          
          {/* Action buttons - Two rows for better organization */}
          <div className="flex flex-col gap-2 items-center">
            <div className="flex gap-4 justify-center">
              <Button
                variant="default"
                size="lg"
                className="bg-red-500 hover:bg-red-600"
                onTouchStart={() => handleActionButton('attack')}
                onMouseDown={() => handleActionButton('attack')}
              >
                Attack
              </Button>
              <Button
                variant="default"
                size="lg"
                className="bg-green-500 hover:bg-green-600"
                onTouchStart={() => handleActionButton('jump')}
                onMouseDown={() => handleActionButton('jump')}
              >
                Jump
              </Button>
              <Button
                variant="default"
                size="lg"
                className="bg-amber-500 hover:bg-amber-600"
                onTouchStart={() => handleActionButton('crouch')}
                onMouseDown={() => handleActionButton('crouch')}
              >
                Crouch
              </Button>
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                variant="default"
                size="sm"
                className="bg-blue-500 hover:bg-blue-600"
                onTouchStart={() => handleActionButton('parry')}
                onMouseDown={() => handleActionButton('parry')}
              >
                Parry
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-yellow-500 hover:bg-yellow-600"
                onTouchStart={() => handleActionButton('thrust')}
                onMouseDown={() => handleActionButton('thrust')}
              >
                Thrust
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-purple-500 hover:bg-purple-600"
                onTouchStart={() => handleActionButton('downAttack')}
                onMouseDown={() => handleActionButton('downAttack')}
              >
                Down
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
