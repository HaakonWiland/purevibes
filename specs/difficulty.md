# Feature Spec: Difficulty Progression

## Overview

Difficulty is a continuous function of survival time. The game gets harder by increasing wall speed, spawn rate, and world rotation intensity. Named phases give the player a sense of progression, but the underlying values interpolate smoothly.

## Phases

| Phase | Name | Start Time | End Time |
|---|---|---|---|
| 0 | POINT | 0s | 10s |
| 1 | LINE | 10s | 30s |
| 2 | TRIANGLE | 30s | 60s |
| 3 | SQUARE | 60s | 120s |
| 4 | PENTAGON | 120s | 180s |
| 5 | HEXAGON | 180s | forever |

## Parameters That Scale

### Wall Speed (inward movement)

Base speed: `arenaRadius * 0.35` px/s

| Phase | Multiplier | Effective Time to Reach Center |
|---|---|---|
| POINT | 1.0x | ~2.85s |
| LINE | 1.2x | ~2.38s |
| TRIANGLE | 1.4x | ~2.04s |
| SQUARE | 1.6x | ~1.78s |
| PENTAGON | 1.8x | ~1.58s |
| HEXAGON | 2.0x | ~1.43s |

Between phases, the multiplier **lerps linearly** based on elapsed time within the phase.

### Spawn Rate (time between rings)

| Phase | Delay Between Rings |
|---|---|
| POINT | 1.2s |
| LINE | 1.0s |
| TRIANGLE | 0.8s |
| SQUARE | 0.6s |
| PENTAGON | 0.5s |
| HEXAGON | 0.4s |

Also lerps smoothly between phases.

### World Rotation Speed

| Phase | Rotation Speed | Direction Changes |
|---|---|---|
| POINT | 0.3 rad/s | None (steady CW) |
| LINE | 0.5 rad/s | Every ~8s |
| TRIANGLE | 0.7 rad/s | Every ~5s |
| SQUARE | 0.9 rad/s | Every ~3s |
| PENTAGON | 1.1 rad/s | Every ~2s |
| HEXAGON | 1.3 rad/s | Every ~1.5s |

Direction reversal is a sudden flip (not gradual). The timing is semi-random: base interval +/- 30% random variance.

### Pattern Pool

See walls spec for the full weight table. In summary:
- POINT: only simple patterns (single gap, double gap, corridor, half wall)
- LINE: introduces spirals
- TRIANGLE: introduces zigzag and squeeze
- SQUARE+: all patterns available, harder patterns weighted higher

## Interpolation

All values use **linear interpolation** between phase boundaries:

```
function getDifficultyValue(time, phaseStarts, phaseValues) {
  // Find which phase we're in
  // Lerp between current phase value and next phase value
  // based on time position within current phase
  // Clamp at final phase value
}
```

This prevents jarring jumps when transitioning between phases.

## Phase Announcements

When the player crosses a phase boundary:
1. The phase name flashes on screen in large text (e.g., "TRIANGLE")
2. Text fades out over ~1.5 seconds
3. The color palette begins transitioning to the new phase's colors (see game-feel spec)

## State

```
elapsedTime: number         // seconds since game start
currentPhase: number        // 0-5 index
wallSpeedMultiplier: number // current interpolated multiplier
spawnDelay: number          // current interpolated spawn delay
worldRotSpeed: number       // current interpolated rotation speed
nextDirectionChange: number // time of next rotation reversal
```

## Reset

On game restart, all difficulty state resets:
- `elapsedTime = 0`
- `currentPhase = 0`
- All multipliers return to base values
- World rotation resets to slow CW

## Acceptance Criteria

- [ ] Difficulty increases smoothly over time (no sudden jumps)
- [ ] Phase names display correctly at transition points
- [ ] Wall speed is noticeably faster at TRIANGLE than POINT
- [ ] Spawn rate increases are perceptible but not overwhelming
- [ ] World rotation direction reverses at semi-random intervals
- [ ] Direction reversals become more frequent at higher phases
- [ ] Reaching 180s feels like a genuine achievement
- [ ] The game at HEXAGON phase is very difficult but not impossible
- [ ] All difficulty state resets cleanly on restart

## Open Questions

None.
