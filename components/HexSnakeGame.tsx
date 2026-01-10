'use client';

import { useSnakeGame } from '@/hooks/useSnakeGame';
import { HexCoord, hexToPixel, hexToKey, hexEqual } from '@/lib/hexGrid';

const HEX_SIZE = 20; // Size of each hexagon
const STROKE_WIDTH = 1;

// Generate hexagon path for SVG
function hexagonPath(size: number): string {
  const points: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = size * Math.cos(angle);
    const y = size * Math.sin(angle);
    points.push([x, y]);
  }
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]},${p[1]}`).join(' ') + ' Z';
}

interface HexagonProps {
  hex: HexCoord;
  size: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

function Hexagon({ hex, size, fill, stroke = '#333', strokeWidth = STROKE_WIDTH }: HexagonProps) {
  const { x, y } = hexToPixel(hex, size);
  const path = hexagonPath(size);

  return (
    <g transform={`translate(${x}, ${y})`}>
      <path d={path} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
    </g>
  );
}

export default function HexSnakeGame() {
  const {
    snake,
    food,
    score,
    gameOver,
    isPaused,
    gridRadius,
    allCells,
    resetGame,
    togglePause,
    turn,
  } = useSnakeGame(11); // 11 radius = 12 cells per edge (0 to 11 inclusive)

  const snakeSet = new Set(snake.map(hexToKey));
  const snakeHead = snake[0];

  // Calculate SVG viewBox
  const padding = HEX_SIZE * 2;
  const gridWidth = HEX_SIZE * 3 * gridRadius + padding * 2;
  const gridHeight = HEX_SIZE * Math.sqrt(3) * gridRadius + padding * 2;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Hexagonal Snake</h1>
        <div className="text-2xl mb-4">Score: {score}</div>
        {gameOver && (
          <div className="text-red-500 text-2xl font-bold mb-2">Game Over!</div>
        )}
        {isPaused && !gameOver && (
          <div className="text-yellow-500 text-2xl font-bold mb-2">Paused</div>
        )}
      </div>

      <div className="mb-8 bg-gray-800 rounded-lg p-4">
        <svg
          width={gridWidth}
          height={gridHeight}
          viewBox={`${-gridWidth / 2} ${-gridHeight / 2} ${gridWidth} ${gridHeight}`}
          className="mx-auto"
        >
          {/* Grid cells */}
          {allCells.map((hex) => {
            const key = hexToKey(hex);
            const isSnake = snakeSet.has(key);
            const isHead = hexEqual(hex, snakeHead);
            const isFood = food && hexEqual(hex, food);

            let fill = '#1a1a1a';
            if (isFood) fill = '#ef4444'; // Red for food
            else if (isHead) fill = '#22c55e'; // Green for head
            else if (isSnake) fill = '#4ade80'; // Light green for body

            return (
              <Hexagon
                key={key}
                hex={hex}
                size={HEX_SIZE}
                fill={fill}
                stroke="#333"
              />
            );
          })}
        </svg>
      </div>

      <div className="space-y-4 text-center">
        <div className="space-x-4">
          <button
            onClick={() => turn('left')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            disabled={gameOver}
          >
            ← Turn Left
          </button>
          <button
            onClick={() => turn('right')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            disabled={gameOver}
          >
            Turn Right →
          </button>
        </div>

        <div className="space-x-4">
          {gameOver ? (
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
            >
              Play Again (Space)
            </button>
          ) : (
            <button
              onClick={togglePause}
              className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition-colors"
            >
              {isPaused ? 'Resume' : 'Pause'} (Space)
            </button>
          )}
        </div>

        <div className="text-sm text-gray-400 mt-8">
          <div className="mb-2">Controls:</div>
          <div>← → Arrow keys to turn left/right</div>
          <div>Space to pause/resume</div>
        </div>
      </div>
    </div>
  );
}
