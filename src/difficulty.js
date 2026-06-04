import { PHASES } from './constants.js';

export function createDifficulty() {
  return {
    elapsedTime: 0,
    phaseIndex: 0,
    worldRotation: 0,
    worldRotDir: 1,
    nextDirChange: PHASES[0].dirChangeInterval,
    lastPhaseIndex: -1,
  };
}

function lerp(a, b, t) {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}

function getPhaseProgress(time) {
  for (let i = PHASES.length - 1; i >= 0; i--) {
    if (time >= PHASES[i].startTime) {
      const nextPhase = PHASES[Math.min(i + 1, PHASES.length - 1)];
      const duration = nextPhase.startTime - PHASES[i].startTime;
      const progress = duration > 0 ? (time - PHASES[i].startTime) / duration : 1;
      return { index: i, progress: Math.min(1, progress) };
    }
  }
  return { index: 0, progress: 0 };
}

export function updateDifficulty(diff, dt) {
  diff.elapsedTime += dt;

  const { index, progress } = getPhaseProgress(diff.elapsedTime);
  diff.phaseIndex = index;

  const current = PHASES[index];
  const next = PHASES[Math.min(index + 1, PHASES.length - 1)];

  const rotSpeed = lerp(current.rotSpeed, next.rotSpeed, progress);
  diff.worldRotation += rotSpeed * diff.worldRotDir * dt;

  if (diff.elapsedTime >= diff.nextDirChange) {
    diff.worldRotDir *= -1;
    const interval = lerp(current.dirChangeInterval, next.dirChangeInterval, progress);
    const variance = interval * 0.3;
    diff.nextDirChange = diff.elapsedTime + interval + (Math.random() - 0.5) * 2 * variance;
  }

  const phaseChanged = diff.phaseIndex !== diff.lastPhaseIndex;
  diff.lastPhaseIndex = diff.phaseIndex;

  return {
    wallSpeedMult: lerp(current.wallSpeedMult, next.wallSpeedMult, progress),
    spawnDelay: lerp(current.spawnDelay, next.spawnDelay, progress),
    worldRotVelocity: rotSpeed * diff.worldRotDir,
    phaseIndex: index,
    phaseName: current.name,
    phaseChanged,
  };
}

export function resetDifficulty(diff) {
  diff.elapsedTime = 0;
  diff.phaseIndex = 0;
  diff.worldRotation = 0;
  diff.worldRotDir = 1;
  diff.nextDirChange = PHASES[0].dirChangeInterval;
  diff.lastPhaseIndex = -1;
}
