/**
 * clamp is a function which clamps numeric values so that they are strictly
 * between a given minimum and a maximum.
 *
 * If the value is less than the min, then the min is returned. If the value
 * is greater than the max, then the max is returned. Otherwise, the original
 * value is returned.
 *
 * @param {number} value The value to clamp
 * @param {number} min The minimum value allowed.
 * @param {number} max The maximum value allowed.
 */
export function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * lerp performs simple linear interpolation on numeric values.
 * This function is used frequently in animation and for the simpler tweens.
 * See https://en.wikipedia.org/wiki/Linear_interpolation for a simple explanation
 * of what this does.
 *
 * @param {number} from The start value
 * @param {number} to The end value
 * @param {number} much A decimal number between 0 and 1 (inclusive) which is the
 * fractional amount to interpolate between the <code>from</code> (starting) value and the
 * <code>to</code> (ending) value. For interpolation functions, using values outside the
 * range <code>0 <= much <= 1</code> causes undefined behavior and may or may not be bad.
 * Know what you're doing if you pass values outside this range, and, in general, **don't**.
 */
export function lerp(from, to, much) {
  return from + (to - from) * much;
}
