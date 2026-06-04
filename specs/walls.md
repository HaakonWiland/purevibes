# Feature Spec: Walls

## Overview

Walls are hexagonal ring segments that spawn at the outer edge of the arena and move inward toward the center. They are the core obstacle. Each wall is defined by which sectors it blocks and its current radial position. Walls are organized into **patterns** — predefined sequences of rings that create recognizable challenges.

## Wall Structure

A single wall ring is:
```
{
  sectors: boolean[6]    // true = blocked, false = gap
  radius: number         // current distance from center (shrinks over time)
  thickness: number      // radial thickness in pixels
}
```

### Constraints
- Every ring **must have at least 1 gap** (at least one sector is `false`)
- A gap is always at least 1 full sector wide (60 degrees)
- Walls are drawn as filled trapezoids per blocked sector (see core-geometry spec)

## Movement

- Walls move **inward** at a constant speed (per difficulty phase)
- Base inward speed: `arenaRadius * 0.35` pixels/second
  - At base speed, a wall takes ~2.85 seconds to travel from arena edge to center
- Speed increases with difficulty (see difficulty spec)
- Movement is applied each frame: `wall.radius -= wallSpeed * deltaTime`

### Lifecycle
1. **Spawn**: wall appears at `radius = arenaRadius + wall.thickness` (just off-screen)
2. **Active**: wall moves inward, collision is checked against player
3. **Destroy**: wall is removed when `radius + thickness < 0` (fully past center)

## Patterns

A pattern is a **sequence of rings** with predefined sector layouts and spacing. Patterns are the unit of level design — they create the recognizable "moves" the player must execute.

### Pattern Definition
```
{
  name: string
  rings: Array<{
    sectors: boolean[6]    // which sectors are blocked
    delay: number          // time offset from pattern start (seconds)
  }>
}
```

### Core Patterns (MVP)

#### 1. Single Gap
One ring with 5 blocked sectors, 1 gap. Tests positioning.
```
Ring: [true, true, true, true, true, false]  // gap in sector 5
```
Gap position rotates between instances.

#### 2. Double Gap
One ring with 4 blocked sectors, 2 opposite gaps. Gives the player choice.
```
Ring: [true, true, false, true, true, false]  // gaps in sectors 2 and 5
```

#### 3. Corridor
3-4 consecutive rings with the gap in the **same sector**. Tests patience (hold position).
```
Ring 1: [true, true, true, false, true, true]  delay: 0.0s
Ring 2: [true, true, true, false, true, true]  delay: 0.4s
Ring 3: [true, true, true, false, true, true]  delay: 0.4s
```

#### 4. Spiral (CW)
4-6 rings where the gap rotates by +1 sector each ring. Forces continuous clockwise rotation.
```
Ring 1: gap at sector 0, delay: 0.0s
Ring 2: gap at sector 1, delay: 0.4s
Ring 3: gap at sector 2, delay: 0.4s
Ring 4: gap at sector 3, delay: 0.4s
```

#### 5. Spiral (CCW)
Same as spiral CW but gap rotates by -1 sector. Forces counter-clockwise rotation.

#### 6. Half Wall
3 consecutive sectors blocked, 3 open. Easy breather pattern.
```
Ring: [true, true, true, false, false, false]
```

### Advanced Patterns (Post-MVP)

#### 7. Zigzag
Alternating gap positions: sector 0, sector 3, sector 0, sector 3...

#### 8. Squeeze
Two rings close together with gaps on opposite sides. Forces a quick 180-degree move.

#### 9. Staircase
Like spiral but gap jumps by 2 sectors each ring instead of 1.

#### 10. Chaos
Random valid ring (at least 1 gap, at least 2 blocked).

## Pattern Selection

### Queue System
- A pattern queue feeds rings into the game
- When the queue runs low (< 2 rings remaining), a new pattern is selected and appended
- Pattern selection is **weighted random** based on current difficulty phase

### Difficulty-Based Weights

| Pattern | POINT | LINE | TRIANGLE | SQUARE+ |
|---|---|---|---|---|
| Single Gap | 30% | 20% | 15% | 10% |
| Double Gap | 30% | 20% | 10% | 5% |
| Corridor | 20% | 20% | 15% | 15% |
| Half Wall | 20% | 15% | 10% | 5% |
| Spiral CW | 0% | 15% | 20% | 20% |
| Spiral CCW | 0% | 10% | 15% | 20% |
| Zigzag | 0% | 0% | 10% | 15% |
| Squeeze | 0% | 0% | 5% | 10% |

### Gap Rotation
- When a pattern is selected, the gap position is **randomly rotated** (0-5 sectors offset)
- This prevents the player from memorizing absolute positions
- The rotation is applied uniformly to all rings in the pattern

## Spawning

- Rings spawn based on their pattern's `delay` timing
- The delay between patterns is: `patternGap` (starts at 0.8s, decreases with difficulty)
- A spawn timer tracks when the next ring should appear
- Multiple rings can exist simultaneously (overlapping at different radii)

### Max Active Walls
- No hard limit, but practically 8-15 rings on screen at once at high difficulty
- Walls past center are immediately removed from the active list

## Rendering

- Each blocked sector in a ring is drawn as a trapezoid (see core-geometry)
- Wall color: foreground color from current palette
- All walls rotate with `worldRotation`
- Walls should have a subtle edge/outline for visual clarity (1px darker border)

## Acceptance Criteria

- [ ] Walls spawn outside the arena and move smoothly inward
- [ ] Walls are rendered as correct hexagonal ring segments
- [ ] Each ring always has at least 1 gap
- [ ] At least 6 distinct patterns exist and are recognizable
- [ ] Patterns queue and transition smoothly (no visible gap between patterns)
- [ ] Gap positions are randomly rotated per pattern instance
- [ ] Walls are destroyed after passing the center
- [ ] Wall speed increases with difficulty
- [ ] Multiple walls can be on screen simultaneously without visual issues
- [ ] Walls rotate with world rotation

## Open Questions

None.
