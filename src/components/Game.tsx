
import React, { useState, useEffect, useCallback } from 'react';
import Samurai from './Samurai';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 300;
const MOVEMENT_SPEED = 3;
const CHARACTER_SCALE = 2;

const Game: React.FC = () => {
  const [position, setPosition] = useState(GAME_WIDTH / 2);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isWalking, setIsWalking] = useState(false);
  const [animation, setAnimation] = useState<'idle' | 'walk' | 'middleParry' | 'upParry' | 'downParry' | 'attack' | 'thrust' | 'downAttack' | 'death' | 'jump'>('idle');
  const [keysPressed, setKeysPressed] = useState<Record<string, boolean>>({});
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Show welcome toast on initial load
  useEffect(() => {
    toast({
      title: "Samurai Sprite Walker",
      description: `Use ${isMobile ? "the on-screen controls" : "arrow keys to move, X to attack, Z to jump, 1-3 for parry stances"}.`,
      duration: 5000,
    });
  }, [toast, isMobile]);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeysPressed(prev => ({ ...prev, [e.key]: true }));
      
      // Handle special animation keys
      if (e.key === 'x' || e.key === 'X') {
        setAnimation('attack');
      } else if (e.key === 'z' || e.key === 'Z') {
        setAnimation('jump');
      } else if (e.key === '1') {
        setAnimation('middleParry');
      } else if (e.key === '2') {
        setAnimation('upParry');
      } else if (e.key === '3') {
        setAnimation('downParry');
      } else if (e.key === 't' || e.key === 'T') {
        setAnimation('thrust');
      } else if (e.key === 'd' || e.key === 'D') {
        setAnimation('downAttack');
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
  }, [keysPressed]);

  // Process movement based on pressed keys
  useEffect(() => {
    let animationId: number;
    let walking = false;
    
    const updateGameState = () => {
      setPosition(prevPos => {
        let newPos = prevPos;
        
        if (keysPressed['ArrowLeft'] || keysPressed['a']) {
          newPos = Math.max(16 * CHARACTER_SCALE, prevPos - MOVEMENT_SPEED);
          setDirection('left');
          walking = true;
        } else if (keysPressed['ArrowRight'] || keysPressed['d']) {
          newPos = Math.min(GAME_WIDTH - (16 * CHARACTER_SCALE), prevPos + MOVEMENT_SPEED);
          setDirection('right');
          walking = true;
        } else {
          walking = false;
        }
        
        setIsWalking(walking);
        return newPos;
      });
      
      animationId = requestAnimationFrame(updateGameState);
    };
    
    animationId = requestAnimationFrame(updateGameState);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [keysPressed]);

  // Mobile control handlers
  const handleTouchStart = useCallback((dir: 'left' | 'right') => {
    setKeysPressed(prev => ({ 
      ...prev, 
      [dir === 'left' ? 'ArrowLeft' : 'ArrowRight']: true 
    }));
  }, []);

  const handleTouchEnd = useCallback((dir: 'left' | 'right') => {
    setKeysPressed(prev => ({ 
      ...prev, 
      [dir === 'left' ? 'ArrowLeft' : 'ArrowRight']: false 
    }));
  }, []);

  // Action button handlers for mobile
  const handleActionButton = useCallback((action: 'attack' | 'jump' | 'parry') => {
    if (action === 'attack') {
      setAnimation('attack');
    } else if (action === 'jump') {
      setAnimation('jump');
    } else if (action === 'parry') {
      setAnimation('middleParry');
    }
  }, []);

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
        <p>Arrow keys: Move | X: Attack | Z: Jump</p>
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
          
          {/* Action buttons */}
          <div className="flex gap-4 justify-center mt-2">
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
              className="bg-blue-500 hover:bg-blue-600"
              onTouchStart={() => handleActionButton('parry')}
              onMouseDown={() => handleActionButton('parry')}
            >
              Parry
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
