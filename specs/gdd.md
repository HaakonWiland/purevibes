# PureVibes — Game Design Document

## Elevator Pitch

A Super Hexagon-inspired survival game where the player rotates around the center of a hexagonal arena, dodging walls that collapse inward. Simple controls, hypnotic visuals, punishing difficulty, one-more-try addiction.

---

## Core Loop

1. Walls spawn at the outer edge of the screen as hexagonal ring segments
2. Walls shrink toward the center at a constant (but escalating) speed
3. The player sits on a small orbit around the center point and rotates left/right to find gaps
4. Touching a wall = instant death
5. Survival time is the score
6. Restart is instant — death screen lasts < 1 second before you can retry

The entire experience is **continuous and rhythmic**. There are no levels, no pauses, no menus interrupting flow. The game gets harder the longer you survive.

---

## Controls

| Input | Action |
|---|---|
| `A` or `Left Arrow` | Rotate player counter-clockwise |
| `D` or `Right Arrow` | Rotate player clockwise |
| `Space` or `Enter` | Start game / Restart after death |
| `Escape` | Pause (optional — Super Hexagon doesn't pause) |

Movement is **continuous while held**, not discrete. Rotation speed is constant and tuned so the player can *just barely* thread gaps at high difficulty.

---

## Visual Identity

### Geometry
- The arena is a **regular hexagon** centered on screen
- All walls are segments of hexagonal rings (not circles)
- The center has a small **hexagonal player orbit marker**
- The player is a small triangle/arrow on the orbit, pointing outward

### Color & Style
- **Flat colors, no textures** — pure geometric minimalism
- **Two-tone palette** that shifts over time: background color + wall/foreground color
- Color palette rotates through phases (see Difficulty section)
- **The entire world rotates slowly** — the hexagonal grid itself spins, adding disorientation
- High contrast between walls and gaps at all times

### Palette Phases (examples)
| Phase | Background | Foreground | Mood |
|---|---|---|---|
| Phase 1 | Deep blue | Cyan | Calm entry |
| Phase 2 | Dark purple | Magenta | Rising tension |
| Phase 3 | Black | Red | Danger |
| Phase 4 | Dark teal | White | Transcendence |

### Screen Effects
- **World rotation**: the entire hex grid rotates CW/CCW, reversing direction periodically
- **Pulse/breathe**: the hex grid subtly scales in/out on a rhythm
- **Screen shake**: brief shake on death
- **Flash**: quick white flash on death before restart prompt

---

## Arena & Geometry

- The screen is dominated by a **centered hexagonal arena**
- The hexagon is oriented **flat-top** (one edge is horizontal at top and bottom)
- Walls are **arc segments** of concentric hexagonal rings
- Each ring has 6 sides; a wall segment occupies 1 or more consecutive sides
- A "gap" is one or more missing sides in a ring where the player can survive

### Coordinate System
- Everything is defined in **polar coordinates** relative to center: `(angle, radius)`
- The hexagon is divided into **6 sectors** of 60 degrees each (0-5)
- The player's position is an angle on a fixed orbit radius
- Walls are defined by: which sectors they occupy + their current radius

---

## Player

- Sits on a circular orbit at a fixed small radius from center (~15% of arena radius)
- Rendered as a **small equilateral triangle** pointing outward from center
- Rotation speed: **~180 degrees per second** at base (tunable)
- No acceleration/deceleration — movement is instant and linear
- Hitbox is generous to the player (slightly smaller than visual)

---

## Walls

### Structure
- A wall pattern is a **ring** (hexagonal) with some sectors filled and some open
- Minimum gap: **1 sector** (60 degrees) — the player must always be able to fit
- Walls spawn at the outer edge (off-screen or at arena boundary)
- Walls move **inward** toward center at a constant speed (per difficulty phase)

### Patterns
Patterns define which sectors are blocked in each ring. Examples:

| Pattern Name | Blocked Sectors | Gap |
|---|---|---|
| Single Gap | 5 of 6 blocked | 1 open |
| Double Gap | 4 of 6 blocked | 2 open (opposite) |
| Half Wall | 3 of 6 blocked (consecutive) | 3 open |
| Spiral | Alternating, offset each ring | Forces rotation |
| Corridor | Same gap position for several rings | Straight path |

Patterns are queued and can be **composed**: a spiral pattern is 4-6 rings where the gap rotates by 1 sector each ring, forcing the player to rotate continuously.

### Spawning
- New rings spawn at a fixed interval (time-based, decreasing with difficulty)
- Spawn interval starts at ~1.2 seconds, decreases to ~0.5 seconds at high difficulty
- Patterns are selected from a pool; harder patterns are introduced over time
- Randomness is constrained: every pattern must have at least 1 gap of at least 1 sector

---

## Difficulty Progression

Difficulty is a **continuous function of survival time**, not discrete levels. But there are named phases for the player's perception:

| Phase | Time | Wall Speed | Spawn Rate | World Rotation | New Patterns |
|---|---|---|---|---|---|
| POINT | 0-10s | Slow (base) | 1 ring/1.2s | Slow CW | Single gap, double gap, corridor |
| LINE | 10-30s | +20% | 1 ring/1.0s | Faster, reverses | Half wall, wider spiral |
| TRIANGLE | 30-60s | +40% | 1 ring/0.8s | Faster, pulses | Tight spiral, mixed |
| SQUARE | 60-120s | +60% | 1 ring/0.6s | Erratic reversals | All patterns, combos |
| PENTAGON | 120-180s | +80% | 1 ring/0.5s | Fast, disorienting | Rapid sequences |
| HEXAGON | 180s+ | +100% | 1 ring/0.4s | Maximum chaos | Everything, fastest |

The difficulty curve should feel **smooth**, not steppy. Values interpolate between phases.

### World Rotation Details
- The visible hex grid rotates independently of the player
- Direction reverses at semi-random intervals (more frequent at higher difficulty)
- This is purely visual disorientation — the player's controls are always absolute (A = CCW, D = CW in screen space)

---

## Scoring

- **Score = survival time** displayed as seconds with 1 decimal (e.g., "23.4")
- Displayed prominently at top of screen during gameplay
- On death: show final time + best time
- Best time persisted in localStorage

### Milestones
- Each phase name appears briefly on screen when reached ("TRIANGLE", etc.)
- Reaching HEXAGON (180s) could trigger a visual celebration / "you win" state

---

## Audio

### Music
- Fast-paced electronic/chiptune track
- BPM should complement the base spawn rate (~140-170 BPM)
- Music starts immediately on game start, resets on death
- If possible: music playback speed increases slightly with difficulty

### Sound Effects
| Event | Sound |
|---|---|
| Game start | Short synth stab |
| Death | Low impact thud + static burst |
| Phase transition | Rising chime / pitch shift |
| Near miss (optional) | Subtle tick |

---

## UI

### Title Screen
- Game title "PUREVIBES" in geometric font, centered
- The hexagonal arena animates in the background (walls moving but no player)
- "PRESS SPACE TO START" pulsing text
- Best time displayed below

### In-Game HUD
- Timer (top center)
- Phase name (brief flash on transition)
- Nothing else — minimal distraction

### Death Screen
- Brief white flash
- "GAME OVER" text
- Final time + best time
- "SPACE TO RESTART" — appears after ~0.5s delay to prevent accidental skip
- Transition back to gameplay is instant

---

## Technical Approach

- **HTML5 Canvas** — no framework, pure rendering control
- **Vanilla JavaScript/TypeScript** — zero dependencies for the game itself
- **requestAnimationFrame** game loop with delta-time
- **Web Audio API** for sound
- Single `index.html` entry point, deployable anywhere

---

## Scope & Priorities

### Must Have (MVP)
- [ ] Hexagonal arena rendering
- [ ] Player rotation with A/D
- [ ] Wall spawning and inward movement
- [ ] Collision detection (player vs walls)
- [ ] Death + instant restart
- [ ] Timer/score display
- [ ] 3+ wall patterns
- [ ] Difficulty escalation (speed + spawn rate)
- [ ] World rotation visual effect

### Should Have
- [ ] Color phase transitions
- [ ] All 6 difficulty phases with distinct feel
- [ ] 5+ wall patterns including spirals
- [ ] Best time persistence (localStorage)
- [ ] Screen effects (shake, flash, pulse)
- [ ] Title screen

### Nice to Have
- [ ] Audio (music + SFX)
- [ ] Near-miss feedback
- [ ] Mobile touch controls
- [ ] Particle effects on death
- [ ] Leaderboard (local)

---

## Open Questions

1. **Should controls be screen-relative or world-relative?** — Screen-relative (A always goes left on screen) is more intuitive even when the world rotates. Super Hexagon does screen-relative. Recommend: screen-relative.

2. **Flat-top or pointy-top hexagon?** — Flat-top (horizontal edge on top/bottom) feels more natural for a landscape screen. Recommend: flat-top.

3. **Should the player orbit be circular or hexagonal?** — Circular orbit is smoother for continuous movement. Hexagonal orbit matches the aesthetic but feels choppy. Recommend: circular orbit.

4. **Pause functionality?** — Super Hexagon has no pause. Do we want one? Recommend: no pause for purity, but Escape could return to title.

5. **Target frame rate?** — 60fps minimum. Should we target 120fps+ for smoothness? Recommend: uncapped with delta-time, smooth on any refresh rate.
