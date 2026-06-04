import { SECTOR_COUNT, WALL_THICKNESS, BASE_WALL_SPEED_SCALE } from './constants.js';
import { drawWallSegment } from './geometry.js';

const PATTERNS = [
  {
    name: 'single-gap',
    rings: [{ sectors: [true, true, true, true, true, false], delay: 0 }],
  },
  {
    name: 'double-gap',
    rings: [{ sectors: [true, true, false, true, true, false], delay: 0 }],
  },
  {
    name: 'half-wall',
    rings: [{ sectors: [true, true, true, false, false, false], delay: 0 }],
  },
  {
    name: 'corridor',
    rings: [
      { sectors: [true, true, true, false, true, true], delay: 0 },
      { sectors: [true, true, true, false, true, true], delay: 0.4 },
      { sectors: [true, true, true, false, true, true], delay: 0.8 },
    ],
  },
  {
    name: 'spiral-cw',
    rings: [
      { sectors: [false, true, true, true, true, true], delay: 0 },
      { sectors: [true, false, true, true, true, true], delay: 0.4 },
      { sectors: [true, true, false, true, true, true], delay: 0.8 },
      { sectors: [true, true, true, false, true, true], delay: 1.2 },
    ],
  },
  {
    name: 'spiral-ccw',
    rings: [
      { sectors: [false, true, true, true, true, true], delay: 0 },
      { sectors: [true, true, true, true, true, false], delay: 0.4 },
      { sectors: [true, true, true, true, false, true], delay: 0.8 },
      { sectors: [true, true, true, false, true, true], delay: 1.2 },
    ],
  },
  {
    name: 'zigzag',
    rings: [
      { sectors: [false, true, true, true, true, true], delay: 0 },
      { sectors: [true, true, true, false, true, true], delay: 0.5 },
      { sectors: [false, true, true, true, true, true], delay: 1.0 },
      { sectors: [true, true, true, false, true, true], delay: 1.5 },
    ],
  },
  {
    name: 'squeeze',
    rings: [
      { sectors: [false, true, true, true, true, true], delay: 0 },
      { sectors: [true, true, true, false, true, true], delay: 0.25 },
    ],
  },
];

function getPatternPool(phaseIndex) {
  const weights = [
    [30, 30, 20, 20, 0, 0, 0, 0],
    [20, 20, 15, 20, 15, 10, 0, 0],
    [15, 10, 10, 15, 20, 15, 10, 5],
    [10, 5, 5, 15, 20, 20, 15, 10],
  ];
  const w = weights[Math.min(phaseIndex, weights.length - 1)];
  return w;
}

function rotateSectors(sectors, offset) {
  const rotated = new Array(SECTOR_COUNT);
  for (let i = 0; i < SECTOR_COUNT; i++) {
    rotated[(i + offset) % SECTOR_COUNT] = sectors[i];
  }
  return rotated;
}

function pickPattern(phaseIndex) {
  const weights = getPatternPool(phaseIndex);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return PATTERNS[i];
  }
  return PATTERNS[0];
}

export function createWallSystem() {
  return {
    activeWalls: [],
    patternQueue: [],
    spawnTimer: 0,
    patternTime: 0,
    ringIndex: 0,
    wallIdCounter: 0,
  };
}

export function queuePattern(wallSystem, phaseIndex) {
  const pattern = pickPattern(phaseIndex);
  const offset = Math.floor(Math.random() * SECTOR_COUNT);
  const rings = pattern.rings.map(r => ({
    sectors: rotateSectors(r.sectors, offset),
    delay: r.delay,
  }));
  wallSystem.patternQueue.push(...rings);
}

export function updateWalls(wallSystem, dt, arenaRadius, wallSpeedMult, spawnDelay, phaseIndex) {
  const wallSpeed = arenaRadius * BASE_WALL_SPEED_SCALE * wallSpeedMult;

  if (wallSystem.patternQueue.length < 3) {
    queuePattern(wallSystem, phaseIndex);
  }

  wallSystem.spawnTimer -= dt;
  if (wallSystem.spawnTimer <= 0 && wallSystem.patternQueue.length > 0) {
    const ring = wallSystem.patternQueue.shift();
    wallSystem.activeWalls.push({
      id: wallSystem.wallIdCounter++,
      sectors: ring.sectors,
      radius: arenaRadius + WALL_THICKNESS,
      thickness: WALL_THICKNESS,
    });

    if (wallSystem.patternQueue.length > 0) {
      const nextDelay = wallSystem.patternQueue[0].delay;
      wallSystem.spawnTimer = nextDelay > 0 ? nextDelay : spawnDelay;
    } else {
      wallSystem.spawnTimer = spawnDelay;
    }
  }

  for (const wall of wallSystem.activeWalls) {
    wall.radius -= wallSpeed * dt;
  }

  wallSystem.activeWalls = wallSystem.activeWalls.filter(
    w => w.radius + w.thickness > 0
  );
}

export function drawWalls(ctx, wallSystem, cx, cy, worldRotation, fgColor) {
  const darkFg = darkenColor(fgColor, 0.6);

  for (let i = 0; i < wallSystem.activeWalls.length; i++) {
    const wall = wallSystem.activeWalls[i];
    const color = i % 2 === 0 ? fgColor : darkFg;
    const innerR = Math.max(0, wall.radius);
    const outerR = wall.radius + wall.thickness;

    if (outerR <= 0) continue;

    for (let s = 0; s < SECTOR_COUNT; s++) {
      if (!wall.sectors[s]) continue;
      drawWallSegment(ctx, cx, cy, innerR, outerR, s, s + 1, worldRotation, color);
    }
  }
}

function darkenColor(hex, factor) {
  const r = Math.floor(parseInt(hex.slice(1, 3), 16) * factor);
  const g = Math.floor(parseInt(hex.slice(3, 5), 16) * factor);
  const b = Math.floor(parseInt(hex.slice(5, 7), 16) * factor);
  return `rgb(${r},${g},${b})`;
}
