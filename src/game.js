import { ARENA_SCALE, CENTER_HEX_SCALE } from './constants.js';
import { drawHexagon } from './geometry.js';
import { createPlayer, updatePlayer, drawPlayer } from './player.js';
import { createWallSystem, updateWalls, drawWalls, queuePattern } from './walls.js';
import { checkCollision } from './collision.js';
import { createDifficulty, updateDifficulty, resetDifficulty } from './difficulty.js';
import {
  createEffects, updateEffects, resetEffects,
  triggerDeath, triggerPhaseChange, triggerDirectionFlash,
} from './effects.js';
import { initAudio, toggleMute, isMuted, playStartSound, playDeathSound, playPhaseSound, startMusic, stopMusic } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const State = { TITLE: 0, PLAYING: 1, DEAD: 2 };
let gameState = State.TITLE;

let player = createPlayer();
let wallSystem = createWallSystem();
let difficulty = createDifficulty();
let effects = createEffects();

let bestTime = parseFloat(localStorage.getItem('purevibes_best_time')) || 0;
let deathDelay = 0;
let lastDirChange = 0;

const input = { left: false, right: false };

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

window.addEventListener('keydown', e => {
  if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') input.left = true;
  if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') input.right = true;
  if (e.key === 'm' || e.key === 'M') toggleMute();

  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    if (gameState === State.TITLE) startGame();
    else if (gameState === State.DEAD && deathDelay <= 0) startGame();
  }
  if (e.key === 'Escape' && gameState === State.DEAD) {
    gameState = State.TITLE;
  }
});

window.addEventListener('keyup', e => {
  if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') input.left = false;
  if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') input.right = false;
});

function startGame() {
  gameState = State.PLAYING;
  player = createPlayer();
  wallSystem = createWallSystem();
  resetDifficulty(difficulty);
  resetEffects(effects);
  deathDelay = 0;
  lastDirChange = difficulty.worldRotDir;
  playStartSound();
  startMusic();
}

function die() {
  gameState = State.DEAD;
  player.alive = false;
  deathDelay = 0.5;
  stopMusic();

  if (difficulty.elapsedTime > bestTime) {
    bestTime = difficulty.elapsedTime;
    localStorage.setItem('purevibes_best_time', bestTime.toFixed(1));
  }

  triggerDeath(effects);
  playDeathSound();
}

let lastTime = 0;

function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const arenaRadius = Math.min(canvas.width, canvas.height) * ARENA_SCALE;

  update(dt, arenaRadius);
  render(cx, cy, arenaRadius);

  requestAnimationFrame(gameLoop);
}

function update(dt, arenaRadius) {
  updateEffects(effects, dt);

  if (gameState === State.PLAYING) {
    const diffResult = updateDifficulty(difficulty, dt);

    if (difficulty.worldRotDir !== lastDirChange) {
      triggerDirectionFlash(effects);
      lastDirChange = difficulty.worldRotDir;
    }

    if (diffResult.phaseChanged && difficulty.phaseIndex > 0) {
      triggerPhaseChange(effects, diffResult.phaseName, difficulty.phaseIndex);
      playPhaseSound();
    }

    updatePlayer(player, input, dt, diffResult.worldRotVelocity);
    updateWalls(wallSystem, dt, arenaRadius, diffResult.wallSpeedMult, diffResult.spawnDelay, diffResult.phaseIndex);

    if (checkCollision(player, wallSystem, arenaRadius, difficulty.worldRotation)) {
      die();
    }
  } else if (gameState === State.TITLE) {
    updateDifficulty(difficulty, dt);
    updateWalls(wallSystem, dt, arenaRadius, 1.0, 1.2, 0);
    if (wallSystem.activeWalls.length < 3) {
      queuePattern(wallSystem, 0);
    }
  }

  if (gameState === State.DEAD) {
    deathDelay = Math.max(0, deathDelay - dt);
  }
}

