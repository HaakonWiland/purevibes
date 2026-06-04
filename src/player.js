import { PLAYER_ROTATION_SPEED, PLAYER_ORBIT_SCALE, PLAYER_SIZE_SCALE, TWO_PI } from './constants.js';
import { normalizeAngle, polarToCartesian } from './geometry.js';

export function createPlayer() {
  return {
    angle: Math.PI / 2,
    alive: true,
  };
}

export function updatePlayer(player, input, dt, worldRotVelocity) {
  if (!player.alive) return;

  let dir = 0;
  if (input.left) dir -= 1;
  if (input.right) dir += 1;

  player.angle += dir * PLAYER_ROTATION_SPEED * dt - worldRotVelocity * dt;
  player.angle = normalizeAngle(player.angle);
}

export function drawPlayer(ctx, player, cx, cy, arenaRadius, worldRotation, fgColor) {
  const orbitR = arenaRadius * PLAYER_ORBIT_SCALE;
  const size = arenaRadius * PLAYER_SIZE_SCALE;
  const screenAngle = player.angle + worldRotation;
  const pos = polarToCartesian(cx, cy, screenAngle, orbitR);

  const outwardAngle = screenAngle;

  ctx.save();
  ctx.translate(pos.x, pos.y);
  ctx.rotate(outwardAngle);

  ctx.beginPath();
  ctx.moveTo(size * 0.7, 0);
  ctx.lineTo(-size * 0.5, -size * 0.6);
  ctx.lineTo(-size * 0.5, size * 0.6);
  ctx.closePath();

  ctx.fillStyle = fgColor;
  ctx.fill();
  ctx.restore();
}

export function getPlayerWorldPos(player, arenaRadius) {
  const orbitR = arenaRadius * PLAYER_ORBIT_SCALE;
  return { angle: player.angle, radius: orbitR };
}
