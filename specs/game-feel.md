# Feature Spec: Game Feel

## Overview

Game feel is what separates a functional game from a compelling one. This spec covers the visual effects, color system, screen effects, and "juice" that make PureVibes hypnotic and addictive. These are not cosmetic extras — they are core to the experience.

## Color System

### Two-Tone Palette
At any moment, the game uses exactly **two colors**: a background color and a foreground color. Walls, player, and center hex use the foreground. Everything else is background.

### Phase Palettes

| Phase | Background | Foreground | Hex Code (BG) | Hex Code (FG) |
|---|---|---|---|---|
| POINT | Deep navy | Cyan | #0a0a2e | #00e5ff |
| LINE | Dark purple | Magenta | #1a0a2e | #ff00ff |
| TRIANGLE | Dark red | Orange | #2e0a0a | #ff6600 |
| SQUARE | Black | Red | #0a0a0a | #ff0033 |
| PENTAGON | Dark teal | White | #0a2e2e | #ffffff |
| HEXAGON | Pure black | Hot pink | #000000 | #ff1493 |

### Color Transitions
- When a phase changes, colors **lerp over 2 seconds** to the new palette
- Both background and foreground interpolate independently
- Use RGB lerp (not HSL) for predictable transitions

### Alternating Wall Colors
- Consecutive wall rings alternate between **foreground** and a **slightly darker variant** of foreground
- This creates visual depth and makes it easier to track individual walls
- Dark variant: foreground color at 60% brightness

## World Rotation

### Behavior
- The entire game view (walls, center hex, player) rotates around the center
- UI elements (timer, phase text) do NOT rotate
- Rotation is applied as a single `worldRotation` angle offset

### Feel
- At POINT phase: slow, steady clockwise rotation (0.3 rad/s)
- Direction reversals are **instant** (snap, not gradual) — this is disorienting by design
- When direction reverses, there is a brief (~100ms) **screen flash** (foreground color at 10% opacity)

## Pulse / Breathe Effect

### Center Hex Pulse
- The center hexagon scales up and down subtly on a sine wave
- Amplitude: +/- 10% of base size
- Frequency: ~1.5 Hz (roughly matching a fast heartbeat)
- This gives the center a "living" feel

### Arena Breathe
- The entire arena scale oscillates very subtly: +/- 2%
- Same frequency as center pulse but offset by PI/2 (quarter phase)
- Creates a sense of the world "breathing"

## Screen Shake

### On Death
- Duration: 300ms
- Intensity: 8px random offset per frame, decaying linearly to 0
- Applied to the entire canvas translation (everything shakes together)

### Implementation
```
shakeOffset.x = (Math.random() - 0.5) * shakeIntensity * 2
shakeOffset.y = (Math.random() - 0.5) * shakeIntensity * 2
shakeIntensity = max(0, shakeIntensity - decayRate * deltaTime)
```

## Screen Flash

### On Death
- Full-screen white flash at 80% opacity
- Fades to 0% over 200ms
- Drawn as an overlay on top of everything

### On Direction Reversal
- Full-screen foreground color flash at 15% opacity
- Fades over 100ms
- Subtle enough to not be disruptive but signals the change

## Phase Transition Effect

When a new phase begins:
1. Phase name appears in large centered text (foreground color)
2. Text font: bold, geometric/monospace, ~15% of canvas height
3. Text fades out over 1.5 seconds (opacity 1.0 → 0.0)
4. Color palette begins transitioning simultaneously

## Speed Lines (Post-MVP)

- At SQUARE phase and above, faint radial lines emanate from center
- Lines move outward (opposite of wall direction) creating a speed illusion
- Opacity increases with difficulty
- Drawn behind walls, above background

## Near-Miss Feedback (Post-MVP)

When the player passes through a gap with minimal clearance:
- A brief bright flash on the gap edges
- Subtle "whoosh" visual (streak along the gap)
- Threshold: player hitbox within 150% of collision distance

## Rendering Order (Updated)

1. Background fill
2. Speed lines (if active)
3. Arena breathe transform
4. Walls (alternating colors)
5. Center hex (pulsing)
6. Player
7. Screen flash overlay
8. UI (timer, phase name) — not affected by world rotation or shake
9. Apply screen shake to layers 1-7

## Acceptance Criteria

- [ ] Two-tone color palette is clearly visible and readable at all phases
- [ ] Color transitions between phases are smooth (no flicker or jump)
- [ ] World rotation creates genuine disorientation at higher phases
- [ ] Direction reversals are sudden and accompanied by a subtle flash
- [ ] Center hex pulses visibly but not distractingly
- [ ] Screen shakes on death — feels impactful
- [ ] White flash on death is brief and dramatic
- [ ] Phase names display large and fade out smoothly
- [ ] Alternating wall colors make individual rings distinguishable
- [ ] All effects run at 60fps without performance degradation

## Open Questions

None.
