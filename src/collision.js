import { SECTOR_ANGLE, PLAYER_HITBOX_SCALE, PLAYER_ORBIT_SCALE } from './constants.js';
import { normalizeAngle } from './geometry.js';

export function checkCollision(player, wallSystem, arenaRadius, worldRotation) {
  if (!player.alive) return false;

  const playerRadius = arenaRadius * PLAYER_ORBIT_SCALE;
  const hitboxR = arenaRadius * PLAYER_HITBOX_SCALE;
  const playerScreenAngle = normalizeAngle(player.angle + worldRotation);
  const angularHitbox = hitboxR / playerRadius;

  for (const wall of wallSystem.activeWalls) {
    const wallInner = wall.radius;
    const wallOuter = wall.radius + wall.thickness;

    if (playerRadius + hitboxR < wallInner) continue;
    if (playerRadius - hitboxR > wallOuter) continue;

    for (let s = 0; s < 6; s++) {
      if (!wall.sectors[s]) continue;

      const sectorStart = s * SECTOR_ANGLE + worldRotation;
      const sectorEnd = (s + 1) * SECTOR_ANGLE + worldRotation;

      if (isAngleInArc(playerScreenAngle, sectorStart + angularHitbox, sectorEnd - angularHitbox)) {
        return true;
      }
    }
  }

  return false;
}

function isAngleInArc(angle, arcStart, arcEnd) {
  const a = normalizeAngle(angle);
  const s = normalizeAngle(arcStart);
  const e = normalizeAngle(arcEnd);

  if (s < e) {
    return a >= s && a <= e;
  }
  return a >= s || a <= e;
}
