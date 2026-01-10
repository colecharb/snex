# Hexagonal Snake 🐍

A modern twist on the classic Snake game, played on a hexagonal lattice!

## Features

- **Hexagonal Grid**: Play on a hexagon-shaped board with 12 cells per edge
- **Tank-Style Controls**: Turn left or right relative to the snake's current direction
- **Beautiful UI**: Clean, modern interface built with Next.js and Tailwind CSS
- **Responsive**: Works on different screen sizes

## How to Play

### Objective
Eat the red food to grow your snake and increase your score. Avoid hitting the walls or your own body!

### Controls
- **Arrow Left (←)**: Turn left (relative to snake's direction)
- **Arrow Right (→)**: Turn right (relative to snake's direction)
- **Space**: Pause/Resume or Restart after game over

### Tank-Style Controls Explained
Unlike traditional snake where arrows move you in absolute directions (up/down/left/right), this game uses relative turning:
- The snake always moves forward in its current direction
- Left arrow rotates the snake 60° counter-clockwise
- Right arrow rotates the snake 60° clockwise

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to play!

## Technology Stack

- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **SVG**: Hexagonal grid rendering

## Project Structure

```
├── app/
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (game)
│   └── globals.css        # Global styles
├── components/
│   └── HexSnakeGame.tsx   # Main game component
├── hooks/
│   └── useSnakeGame.ts    # Game logic hook
└── lib/
    └── hexGrid.ts         # Hexagonal grid utilities
```

## How It Works

### Hexagonal Coordinates
The game uses **axial coordinates** (q, r) to represent hexagons, a standard system for hex grids. Each hexagon has 6 neighbors, and the snake can move in 6 directions.

### Game Loop
- The snake moves automatically every 200ms
- Direction changes are queued and applied on the next move
- Collision detection checks for walls and self-collision
- Food spawns randomly in empty cells

## Future Enhancements

Potential features for a backend:
- Leaderboard system
- Multiplayer mode
- Save/load game state
- Custom difficulty levels
- Power-ups and obstacles

## License

MIT
