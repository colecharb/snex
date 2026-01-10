"use client";

import { useState, useEffect, useRef } from "react";
import { useSnakeGame } from "@/hooks/useSnakeGame";
import { HexCoord, hexToPixel, hexToKey, hexEqual } from "@/lib/hexGrid";

const HEX_SIZE = 20; // Size of each hexagon
const STROKE_WIDTH = 1;

// Draw a hexagon on canvas
function drawHexagon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  fill: string,
  stroke: string,
  strokeWidth: number
) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const hx = x + size * Math.cos(angle);
    const hy = y + size * Math.sin(angle);
    if (i === 0) {
      ctx.moveTo(hx, hy);
    } else {
      ctx.lineTo(hx, hy);
    }
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = strokeWidth;
  ctx.stroke();
}

export default function HexSnakeGame() {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  // Calculate canvas dimensions
  const padding = HEX_SIZE * 2;
  const gridWidth = HEX_SIZE * (3 * gridRadius + 2) + padding * 2;
  const gridHeight =
    HEX_SIZE * Math.sqrt(3) * (2 * gridRadius + 1) + padding * 2;
  const aspectRatio = gridWidth / gridHeight;

  // Shared render function
  const renderCanvas = useRef(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get CSS colors
    const computedStyle = getComputedStyle(canvas);
    const cellFill = computedStyle.getPropertyValue("--cell-fill").trim();
    const cellStroke = computedStyle.getPropertyValue("--cell-stroke").trim();
    const snakeBody = computedStyle.getPropertyValue("--snake-body").trim();
    const snakeHeadColor = computedStyle.getPropertyValue("--snake-head").trim();
    const foodFill = computedStyle.getPropertyValue("--food-fill").trim();

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Center the coordinate system
    ctx.save();
    ctx.translate(rect.width / 2, rect.height / 2);

    // Calculate scale to fit grid
    const scale = Math.min(
      rect.width / gridWidth,
      rect.height / gridHeight
    );
    ctx.scale(scale, scale);

    // Draw all hexagons
    allCells.forEach((hex) => {
      const key = hexToKey(hex);
      const isSnake = snakeSet.has(key);
      const isHead = hexEqual(hex, snakeHead);
      const isFood = food && hexEqual(hex, food);

      let fill = cellFill;
      if (isFood) fill = foodFill;
      else if (isHead) fill = snakeHeadColor;
      else if (isSnake) fill = snakeBody;

      const { x, y } = hexToPixel(hex, HEX_SIZE);
      drawHexagon(ctx, x, y, HEX_SIZE, fill, cellStroke, STROKE_WIDTH);
    });

    ctx.restore();
  });

  // Update render function when dependencies change
  useEffect(() => {
    renderCanvas.current = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const computedStyle = getComputedStyle(canvas);
      const cellFill = computedStyle.getPropertyValue("--cell-fill").trim();
      const cellStroke = computedStyle.getPropertyValue("--cell-stroke").trim();
      const snakeBody = computedStyle.getPropertyValue("--snake-body").trim();
      const snakeHeadColor = computedStyle.getPropertyValue("--snake-head").trim();
      const foodFill = computedStyle.getPropertyValue("--food-fill").trim();

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, rect.width, rect.height);

      ctx.save();
      ctx.translate(rect.width / 2, rect.height / 2);

      const scale = Math.min(
        rect.width / gridWidth,
        rect.height / gridHeight
      );
      ctx.scale(scale, scale);

      allCells.forEach((hex) => {
        const key = hexToKey(hex);
        const isSnake = snakeSet.has(key);
        const isHead = hexEqual(hex, snakeHead);
        const isFood = food && hexEqual(hex, food);

        let fill = cellFill;
        if (isFood) fill = foodFill;
        else if (isHead) fill = snakeHeadColor;
        else if (isSnake) fill = snakeBody;

        const { x, y } = hexToPixel(hex, HEX_SIZE);
        drawHexagon(ctx, x, y, HEX_SIZE, fill, cellStroke, STROKE_WIDTH);
      });

      ctx.restore();
    };
  }, [snake, food, allCells, snakeSet, snakeHead, gridRadius, gridWidth, gridHeight]);

  // Render when game state changes
  useEffect(() => {
    if (!mounted) return;
    renderCanvas.current();
  }, [mounted, snake, food]);

  // Handle canvas resize
  useEffect(() => {
    if (!mounted || !canvasRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      renderCanvas.current();
    });

    resizeObserver.observe(canvasRef.current);

    return () => resizeObserver.disconnect();
  }, [mounted]);

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
        <canvas
          ref={canvasRef}
          className="shrink min-h-0"
          style={{
            aspectRatio: aspectRatio,
            maxHeight: "100%",
            maxWidth: "100%",
          }}
        />

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
