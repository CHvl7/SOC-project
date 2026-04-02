import React, { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20; 
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const BASE_SPEED = 80;

type Point = { x: number; y: number };

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 15, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const directionRef = useRef(direction);
  const lastMoveDirectionRef = useRef(direction);
  
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    lastMoveDirectionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setGameOver(false);
    setFood(generateFood(INITIAL_SNAKE));
    setHasStarted(true);
    setIsPaused(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' && hasStarted) {
        setIsPaused(p => !p);
        return;
      }

      if (!hasStarted && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        setHasStarted(true);
      }

      const { x, y } = lastMoveDirectionRef.current;
      switch (e.key) {
        case 'ArrowUp':
          if (y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, hasStarted]);

  useEffect(() => {
    if (gameOver || isPaused || !hasStarted) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const currentDir = directionRef.current;
        lastMoveDirectionRef.current = currentDir;
        
        const newHead = {
          x: head.x + currentDir.x,
          y: head.y + currentDir.y,
        };

        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const speed = Math.max(30, BASE_SPEED - Math.floor(score / 50) * 3);
    const intervalId = setInterval(moveSnake, speed);

    return () => clearInterval(intervalId);
  }, [food, gameOver, isPaused, hasStarted, score, generateFood]);

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-lg z-20">
      <div className="flex justify-between w-full px-2 font-arcade text-3xl text-[#0ff] border-b-4 border-[#f0f] pb-2 mb-2 bg-black/90">
        <span className="glitch" data-text={`FRAGMENTS: ${score.toString().padStart(4, '0')}`}>FRAGMENTS: {score.toString().padStart(4, '0')}</span>
        <span className="glitch" data-text={isPaused ? 'SYS_HALTED' : 'SYS_ACTIVE'}>{isPaused ? 'SYS_HALTED' : 'SYS_ACTIVE'}</span>
      </div>

      <div 
        className="relative bg-black border-4 border-[#0ff] overflow-hidden"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
          boxShadow: '0 0 20px #0ff, inset 0 0 20px #f0f'
        }}
      >
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-20" 
             style={{
               backgroundImage: `linear-gradient(to right, #0ff 1px, transparent 1px), linear-gradient(to bottom, #0ff 1px, transparent 1px)`,
               backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`
             }} 
        />

        {/* Food */}
        <div
          className="absolute bg-[#f0f] tear-effect"
          style={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            boxShadow: '0 0 15px #f0f'
          }}
        />

        {/* Snake */}
        {snake.map((segment, index) => {
          const isHead = index === 0;
          return (
            <div
              key={`${segment.x}-${segment.y}-${index}`}
              className={`absolute ${isHead ? 'bg-[#fff]' : 'bg-[#0ff]'}`}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                left: segment.x * CELL_SIZE,
                top: segment.y * CELL_SIZE,
                opacity: isHead ? 1 : Math.max(0.2, 1 - (index / snake.length)),
                boxShadow: isHead ? '0 0 15px #fff' : 'none'
              }}
            />
          );
        })}

        {!hasStarted && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
            <button 
              onClick={() => setHasStarted(true)}
              className="px-4 py-2 bg-black border-2 border-[#0ff] text-[#0ff] font-arcade text-3xl hover:bg-[#0ff] hover:text-black transition-none uppercase tracking-widest cursor-pointer glitch"
              data-text="[ EXECUTE_SEQUENCE ]"
            >
              [ EXECUTE_SEQUENCE ]
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 border-4 border-[#f0f] tear-effect">
            <h2 className="text-4xl font-arcade text-[#f0f] mb-2 glitch" data-text="FATAL_EXCEPTION">FATAL_EXCEPTION</h2>
            <p className="text-[#0ff] font-arcade text-2xl mb-6">DATA_LOST: {score}</p>
            <button 
              onClick={resetGame}
              className="px-4 py-2 bg-black border-2 border-[#f0f] text-[#f0f] font-arcade text-3xl hover:bg-[#f0f] hover:text-black transition-none uppercase tracking-widest cursor-pointer"
            >
              [ FORCE_REBOOT ]
            </button>
          </div>
        )}
      </div>
      
      <div className="text-[#f0f] font-arcade text-xl mt-2 bg-black/90 px-4 py-1 border border-[#0ff]">
        INPUT: ARROWS | INTERRUPT: SPACE
      </div>
    </div>
  );
}
