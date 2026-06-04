# Feature Spec: Core Geometry

## Overview

The foundational rendering and coordinate system for the hexagonal arena. Everything in the game — player, walls, effects — is positioned and drawn relative to this system. The arena is a flat-top regular hexagon centered on the canvas.

## Coordinate System

### Center Origin
- All positions are relative to the canvas center `(cx, cy)`
- The center point is recalculated on canvas resize

### Polar Coordinates
- Every game object is defined by `(angle, radius)` relative to center
- **Angle**: measured in radians, 0 = right (3 o'clock), increases counter-clockwise
- **Radius**: distance from center in pixels

### Sectors
- The hexagon divides the plane into **6 sectors**, each spanning 60 degrees (PI/3 radians)
- Sector 0 starts at angle 0 (right) and goes CCW to PI/3
- Sector numbering: 0-5, counter-clockwise
- Sector boundaries align with hexagon vertices

```
Sector layout (flat-top hexagon):

        ___________
       /  1  |  0  \
      /      |      \
     /  2    +    5  \
      \      |      /
       \  3  |  4  /
        \____|____/
```

## Hexagon Geometry

### Flat-Top Orientation
- A flat-top hexagon has horizontal edges at top and bottom
- Vertices are at angles: 0, 60, 120, 180, 240, 300 degrees from center

### Vertex Calculation
For a hexagon with center `(cx, cy)` and radius `r`:
```
vertex[i].x = cx + r * cos(i * PI/3)
vertex[i].y = cy + r * sin(i * PI/3)
```
Where `i` = 0..5

### Drawing a Hexagonal Ring Segment
A wall segment occupying sector `s` between inner radius `r1` and outer radius `r2`:
1. Calculate the 4 corner points:
   - Inner-start: `(r1, s * PI/3)`
   - Inner-end: `(r1, (s+1) * PI/3)`
   - Outer-start: `(r2, s * PI/3)`
   - Outer-end: `(r2, (s+1) * PI/3)`
2. Draw as a quadrilateral (trapezoid) connecting these 4 points
3. The inner and outer edges follow the hexagonal shape (straight lines, not arcs)

### Arena Sizing
- The arena hexagon radius = `min(canvasWidth, canvasHeight) * 0.45`
- This ensures the hex fits on screen with margin
- Walls spawn just outside this radius and are culled when they pass the player orbit

## Canvas Setup

### Sizing
- Canvas fills the full browser viewport
- Resizes on window resize
- All coordinates recalculated from center on resize

### Rendering
- Clear canvas each frame
- Draw order (back to front):
  1. Background fill (solid color)
  2. Arena guide lines (optional, faint hex grid)
  3. Walls
  4. Center hexagon marker
  5. Player
  6. UI overlay (timer, phase name)

### World Rotation
- A global `worldRotation` angle is applied to everything except UI
- All game object angles are offset by `worldRotation` before rendering
- This creates the spinning visual effect
- `worldRotation` changes over time (see difficulty spec)

## Core Constants

| Constant | Value | Notes |
|---|---|---|
| `SECTOR_COUNT` | 6 | Always 6 for hexagon |
| `SECTOR_ANGLE` | PI/3 (~1.047 rad) | 60 degrees |
| `ARENA_SCALE` | 0.45 | Arena radius as fraction of min(w,h) |
| `CENTER_HEX_SCALE` | 0.08 | Center marker radius as fraction of arena |
| `PLAYER_ORBIT_SCALE` | 0.12 | Player orbit radius as fraction of arena |
| `WALL_THICKNESS` | 20px | Radial thickness of wall segments (base) |

## Key Functions Needed

### `hexVertex(cx, cy, radius, vertexIndex)`
Returns the (x, y) position of a hexagon vertex.

### `sectorToAngle(sector)`
Returns the starting angle of a sector.

### `angleToSector(angle)`
Returns which sector an angle falls in.

### `drawHexagon(cx, cy, radius, rotation)`
Draws a regular hexagon outline or fill.

### `drawWallSegment(cx, cy, innerR, outerR, sectorStart, sectorEnd, rotation)`
Draws a filled trapezoid representing a wall in the given sectors.

### `worldToScreen(angle, radius, worldRotation)`
Converts polar game coordinates to canvas pixel coordinates, applying world rotation.

## Acceptance Criteria

- [ ] Canvas fills viewport and resizes correctly
- [ ] A hexagon renders centered on screen with correct flat-top orientation
- [ ] A small center hexagon marker renders at the center
- [ ] Wall segments render as correct trapezoids within sectors
- [ ] World rotation visually spins all game elements (not UI)
- [ ] Sector boundaries align with hexagon vertices
- [ ] All rendering uses delta-time, no frame-rate dependency
- [ ] No visual artifacts at hexagon edges (clean joins between sectors)

## Open Questions

None — this is foundational and well-defined.
