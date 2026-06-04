import { PALETTES } from './constants.js';

export function createEffects() {
  return {
    shakeIntensity: 0,
    shakeX: 0,
    shakeY: 0,
    flashOpacity: 0,
    phaseText: '',
    phaseTextOpacity: 0,
    centerPulseTime: 0,
    currentBg: PALETTES[0].bg,
    currentFg: PALETTES[0].fg,
    targetBg: PALETTES[0].bg,
    targetFg: PALETTES[0].fg,
    colorLerpT: 1,
  };
}

export function triggerDeath(effects) {
  effects.shakeIntensity = 8;
  effects.flashOpacity = 0.8;
}

export function triggerPhaseChange(effects, phaseName, phaseIndex) {
  effects.phaseText = phaseName;
  effects.phaseTextOpacity = 1.0;
  effects.targetBg = PALETTES[phaseIndex].bg;
  effects.targetFg = PALETTES[phaseIndex].fg;
  effects.colorLerpT = 0;
}

export function triggerDirectionFlash(effects) {
  effects.flashOpacity = Math.max(effects.flashOpacity, 0.15);
}

export function updateEffects(effects, dt) {
  if (effects.shakeIntensity > 0) {
    effects.shakeX = (Math.random() - 0.5) * effects.shakeIntensity * 2;
    effects.shakeY = (Math.random() - 0.5) * effects.shakeIntensity * 2;
    effects.shakeIntensity = Math.max(0, effects.shakeIntensity - 26 * dt);
  } else {
    effects.shakeX = 0;
    effects.shakeY = 0;
  }

  if (effects.flashOpacity > 0) {
    effects.flashOpacity = Math.max(0, effects.flashOpacity - 4 * dt);
  }

  if (effects.phaseTextOpacity > 0) {
    effects.phaseTextOpacity = Math.max(0, effects.phaseTextOpacity - 0.67 * dt);
  }

  effects.centerPulseTime += dt;

  if (effects.colorLerpT < 1) {
    effects.colorLerpT = Math.min(1, effects.colorLerpT + dt / 2);
    effects.currentBg = lerpColor(effects.currentBg, effects.targetBg, effects.colorLerpT);
    effects.currentFg = lerpColor(effects.currentFg, effects.targetFg, effects.colorLerpT);
  }
}

export function resetEffects(effects) {
  effects.shakeIntensity = 0;
  effects.shakeX = 0;
  effects.shakeY = 0;
  effects.flashOpacity = 0;
  effects.phaseText = '';
  effects.phaseTextOpacity = 0;
  effects.centerPulseTime = 0;
  effects.currentBg = PALETTES[0].bg;
  effects.currentFg = PALETTES[0].fg;
  effects.targetBg = PALETTES[0].bg;
  effects.targetFg = PALETTES[0].fg;
  effects.colorLerpT = 1;
}

function lerpColor(from, to, t) {
  const fr = parseInt(from.slice(1, 3), 16);
  const fg = parseInt(from.slice(3, 5), 16);
  const fb = parseInt(from.slice(5, 7), 16);
  const tr = parseInt(to.slice(1, 3), 16);
  const tg = parseInt(to.slice(3, 5), 16);
  const tb = parseInt(to.slice(5, 7), 16);
  const r = Math.round(fr + (tr - fr) * t);
  const g = Math.round(fg + (tg - fg) * t);
  const b = Math.round(fb + (tb - fb) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
