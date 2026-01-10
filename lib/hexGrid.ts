// Hexagonal grid utilities using axial coordinates (q, r)
// Reference: https://www.redblobgames.com/grids/hexagons/

export interface HexCoord {
  q: number; // column
  r: number; // row
}

// Six directions in hexagonal grid (flat-top orientation)
export enum HexDirection {
  East = 0,
  NorthEast = 1,
  NorthWest = 2,
  West = 3,
  SouthWest = 4,
  SouthEast = 5,
}

const directionVectors: HexCoord[] = [
  { q: 1, r: 0 },   // East
  { q: 0, r: -1 },  // NorthEast
  { q: -1, r: -1 }, // NorthWest
  { q: -1, r: 0 },  // West
  { q: 0, r: 1 },   // SouthWest
  { q: 1, r: 1 },   // SouthEast
];

export function hexEqual(a: HexCoord, b: HexCoord): boolean {
  return a.q === b.q && a.r === b.r;
}

export function hexAdd(a: HexCoord, b: HexCoord): HexCoord {
  return { q: a.q + b.q, r: a.r + b.r };
}

export function getNeighbor(hex: HexCoord, direction: HexDirection): HexCoord {
  return hexAdd(hex, directionVectors[direction]);
}

export function turnLeft(direction: HexDirection): HexDirection {
  return ((direction + 1) % 6) as HexDirection;
}

export function turnRight(direction: HexDirection): HexDirection {
  return ((direction + 5) % 6) as HexDirection;
}

// Generate all hexagons in a hexagonal shape with given radius
export function generateHexagonalGrid(radius: number): HexCoord[] {
  const hexagons: HexCoord[] = [];

  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      hexagons.push({ q, r });
    }
  }

  return hexagons;
}

// Check if a hex coordinate is within the hexagonal grid
export function isInGrid(hex: HexCoord, radius: number): boolean {
  const s = -hex.q - hex.r; // third cube coordinate
  return Math.abs(hex.q) <= radius && Math.abs(hex.r) <= radius && Math.abs(s) <= radius;
}

// Convert hex coordinate to pixel position (flat-top orientation)
export function hexToPixel(hex: HexCoord, size: number): { x: number; y: number } {
  const x = size * (3 / 2 * hex.q);
  const y = size * (Math.sqrt(3) / 2 * hex.q + Math.sqrt(3) * hex.r);
  return { x, y };
}

// Convert hex coordinate to string key for maps/sets
export function hexToKey(hex: HexCoord): string {
  return `${hex.q},${hex.r}`;
}

// Convert string key back to hex coordinate
export function keyToHex(key: string): HexCoord {
  const [q, r] = key.split(',').map(Number);
  return { q, r };
}
