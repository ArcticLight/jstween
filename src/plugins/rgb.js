import {
  lerp,
  clamp,
  Tween,
} from '../index.js';

/** @typedef {
   [grayscale: number, _?: undefined, _?: undefined, _?: undefined]
 | [grayscale: number, alpha: number, _?: undefined, _?: undefined]
 | [r: number, g: number, b: number]
 | [r: number, g: number, b: number, a: number]
} RGBConstructorSigs */

export class RGB {
  /**
   * @param {RGBConstructorSigs} args
   */
  constructor(...[a0 = 0, a1, a2, a3 = 255]) {
    // One parameter:
    this.r = a0;
    this.g = a0;
    this.b = a0;
    this.a = a3;
    // Two parameters:
    if (typeof a1 !== 'undefined') {
      this.a = a1;
      // Three or four parameters:
      if (typeof a2 !== 'undefined') {
        this.g = a1;
        this.b = a2;
        this.a = a3;
      }
    }
  }
}
/** @type {(...args: RGBConstructorSigs) => RGB} */
export const rgb = (...args) => new RGB(...args);

/**
 * Interpolate a single color channel, e.g. _r_
 * @param {number} from
 * @param {number} to
 * @param {number} much
 */
export const colorChannelInterpolate = (from, to, much) => {
  // Colors are different than numbers: in order to interpolate
  // correctly, you have to first square the values, interpolate
  // the _squared_ value, and then sqrt the result. Otherwise,
  // you don't get a smooth interpolation or blur, and will instead
  // get unexpected brown smears and artifacting.
  return clamp(Math.sqrt(lerp(from * from, to * to, much)), 0, 255);
}

/**
 * @param {RGB} from
 * @param {RGB} to
 * @param {number} much
 */
export const colorInterpolator = (from, to, much) => {
  return new RGB(
    colorChannelInterpolate(from.r, to.r, much),
    colorChannelInterpolate(from.g, to.g, much),
    colorChannelInterpolate(from.b, to.b, much),
    lerp(from.a, to.a, much),
  );
}

Tween.registerType(RGB, colorInterpolator);
