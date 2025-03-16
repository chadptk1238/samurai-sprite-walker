
import React from 'react';
import Samurai from '../Samurai';
import { AnimationType } from './useAnimationState';

interface GameAreaProps {
  position: number;
  direction: 'left' | 'right';
  isWalking: boolean;
  animation: AnimationType;
  gameHeight: number;
  characterScale: number;
}

const GameArea: React.FC<GameAreaProps> = ({ 
  position, 
  direction, 
  isWalking, 
  animation,
  gameHeight,
  characterScale
}) => {
  return (
    <div className="w-full max-w-2xl relative overflow-hidden rounded-lg shadow-lg mb-4">
      {/* Game area with background */}
      <div 
        className="relative"
        style={{ 
          width: '100%', 
          height: `${gameHeight}px`,
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
          scale={characterScale}
          animation={animation}
        />
      </div>
    </div>
  );
};

export default GameArea;
