# Feature Spec: Audio

## Overview

Audio reinforces the hypnotic, rhythmic feel of the game. A driving electronic track plays during gameplay, and short sound effects punctuate key events. Audio is a "should have" — the game must work perfectly without it, but audio elevates the experience significantly.

## Music

### Style
- Fast-paced electronic / synthwave / chiptune
- BPM: 140-170 (matches the game's intensity)
- Looping seamlessly — the track plays continuously during a run

### Behavior
- Music starts on first player input (game start) — not on page load (browser autoplay policy)
- Music resets to the beginning on death/restart
- Music plays at consistent volume throughout

### Implementation
- Use **Web Audio API** for precise control
- Load a single audio file (MP3 or OGG)
- For MVP: use a royalty-free track or generate one
- Music file should be small (< 2MB) for fast loading

### Stretch: Tempo Scaling
- At higher difficulty phases, playback rate increases slightly:
  - POINT: 1.0x
  - HEXAGON: 1.15x
- This subtly increases tension without being obvious

## Sound Effects

All SFX are short (< 500ms) and synthesized via Web Audio API (no files needed).

### Game Start
- **Trigger**: Space pressed on title screen
- **Sound**: Short ascending synth sweep (100Hz → 800Hz over 150ms)
- **Character**: Energetic, "let's go"

### Death
- **Trigger**: Player collides with wall
- **Sound**: Low impact thud (80Hz sine, 200ms, fast decay) + brief noise burst (50ms white noise)
- **Character**: Abrupt, final

### Phase Transition
- **Trigger**: Entering a new difficulty phase
- **Sound**: Rising chime — three quick ascending tones (e.g., C5, E5, G5, 50ms each)
- **Character**: Achievement, escalation

### Direction Reversal (optional)
- **Trigger**: World rotation reverses direction
- **Sound**: Quick "whomp" — low pitch bend down (300Hz → 100Hz, 100ms)
- **Character**: Disorienting, sudden

## Synthesized SFX Approach

Instead of loading audio files, generate sounds programmatically:

```
// Example: death sound
function playDeathSound(audioCtx) {
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.frequency.value = 80
  osc.type = 'sine'
  gain.gain.setValueAtTime(0.5, audioCtx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2)
  osc.connect(gain).connect(audioCtx.destination)
  osc.start()
  osc.stop(audioCtx.currentTime + 0.2)
}
```

This eliminates audio file dependencies entirely.

## Audio Context

- Create a single `AudioContext` on first user interaction
- Reuse it for all sounds
- Handle browser autoplay restrictions: create/resume context only after a click or keypress

## Volume

- Master volume: 0.5 (50%) — not too loud by default
- SFX volume: relative to master
- No volume controls in MVP (could add later)

## Mute

- `M` key toggles mute on/off
- Mute state persisted in localStorage
- When muted: music pauses, SFX don't play
- Visual indicator: small speaker icon in corner (muted = crossed out)

## Acceptance Criteria

- [ ] SFX play on game start, death, and phase transition
- [ ] SFX are synthesized — no audio files required for base game
- [ ] Audio context is created on first user input (no autoplay issues)
- [ ] Music plays during gameplay (when a track is provided)
- [ ] Music resets on death/restart
- [ ] M key toggles mute
- [ ] Game works perfectly with audio muted or if Web Audio is unavailable
- [ ] No audio lag or glitches during gameplay
- [ ] Sound effects are short and non-intrusive

## Open Questions

1. **Should we generate a chiptune track procedurally?** This is technically possible with Web Audio API but complex. Recommend: use a royalty-free track for now, procedural generation as a stretch goal.