function render(cx, cy, arenaRadius) {
  const bg = effects.currentBg;
  const fg = effects.currentFg;
  const worldRot = difficulty.worldRotation;

  ctx.save();

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (effects.shakeIntensity > 0) {
    ctx.translate(effects.shakeX, effects.shakeY);
  }

  drawWalls(ctx, wallSystem, cx, cy, worldRot, fg);

  const centerR = arenaRadius * CENTER_HEX_SCALE;
  const pulse = 1 + Math.sin(effects.centerPulseTime * Math.PI * 3) * 0.1;
  drawHexagon(ctx, cx, cy, centerR * pulse, worldRot, fg);

  if (gameState === State.PLAYING || gameState === State.DEAD) {
    drawPlayer(ctx, player, cx, cy, arenaRadius, worldRot, fg);
  }

  if (effects.flashOpacity > 0) {
    ctx.fillStyle = `rgba(255,255,255,${effects.flashOpacity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.restore();

  // UI (not affected by shake)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (gameState === State.TITLE) {
    renderTitle(cx, cy, fg);
  } else if (gameState === State.PLAYING) {
    renderHUD(cx, cy, fg);
  } else if (gameState === State.DEAD) {
    renderDeath(cx, cy, fg);
  }

  if (effects.phaseTextOpacity > 0) {
    const size = Math.min(canvas.width, canvas.height) * 0.12;
    ctx.font = `bold ${size}px "Courier New", monospace`;
    ctx.fillStyle = hexWithAlpha(fg, effects.phaseTextOpacity);
    ctx.fillText(effects.phaseText, cx, cy);
  }

  if (isMuted()) {
    ctx.font = '16px monospace';
    ctx.fillStyle = hexWithAlpha(fg, 0.4);
    ctx.textAlign = 'right';
    ctx.fillText('MUTED [M]', canvas.width - 20, canvas.height - 20);
    ctx.textAlign = 'center';
  }
}

function renderTitle(cx, cy, fg) {
  const titleSize = Math.min(canvas.width, canvas.height) * 0.10;
  ctx.font = `bold ${titleSize}px "Courier New", monospace`;
  ctx.fillStyle = fg;
  ctx.fillText('PUREVIBES', cx, cy - titleSize);

  const promptSize = Math.min(canvas.width, canvas.height) * 0.04;
  const pulse = 0.3 + Math.sin(performance.now() / 500) * 0.35 + 0.35;
  ctx.font = `${promptSize}px "Courier New", monospace`;
  ctx.fillStyle = hexWithAlpha(fg, pulse);
  ctx.fillText('PRESS SPACE TO START', cx, cy);

  if (bestTime > 0) {
    const bestSize = Math.min(canvas.width, canvas.height) * 0.03;
    ctx.font = `${bestSize}px "Courier New", monospace`;
    ctx.fillStyle = hexWithAlpha(fg, 0.7);
    ctx.fillText(`BEST: ${bestTime.toFixed(1)}s`, cx, cy + promptSize * 1.5);
  }
}

function renderHUD(cx, cy, fg) {
  const timerSize = Math.min(canvas.width, canvas.height) * 0.05;
  ctx.font = `bold ${timerSize}px "Courier New", monospace`;
  ctx.fillStyle = hexWithAlpha(fg, 0.8);
  ctx.fillText(difficulty.elapsedTime.toFixed(1), cx, timerSize);
}

function renderDeath(cx, cy, fg) {
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const overSize = Math.min(canvas.width, canvas.height) * 0.08;
  ctx.font = `bold ${overSize}px "Courier New", monospace`;
  ctx.fillStyle = fg;
  ctx.fillText('GAME OVER', cx, cy - overSize * 1.5);

  const statSize = Math.min(canvas.width, canvas.height) * 0.04;
  ctx.font = `${statSize}px "Courier New", monospace`;
  ctx.fillStyle = fg;
  ctx.fillText(`TIME: ${difficulty.elapsedTime.toFixed(1)}s`, cx, cy - statSize * 0.5);
  ctx.fillText(`BEST: ${bestTime.toFixed(1)}s`, cx, cy + statSize);

  if (difficulty.elapsedTime >= bestTime && bestTime > 0) {
    ctx.fillStyle = '#ffff00';
    ctx.fillText('NEW BEST!', cx, cy + statSize * 2.5);
  }

  if (deathDelay <= 0) {
    const promptSize = Math.min(canvas.width, canvas.height) * 0.03;
    const pulse = 0.3 + Math.sin(performance.now() / 500) * 0.35 + 0.35;
    ctx.font = `${promptSize}px "Courier New", monospace`;
    ctx.fillStyle = hexWithAlpha(fg, pulse);
    ctx.fillText('PRESS SPACE TO RESTART', cx, cy + statSize * 4);
  }
}

function hexWithAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

initAudio();
requestAnimationFrame(gameLoop);
