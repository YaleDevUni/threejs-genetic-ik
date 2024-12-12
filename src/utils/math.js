// src/utils/math.js
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function distance(v1, v2) {
  return v1.distanceTo(v2);
}
