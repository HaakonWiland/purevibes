# Feature Spec: Collision Detection

## Overview

Collision detection determines when the player touches a wall, triggering death. The system must be **accurate but forgiving** — near-misses should feel fair, not frustrating. The check runs every frame against all active walls.

## Collision Model

### Player Hitbox
- A **circle** centered on the player's position
- Radius: `arenaRadius * 0.02` (about half the visual triangle size)
- Position: `(playerAngle + worldRotation, orbitRadius)` converted to cartesian

### Wall Hitbox
- Each blocked sector in a ring is a **trapezoid** defined by:
  - Inner radius: `wall.radius`
  - Outer radius: `wall.radius + wall.thickness`
  - Start angle: `sectorIndex * PI/3 + worldRotation`
  - End angle: `(sectorIndex + 1) * PI/3 + worldRotation`

## Detection Algorithm

For each active wall ring, for each blocked sector in that ring:

### Step 1: Radial Check (fast rejection)
```
playerRadius = orbitRadius
wallInner = wall.radius
wallOuter = wall.radius + wall.thickness

if (playerRadius + hitboxRadius < wallInner) → skip (wall hasn't reached player yet)
if (playerRadius - hitboxRadius > wallOuter) → skip (wall already past player)
```
This eliminates most walls cheaply since only 1-2 walls will be near the player orbit at any time.

### Step 2: Angular Check
If the radial check passes, check if the player's angle falls within a blocked sector:
```
playerAngle = normalizeAngle(player.angle + worldRotation)
sectorStart = normalizeAngle(sectorIndex * PI/3 + worldRotation)
sectorEnd = normalizeAngle((sectorIndex + 1) * PI/3 + worldRotation)

// Account for hitbox angular width at the orbit radius
angularHitbox = hitboxRadius / orbitRadius
playerStart = playerAngle - angularHitbox
playerEnd = playerAngle + angularHitbox

if (angularOverlap(playerStart, playerEnd, sectorStart, sectorEnd)) → COLLISION
```

### Step 3: Handle Angle Wrapping
- All angle comparisons must handle the 0/2PI boundary
- Use a `normalizeAngle()` function that keeps angles in [0, 2PI)
- Angular overlap check must account for ranges that cross the 0 boundary

## Forgiveness Tuning

The hitbox is deliberately smaller than the visual to create "near-miss" moments:

| Element | Visual Size | Hitbox Size |
|---|---|---|
| Player | ~4% of arena radius | ~2% of arena radius |
| Wall sector edge | Sharp edge | No extra padding |

The net effect: the player's triangle can visually overlap a wall edge by ~2% of arena radius without dying. This feels fair and exciting.

## Performance

- Collision check runs **every frame** in the game loop
- The radial check (Step 1) rejects 90%+ of walls immediately
- Worst case: 2-3 walls near the orbit, 5-6 sectors each = 10-18 angular checks per frame
- This is trivially fast — no spatial indexing needed

## Death Trigger

When collision is detected:
1. Set `playerAlive = false`
2. Record final time as score
3. Trigger death effects (see game-feel spec)
4. Stop wall spawning and movement
5. Freeze game state (walls stay where they are)

## Acceptance Criteria

- [ ] Player dies when touching a wall segment
- [ ] Player survives when passing through a gap
- [ ] Near-misses (visual overlap at edges) do not kill the player
- [ ] Collision works correctly when world is rotating
- [ ] Collision works correctly at the 0/2PI angle boundary
- [ ] No false positives (death in a gap)
- [ ] No false negatives (surviving inside a wall)
- [ ] Collision detection runs at 60fps without performance issues

## Open Questions

None.
