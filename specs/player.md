# Feature Spec: Player

## Overview

The player is a small triangle sitting on a fixed circular orbit around the center of the hexagonal arena. The player rotates left/right along this orbit using A/D keys. The player's position is defined entirely by a single value: their current angle.

## Position

- The player orbits at a fixed radius: `PLAYER_ORBIT_SCALE * arenaRadius`
- Position is stored as a single float: `playerAngle` (radians)
- The player does **not** move inward or outward — only rotates
- The orbit is **circular** (smooth movement), not hexagonal

## Input

| Key | Action |
|---|---|
| `A` or `ArrowLeft` | Rotate counter-clockwise (angle increases) |
| `D` or `ArrowRight` | Rotate clockwise (angle decreases) |

### Input Behavior
- Movement is **continuous while key is held** — not press-to-step
- **No acceleration or deceleration** — full speed instantly on press, full stop on release
- Both keys can be held simultaneously — they cancel out (no movement)
- Input is **screen-relative**: A always moves the player visually left, regardless of world rotation
- To achieve screen-relative input: apply rotation in the **opposite direction** of world rotation

### Rotation Speed
- Base rotation speed: **4.0 radians/second** (~229 degrees/second)
- This means the player can do a full rotation in ~1.57 seconds
- Speed is constant — it does not change with difficulty
- Tuning note: the player must be able to reach any sector from any other sector before a wall arrives at the orbit. At base wall speed, a wall takes ~3s to reach center. Player needs < 0.5s to cross 1 sector (60 deg). At 229 deg/s, crossing 1 sector takes ~0.26s. This gives enough margin.

## Rendering

### Shape
- An **equilateral triangle** pointing outward from center
- Triangle size: ~10px side length (scales with arena)
- The triangle's "tip" points away from center (radially outward)
- Positioned at `(playerAngle, orbitRadius)` in polar coordinates

### Drawing
1. Calculate player screen position from `(playerAngle + worldRotation, orbitRadius)`
2. Calculate the outward direction (angle from center to player)
3. Draw equilateral triangle rotated so one vertex points in that direction
4. Fill with a bright/contrasting color (white or highlight color from current palette)

### Visual Size
- Triangle circumradius: `arenaRadius * 0.04` (4% of arena)
- Should be clearly visible but not dominant

## Hitbox

- The collision hitbox is a **circle** centered on the player's position
- Hitbox radius: `arenaRadius * 0.02` (slightly smaller than visual)
- Generous to the player — near-misses should feel fair
- Collision is checked against wall segments (see collision spec)

## State

```
playerAngle: number     // current angle in radians, 0 = right
playerAlive: boolean    // false after collision, true on restart
```

## Edge Cases

- `playerAngle` wraps around: always normalized to [0, 2*PI)
- On death: player position freezes, input is ignored
- On restart: player resets to angle 0 (pointing right) or top-center

## Acceptance Criteria

- [ ] Player renders as a triangle on the orbit ring
- [ ] Holding A rotates smoothly counter-clockwise
- [ ] Holding D rotates smoothly clockwise
- [ ] Releasing key stops movement instantly (no drift)
- [ ] Pressing both keys simultaneously results in no movement
- [ ] Movement speed feels responsive — can dodge walls with quick reactions
- [ ] Player rotation is screen-relative even when world is spinning
- [ ] Player angle wraps correctly (no jumps or glitches at 0/2PI boundary)
- [ ] Hitbox is smaller than visual — near-misses feel fair

## Open Questions

None.
