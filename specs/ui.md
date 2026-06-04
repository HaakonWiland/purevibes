# Feature Spec: UI

## Overview

The UI is minimal by design. Three screens exist: title, gameplay HUD, and death overlay. Transitions between them are fast. No menus, no settings screens, no complexity. The goal is zero friction between "I want to play" and "I am playing."

## Screens

### Title Screen

**Layout:**
```
┌─────────────────────────────────┐
│                                 │
│                                 │
│          PUREVIBES              │
│                                 │
│       PRESS SPACE TO START      │
│                                 │
│         BEST: 42.3s             │
│                                 │
│                                 │
└─────────────────────────────────┘
```

**Elements:**
- **Title**: "PUREVIBES" in large geometric/monospace font, centered
  - Color: foreground color (from POINT phase palette)
  - Size: ~10% of canvas height
- **Start prompt**: "PRESS SPACE TO START" below title
  - Pulses opacity: sine wave between 0.3 and 1.0, period ~2s
  - Size: ~4% of canvas height
- **Best time**: "BEST: XX.Xs" below prompt (only shown if a best time exists)
  - Size: ~3% of canvas height
  - Color: foreground at 70% opacity

**Background:**
- The hexagonal arena animates behind the text — walls spawn and collapse inward
- No player visible
- World rotation active at POINT speed
- Color palette: POINT phase

**Input:**
- `Space` or `Enter` → start game
- No other inputs on this screen

### Gameplay HUD

**Layout:**
```
┌─────────────────────────────────┐
│            12.4                 │
│                                 │
│                                 │
│         [game arena]            │
│                                 │
│                                 │
│                                 │
└─────────────────────────────────┘
```

**Elements:**
- **Timer**: top center, shows elapsed time with 1 decimal place
  - Format: "0.0" → "9.9" → "10.0" → "123.4"
  - Size: ~5% of canvas height
  - Color: foreground color, 80% opacity
  - Font: monospace to prevent width jitter as digits change
  - Does NOT rotate with world — always upright

- **Phase name** (transient): appears centered on screen when a new phase starts
  - Large text: ~12% of canvas height
  - Fades from opacity 1.0 → 0.0 over 1.5 seconds
  - Color: foreground color
  - Appears above the game (not affected by world rotation)

### Death Screen (Overlay)

**Layout:**
```
┌─────────────────────────────────┐
│                                 │
│          GAME OVER              │
│                                 │
│          TIME: 23.4s            │
│          BEST: 42.3s            │
│                                 │
│       PRESS SPACE TO RESTART    │
│                                 │
│                                 │
└─────────────────────────────────┘
```

**Behavior:**
1. On death: screen flash (see game-feel spec)
2. After flash clears (~200ms): "GAME OVER" appears
3. After 300ms: time and best time appear
4. After 500ms: "PRESS SPACE TO RESTART" appears and starts pulsing
5. The game arena is frozen behind the text (walls and player visible where they died)
6. Background dims slightly (overlay at 30% opacity black)

**Elements:**
- **"GAME OVER"**: large centered text, ~8% of canvas height
- **Time**: "TIME: XX.Xs" — final survival time
- **Best time**: "BEST: XX.Xs" — updates if current run is a new record
- **New record indicator**: if best time is beaten, show "NEW BEST!" in a highlight color
- **Restart prompt**: "PRESS SPACE TO RESTART" — pulsing opacity, same as title

**Input:**
- `Space` or `Enter` → restart (only accepted after the 500ms delay)
- Restart transitions instantly to gameplay (no title screen in between)

## Fonts

- Use a **monospace or geometric sans-serif** web-safe font
- Primary: `'Courier New', monospace` (guaranteed available)
- If we want style: load a single weight of a geometric font (e.g., "Share Tech Mono" from Google Fonts)
- All text rendered on canvas via `ctx.fillText()` — not HTML elements

## Text Rendering

- All text is drawn on the canvas, not in HTML DOM
- Text is always **centered** (both horizontally and vertically for its position)
- Text color matches the current palette foreground
- Text is never affected by world rotation or screen shake

## Responsive Sizing

- All text sizes are relative to canvas height (percentages, not fixed px)
- On very small screens (< 400px wide): text sizes reduce proportionally
- Timer must remain readable at all screen sizes

## Game State Machine

```
TITLE → (Space) → PLAYING → (death) → DEAD → (Space) → PLAYING
                                              (Escape) → TITLE
```

- No loading state needed (all assets are code-generated)
- Transitions are instant (no fade or animation between states, except death flash)

## localStorage Persistence

- Key: `purevibes_best_time`
- Value: float (seconds with 1 decimal)
- Read on page load for title screen display
- Written on death if current time > stored time

## Acceptance Criteria

- [ ] Title screen displays with animated background
- [ ] Start prompt pulses smoothly
- [ ] Best time shows on title screen (if one exists)
- [ ] Timer displays during gameplay, always readable, always upright
- [ ] Timer shows 1 decimal place, monospace to prevent jitter
- [ ] Phase name flashes and fades on phase transitions
- [ ] Death screen shows with correct timing sequence (flash → text → prompt)
- [ ] "NEW BEST!" displays when record is broken
- [ ] Restart prompt only accepts input after 500ms delay
- [ ] Space from death goes directly to gameplay (not title)
- [ ] Escape from death returns to title
- [ ] All text scales with canvas size
- [ ] Best time persists across page reloads

## Open Questions

None.
