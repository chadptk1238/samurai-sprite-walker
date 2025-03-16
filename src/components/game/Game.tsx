
import React, { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/components/ui/use-toast';
import GameArea from './GameArea';
import Controls from './Controls';
import { useAnimationState } from './useAnimationState';
import { useInputHandlers } from './useInputHandlers';
import { useMovement } from './useMovement';

// Game constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 300;
const MOVEMENT_SPEED = 3;
const CHARACTER_SCALE = 2;

const Game: React.FC = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Animation state
  const { 
    animation, 
    animationCooldown, 
    triggerAnimation 
  } = useAnimationState();
  
  // Movement state
  const { 
    position, 
    direction, 
    isWalking,
    setIsWalking
  } = useMovement({
    gameWidth: GAME_WIDTH,
    characterScale: CHARACTER_SCALE,
    movementSpeed: MOVEMENT_SPEED,
    keysPressed: useInputHandlers({
      triggerAnimation,
      animationCooldown,
      animation,
      setIsWalking
    }).keysPressed,
    animation,
    animationCooldown
  });
  
  // Input handlers
  const { 
    keysPressed, 
    handleTouchStart, 
    handleTouchEnd, 
    handleActionButton 
  } = useInputHandlers({
    triggerAnimation,
    animationCooldown,
    animation,
    setIsWalking
  });
  
  // Show welcome toast on initial load
  useEffect(() => {
    toast({
      title: "Samurai Sprite Walker",
      description: `Use ${isMobile ? "the on-screen controls" : "arrow keys to move, X to attack, Z to jump, C to crouch, 1-3 for parry stances"}.`,
      duration: 5000,
    });
  }, [toast, isMobile]);

  return (
    <div className="flex flex-col items-center w-full">
      <GameArea 
        position={position}
        direction={direction}
        isWalking={isWalking}
        animation={animation}
        gameHeight={GAME_HEIGHT}
        characterScale={CHARACTER_SCALE}
      />
      
      <Controls 
        isMobile={isMobile}
        handleTouchStart={handleTouchStart}
        handleTouchEnd={handleTouchEnd}
        handleActionButton={handleActionButton}
        animationCooldown={animationCooldown}
      />
    </div>
  );
};

export default Game;
