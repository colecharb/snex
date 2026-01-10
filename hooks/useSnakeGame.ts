import { useState, useEffect, useCallback, useRef } from 'react';
import {
  HexCoord,
  HexDirection,
  generateHexagonalGrid,
  getNeighbor,
  hexEqual,
  hexToKey,
  isInGrid,
  turnLeft,
  turnRight,
} from '@/lib/hexGrid';

export interface GameState {
  snake: HexCoord[];
  direction: HexDirection;
  food: HexCoord | null;
  score: number;
  gameOver: boolean;
  isPaused: boolean;
  gridRadius: number;
  allCells: HexCoord[];
}

export function useSnakeGame(gridRadius: number = 11) {
  const [snake, setSnake] = useState<HexCoord[]>([{ q: 0, r: 0 }]);
  const [direction, setDirection] = useState<HexDirection>(HexDirection.East);
  const [food, setFood] = useState<HexCoord | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [allCells] = useState<HexCoord[]>(() => generateHexagonalGrid(gridRadius));

  const directionRef = useRef(direction);
  const pendingTurnRef = useRef<'left' | 'right' | null>(null);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  // Initialize food
  useEffect(() => {
    if (!food) {
      spawnFood();
    }
  }, []);

  const spawnFood = useCallback(() => {
    const snakeSet = new Set(snake.map(hexToKey));
    const availableCells = allCells.filter((cell) => !snakeSet.has(hexToKey(cell)));

    if (availableCells.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableCells.length);
      setFood(availableCells[randomIndex]);
    }
  }, [snake, allCells]);

  const resetGame = useCallback(() => {
    setSnake([{ q: 0, r: 0 }]);
    setDirection(HexDirection.East);
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setFood(null);
    pendingTurnRef.current = null;
    // Food will be spawned by useEffect
  }, []);

  const togglePause = useCallback(() => {
    if (!gameOver) {
      setIsPaused((prev) => !prev);
    }
  }, [gameOver]);

  const turn = useCallback((turnDirection: 'left' | 'right') => {
    if (gameOver || isPaused) return;
    pendingTurnRef.current = turnDirection;
  }, [gameOver, isPaused]);

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    // Apply pending turn
    let newDirection = directionRef.current;
    if (pendingTurnRef.current === 'left') {
      newDirection = turnLeft(directionRef.current);
      setDirection(newDirection);
      pendingTurnRef.current = null;
    } else if (pendingTurnRef.current === 'right') {
      newDirection = turnRight(directionRef.current);
      setDirection(newDirection);
      pendingTurnRef.current = null;
    }

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newHead = getNeighbor(head, newDirection);

      // Check collision with walls
      if (!isInGrid(newHead, gridRadius)) {
        setGameOver(true);
        return prevSnake;
      }

      // Check collision with self
      if (prevSnake.some((segment) => hexEqual(segment, newHead))) {
        setGameOver(true);
        return prevSnake;
      }

      // Check if food is eaten
      const ateFood = food && hexEqual(newHead, food);

      if (ateFood) {
        setScore((prev) => prev + 1);
        setFood(null);
        // Spawn new food after state update
        setTimeout(() => spawnFood(), 0);
        // Grow snake
        return [newHead, ...prevSnake];
      } else {
        // Move snake (remove tail)
        return [newHead, ...prevSnake.slice(0, -1)];
      }
    });
  }, [gameOver, isPaused, food, gridRadius, spawnFood]);

  // Game loop
  useEffect(() => {
    if (gameOver || isPaused) return;

    const interval = setInterval(() => {
      moveSnake();
    }, 200); // Move every 200ms

    return () => clearInterval(interval);
  }, [moveSnake, gameOver, isPaused]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        turn('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        turn('right');
      } else if (e.key === ' ') {
        e.preventDefault();
        if (gameOver) {
          resetGame();
        } else {
          togglePause();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [turn, gameOver, resetGame, togglePause]);

  return {
    snake,
    direction,
    food,
    score,
    gameOver,
    isPaused,
    gridRadius,
    allCells,
    resetGame,
    togglePause,
    turn,
  };
}
