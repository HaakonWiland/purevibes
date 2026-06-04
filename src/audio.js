let audioCtx = null;
let muted = false;
let musicBuffer = null;
let musicSource = null;
let musicGain = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export async function initAudio() {
  muted = localStorage.getItem('purevibes_muted') === 'true';
  try {
    const resp = await fetch('audio/techno_loop_pico8.wav');
    const arrayBuf = await resp.arrayBuffer();
    const ctx = getCtx();
    musicBuffer = await ctx.decodeAudioData(arrayBuf);
  } catch (e) {
    console.warn('Could not load music:', e);
  }
}

export function toggleMute() {
  muted = !muted;
  localStorage.setItem('purevibes_muted', muted);
  if (musicGain) {
    musicGain.gain.value = muted ? 0 : 0.5;
  }
  return muted;
}

export function isMuted() {
  return muted;
}

export function startMusic() {
  stopMusic();
  if (!musicBuffer) return;
  const ctx = getCtx();
  musicSource = ctx.createBufferSource();
  musicSource.buffer = musicBuffer;
  musicSource.loop = true;
  musicGain = ctx.createGain();
  musicGain.gain.value = muted ? 0 : 0.5;
  musicSource.connect(musicGain).connect(ctx.destination);
  musicSource.start(0);
}

export function stopMusic() {
  if (musicSource) {
    try { musicSource.stop(); } catch (_) {}
    musicSource = null;
  }
}

export function playStartSound() {
  if (muted) return;
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

export function playDeathSound() {
  if (muted) return;
  const ctx = getCtx();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 80;
  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);

  const bufferSize = ctx.sampleRate * 0.05;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }
  const noise = ctx.createBufferSource();
  const noiseGain = ctx.createGain();
  noise.buffer = buffer;
  noiseGain.gain.setValueAtTime(0.3, ctx.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
  noise.connect(noiseGain).connect(ctx.destination);
  noise.start();
  noise.stop(ctx.currentTime + 0.08);
}

export function playPhaseSound() {
  if (muted) return;
  const ctx = getCtx();
  const notes = [523, 659, 784];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    const t = ctx.currentTime + i * 0.07;
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  });
}
