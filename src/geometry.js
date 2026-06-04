import { SECTOR_COUNT, SECTOR_ANGLE, TWO_PI } from './constants.js';

export function normalizeAngle(angle) {
  angle = angle % TWO_PI;
  if (angle < 0) angle += TWO_PI;
  return angle;
}

export function hexVertex(cx, cy, radius, index, rotation = 0) {
  const angle = index * SECTOR_ANGLE + rotation;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

export function sectorToAngle(sector) {
  return sector * SECTOR_ANGLE;
}

export function angleToSector(angle) {
  return Math.floor(normalizeAngle(angle) / SECTOR_ANGLE) % SECTOR_COUNT;
}

export function polarToCartesian(cx, cy, angle, radius) {
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

export function drawHexagon(ctx, cx, cy, radius, rotation = 0, fill = null, stroke = null) {
  ctx.beginPath();
  for (let i = 0; i < SECTOR_COUNT; i++) {
    const v = hexVertex(cx, cy, radius, i, rotation);
    if (i === 0) ctx.moveTo(v.x, v.y);
    else ctx.lineTo(v.x, v.y);
  }
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

export function drawWallSegment(ctx, cx, cy, innerR, outerR, sectorStart, sectorEnd, rotation, color) {
  ctx.beginPath();

  for (let s = sectorStart; s < sectorEnd; s++) {
    const a1 = s * SECTOR_ANGLE + rotation;
    const a2 = (s + 1) * SECTOR_ANGLE + rotation;

    const inner1 = polarToCartesian(cx, cy, a1, innerR);
    const inner2 = polarToCartesian(cx, cy, a2, innerR);
    const outer1 = polarToCartesian(cx, cy, a1, outerR);
    const outer2 = polarToCartesian(cx, cy, a2, outerR);

    ctx.moveTo(outer1.x, outer1.y);
    ctx.lineTo(outer2.x, outer2.y);
    ctx.lineTo(inner2.x, inner2.y);
    ctx.lineTo(inner1.x, inner1.y);
    ctx.closePath();
  }

  ctx.fillStyle = color;
  ctx.fill();
}
