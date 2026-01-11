import { useState, useEffect, useCallback, useRef } from "react";
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
} from "@/lib/hexGrid";

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
  const [mounted, setMounted] = useState(false);
  const [snake, setSnake] = useState<HexCoord[]>([{ q: 0, r: 0 }]);
  const [direction, setDirection] = useState<HexDirection>(HexDirection.East);
  const [food, setFood] = useState<HexCoord | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [allCells] = useState<HexCoord[]>(() =>
    generateHexagonalGrid(gridRadius),
  );

  const directionRef = useRef(direction);
  const pendingTurnRef = useRef<"left" | "right" | null>(null);

  // Mark as mounted after hydration
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const spawnFood = useCallback(() => {
    const snakeSet = new Set(snake.map(hexToKey));
    const availableCells = allCells.filter(
      (cell) => !snakeSet.has(hexToKey(cell)),
    );

    if (availableCells.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableCells.length);
      setFood(availableCells[randomIndex]);
    }
  }, [snake, allCells]);

  // Initialize food / respawn after reset (only after hydration)
  useEffect(() => {
    if (mounted && !food) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      spawnFood();
    }
  }, [mounted, food, spawnFood]);

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

  const turn = useCallback(
    (turnDirection: "left" | "right") => {
      if (gameOver || isPaused) return;
      pendingTurnRef.current = turnDirection;
    },
    [gameOver, isPaused],
  );

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    // Apply pending turn
    let newDirection = directionRef.current;
    if (pendingTurnRef.current === "left") {
      newDirection = turnLeft(directionRef.current);
      setDirection(newDirection);
      pendingTurnRef.current = null;
    } else if (pendingTurnRef.current === "right") {
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

  // Game loop using requestAnimationFrame for smoother timing
  useEffect(() => {
    if (!mounted || gameOver || isPaused) return;

    const TICK_RATE = 200; // ms per move
    const MAX_DELTA = TICK_RATE * 2; // Prevent spiral of death
    const MIN_DELTA = 0; // Ignore zero/negative deltas

    let lastTime = performance.now();
    let accumulator = 0;
    let frameId: number;

    const tick = (currentTime: number) => {
      let delta = currentTime - lastTime;

      // Clamp delta to prevent issues with extreme values
      if (delta < MIN_DELTA) delta = 0;
      if (delta > MAX_DELTA) delta = MAX_DELTA;

      lastTime = currentTime;
      accumulator += delta;

      // Execute exactly one tick per frame to prevent multiple moves
      if (accumulator >= TICK_RATE) {
        moveSnake();
        accumulator -= TICK_RATE;
        // Cap accumulator to prevent runaway
        if (accumulator > TICK_RATE) {
          accumulator = 0;
        }
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [mounted, moveSnake, gameOver, isPaused]);

  // Keyboard controls (WASD)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "a") {
        e.preventDefault();
        turn("left");
      } else if (key === "d") {
        e.preventDefault();
        turn("right");
      } else if (key === " ") {
        e.preventDefault();
        if (gameOver) {
          resetGame();
        } else {
          togglePause();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
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
