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
    constructor(...[a0, a1, a2, a3]: RGBConstructorSigs);
    r: number;
    g: number;
    b: number;
    a: number;
}
/** @type {(...args: RGBConstructorSigs) => RGB} */
export const rgb: (...args: RGBConstructorSigs) => RGB;
export function colorChannelInterpolate(from: number, to: number, much: number): any;
export function colorInterpolator(from: RGB, to: RGB, much: number): RGB;
export type RGBConstructorSigs = [grayscale: number, _?: undefined, _?: undefined, _?: undefined] | [grayscale: number, alpha: number, _?: undefined, _?: undefined] | [r: number, g: number, b: number] | [r: number, g: number, b: number, a: number];
//# sourceMappingURL=rgb.d.ts.map