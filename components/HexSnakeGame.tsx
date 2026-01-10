"use client";

import { useState, useEffect } from "react";
import { useSnakeGame } from "@/hooks/useSnakeGame";
import { HexCoord, hexToPixel, hexToKey, hexEqual } from "@/lib/hexGrid";

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
  return (
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]},${p[1]}`).join(" ") +
    " Z"
  );
}

interface HexagonProps {
  hex: HexCoord;
  size: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

function Hexagon({
  hex,
  size,
  fill,
  stroke = "#333",
  strokeWidth = STROKE_WIDTH,
}: HexagonProps) {
  const { x, y } = hexToPixel(hex, size);
  const path = hexagonPath(size);

  return (
    <g transform={`translate(${x}, ${y})`}>
      <path d={path} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
    </g>
  );
}

export default function HexSnakeGame() {
  const [mounted, setMounted] = useState(false);
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
  } = useSnakeGame(11);

  useEffect(() => {
    setMounted(true);
  }, []);

  const snakeSet = new Set(snake.map(hexToKey));
  const snakeHead = snake[0];

  // Calculate SVG viewBox - account for full grid extent plus hex size at edges
  const padding = HEX_SIZE * 2;
  const gridWidth = HEX_SIZE * (3 * gridRadius + 2) + padding * 2;
  const gridHeight =
    HEX_SIZE * Math.sqrt(3) * (2 * gridRadius + 1) + padding * 2;
  const aspectRatio = gridWidth / gridHeight;

  return (
    <div
      className="flex flex-col overflow-hidden mx-auto w-full"
      style={{
        height: "100dvh",
        maxWidth: "1000px",
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Header - fixed height */}
      <div className="h-16 flex items-center justify-between px-6 shrink-0">
        <span
          className="text-sm font-light tracking-widest uppercase"
          style={{ color: "var(--muted)" }}
        >
          Snex
        </span>
        <span className="text-sm font-light tracking-wide tabular-nums">
          {score}
        </span>
      </div>

      {/* Game board and controls */}
      <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center px-4">
        <svg
          viewBox={`${-gridWidth / 2} ${-gridHeight / 2} ${gridWidth} ${gridHeight}`}
          className="shrink min-h-0"
          style={{
            aspectRatio: aspectRatio,
            maxHeight: "100%",
            maxWidth: "100%",
          }}
        >
          {mounted &&
            allCells.map((hex) => {
              const key = hexToKey(hex);
              const isSnake = snakeSet.has(key);
              const isHead = hexEqual(hex, snakeHead);
              const isFood = food && hexEqual(hex, food);

              let fill = "var(--cell-fill)";
              if (isFood) fill = "var(--food-fill)";
              else if (isHead) fill = "var(--snake-head)";
              else if (isSnake) fill = "var(--snake-body)";

              return (
                <Hexagon
                  key={key}
                  hex={hex}
                  size={HEX_SIZE}
                  fill={fill}
                  stroke="var(--cell-stroke)"
                />
              );
            })}
        </svg>

        {/* Mobile touch controls - immediately below board */}
        <div className="flex md:hidden items-center gap-8 w-full max-w-xs justify-between mt-6 shrink-0">
          <button
            onPointerDown={() => turn("left")}
            disabled={gameOver || isPaused}
            className="w-16 h-16 rounded-full border flex items-center justify-center touch-none transition-colors"
            style={{
              borderColor: "var(--border)",
              color: gameOver || isPaused ? "var(--border)" : "var(--muted)",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onPointerDown={gameOver ? resetGame : togglePause}
            className="text-xs tracking-wider transition-colors touch-none"
            style={{ color: "var(--muted)" }}
          >
            {gameOver ? "play again" : isPaused ? "resume" : "pause"}
          </button>
          <button
            onPointerDown={() => turn("right")}
            disabled={gameOver || isPaused}
            className="w-16 h-16 rounded-full border flex items-center justify-center touch-none transition-colors"
            style={{
              borderColor: "var(--border)",
              color: gameOver || isPaused ? "var(--border)" : "var(--muted)",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Footer - desktop only with safe area padding */}
      <div
        className="h-12 hidden md:flex items-center justify-center shrink-0 px-6"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {gameOver ? (
          <button
            onClick={resetGame}
            className="text-sm tracking-wide transition-colors"
            style={{ color: "var(--muted)" }}
          >
            play again
          </button>
        ) : isPaused ? (
          <button
            onClick={togglePause}
            className="text-sm tracking-wide transition-colors"
            style={{ color: "var(--muted)" }}
          >
            resume
          </button>
        ) : (
          <span
            className="text-xs tracking-wider"
            style={{ color: "var(--muted-foreground)" }}
          >
            A / D to turn
          </span>
        )}
      </div>
      {/* Mobile safe area spacer */}
      <div
        className="md:hidden shrink-0"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      />
    </div>
  );
}
