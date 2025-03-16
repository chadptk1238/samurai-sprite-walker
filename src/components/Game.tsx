
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
  const [keysPressed, setKeysPressed] = useState<Record<string, boolean>>({});
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Show welcome toast on initial load
  useEffect(() => {
    toast({
      title: "Samurai Sprite Walker",
      description: `Use ${isMobile ? "the on-screen controls" : "arrow keys"} to move the samurai left and right.`,
      duration: 5000,
    });
  }, [toast, isMobile]);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeysPressed(prev => ({ ...prev, [e.key]: true }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed(prev => ({ ...prev, [e.key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

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

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-2xl relative overflow-hidden rounded-lg shadow-lg mb-4">
        {/* Game area with background */}
        <div 
          className="relative bg-game-bg"
          style={{ 
            width: '100%', 
            height: `${GAME_HEIGHT}px`,
            overflow: 'hidden'
          }}
        >
          {/* Ground */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-game-ground"
            style={{ height: '50px' }}
          ></div>
          
          {/* Samurai character */}
          <Samurai 
            x={position} 
            direction={direction} 
            isWalking={isWalking}
            scale={CHARACTER_SCALE}
          />
        </div>
      </div>
      
      {/* Mobile controls */}
      {isMobile && (
        <div className="mt-4 flex gap-8 justify-center">
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
      )}
      
      {/* Controls info */}
      <div className="mt-4 text-sm text-gray-600">
        {isMobile ? 
          "Use the buttons above to move the samurai" : 
          "Use Arrow Keys or A/D keys to move the samurai"}
      </div>
    </div>
  );
};

export default Game;
