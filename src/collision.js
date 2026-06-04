import { SECTOR_ANGLE, PLAYER_HITBOX_SCALE, PLAYER_ORBIT_SCALE, TWO_PI } from './constants.js';
import { normalizeAngle } from './geometry.js';

export function checkCollision(player, wallSystem, arenaRadius, worldRotation) {
  if (!player.alive) return false;

  const playerRadius = arenaRadius * PLAYER_ORBIT_SCALE;
  const hitboxR = arenaRadius * PLAYER_HITBOX_SCALE;

  for (const wall of wallSystem.activeWalls) {
    const wallInner = wall.radius;
    const wallOuter = wall.radius + wall.thickness;

    if (playerRadius + hitboxR < wallInner) continue;
    if (playerRadius - hitboxR > wallOuter) continue;

    const angularHitbox = hitboxR / playerRadius;
    const playerAngle = normalizeAngle(player.angle + worldRotation);

    for (let s = 0; s < 6; s++) {
      if (!wall.sectors[s]) continue;

      const sectorStart = normalizeAngle(s * SECTOR_ANGLE + worldRotation);
      const sectorEnd = normalizeAngle((s + 1) * SECTOR_ANGLE + worldRotation);

      if (angularOverlap(
        playerAngle - angularHitbox,
        playerAngle + angularHitbox,
        sectorStart,
        sectorEnd
      )) {
        return true;
      }
    }
  }

  return false;
}

function angularOverlap(pStart, pEnd, sStart, sEnd) {
  pStart = normalizeAngle(pStart);
  pEnd = normalizeAngle(pEnd);
  sStart = normalizeAngle(sStart);
  sEnd = normalizeAngle(sEnd);

  if (containsAngle(sStart, sEnd, pStart)) return true;
  if (containsAngle(sStart, sEnd, pEnd)) return true;
  if (containsAngle(pStart, pEnd, sStart)) return true;

  return false;
}

function containsAngle(start, end, angle) {
  if (start < end) {
    return angle >= start && angle <= end;
  }
  return angle >= start || angle <= end;
}
