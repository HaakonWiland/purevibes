export const SECTOR_COUNT = 6;
export const SECTOR_ANGLE = Math.PI / 3;
export const TWO_PI = Math.PI * 2;

export const ARENA_SCALE = 0.45;
export const CENTER_HEX_SCALE = 0.08;
export const PLAYER_ORBIT_SCALE = 0.12;
export const PLAYER_SIZE_SCALE = 0.025;
export const PLAYER_HITBOX_SCALE = 0.025;
export const WALL_THICKNESS = 20;

export const PLAYER_ROTATION_SPEED = 4.0;
export const BASE_WALL_SPEED_SCALE = 0.35;

export const PHASES = [
  { name: 'POINT',    startTime: 0,   wallSpeedMult: 1.0, spawnDelay: 1.2, rotSpeed: 0.3, dirChangeInterval: Infinity },
  { name: 'LINE',     startTime: 10,  wallSpeedMult: 1.2, spawnDelay: 1.0, rotSpeed: 0.5, dirChangeInterval: 8 },
  { name: 'TRIANGLE', startTime: 30,  wallSpeedMult: 1.4, spawnDelay: 0.8, rotSpeed: 0.7, dirChangeInterval: 5 },
  { name: 'SQUARE',   startTime: 60,  wallSpeedMult: 1.6, spawnDelay: 0.6, rotSpeed: 0.9, dirChangeInterval: 3 },
  { name: 'PENTAGON', startTime: 120, wallSpeedMult: 1.8, spawnDelay: 0.5, rotSpeed: 1.1, dirChangeInterval: 2 },
  { name: 'HEXAGON',  startTime: 180, wallSpeedMult: 2.0, spawnDelay: 0.4, rotSpeed: 1.3, dirChangeInterval: 1.5 },
];

export const PALETTES = [
  { bg: '#0a0a2e', fg: '#00e5ff' },
  { bg: '#1a0a2e', fg: '#ff00ff' },
  { bg: '#2e0a0a', fg: '#ff6600' },
  { bg: '#0a0a0a', fg: '#ff0033' },
  { bg: '#0a2e2e', fg: '#ffffff' },
  { bg: '#000000', fg: '#ff1493' },
];
