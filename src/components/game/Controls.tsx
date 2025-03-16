
import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface ControlsProps {
  isMobile: boolean;
  handleTouchStart: (dir: 'left' | 'right') => void;
  handleTouchEnd: (dir: 'left' | 'right') => void;
  handleActionButton: (action: 'attack' | 'jump' | 'parry' | 'thrust' | 'downAttack' | 'crouch') => void;
  animationCooldown: boolean;
}

const Controls: React.FC<ControlsProps> = ({ 
  isMobile, 
  handleTouchStart, 
  handleTouchEnd, 
  handleActionButton,
  animationCooldown
}) => {
  if (!isMobile) {
    return (
      <div className="mb-4 text-sm text-center">
        <p className="font-semibold text-indigo-700">Keyboard Controls:</p>
        <p>Arrow keys: Move | X: Attack | Z: Jump | C: Crouch</p>
        <p>1-3: Parry Stances | T: Thrust | D: Down Attack</p>
      </div>
    );
  }
  
  return (
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
          disabled={animationCooldown}
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
          disabled={animationCooldown}
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
            disabled={animationCooldown}
          >
            Attack
          </Button>
          <Button
            variant="default"
            size="lg"
            className="bg-green-500 hover:bg-green-600"
            onTouchStart={() => handleActionButton('jump')}
            onMouseDown={() => handleActionButton('jump')}
            disabled={animationCooldown}
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
            disabled={animationCooldown}
          >
            Parry
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-yellow-500 hover:bg-yellow-600"
            onTouchStart={() => handleActionButton('thrust')}
            onMouseDown={() => handleActionButton('thrust')}
            disabled={animationCooldown}
          >
            Thrust
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-purple-500 hover:bg-purple-600"
            onTouchStart={() => handleActionButton('downAttack')}
            onMouseDown={() => handleActionButton('downAttack')}
            disabled={animationCooldown}
          >
            Down
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Controls;
