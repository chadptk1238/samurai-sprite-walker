
import React, { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/components/ui/use-toast';
import GameArea from './GameArea';
import Controls from './Controls';
import { useAnimationState } from './useAnimationState';
import { useMovement } from './useMovement';
import { useInputHandlers } from './useInputHandlers';

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
  
  // Fix the order - declare movement state first before using it
  const { 
    position, 
    direction, 
    isWalking,
    setIsWalking
  } = useMovement({
    gameWidth: GAME_WIDTH,
    characterScale: CHARACTER_SCALE,
    movementSpeed: MOVEMENT_SPEED,
    animation,
    animationCooldown,
    keysPressed: {} // Initialize with empty object, will update after useInputHandlers
  });
  
  // Input handlers - use setIsWalking after it's declared
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
  
  // Update keysPressed in useMovement
  useEffect(() => {
    // Update the keysPressed in the movement hook
    useMovement({
      gameWidth: GAME_WIDTH,
      characterScale: CHARACTER_SCALE,
      movementSpeed: MOVEMENT_SPEED,
      animation,
      animationCooldown,
      keysPressed
    });
  }, [keysPressed, animation, animationCooldown]);
  
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
