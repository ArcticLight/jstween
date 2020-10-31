export class CSSColor {
    /**
     * @param {ReturnType<rgb>} initialValue
     */
    constructor(initialValue: ReturnType<any>);
    _d: any;
    /**
     * @param {string | CSSColor} val
     */
    set value(arg: string | CSSColor);
    get value(): string | CSSColor;
    toString(): string | CSSColor;
}
export function cssColorTween(from: string | CSSColor, to: string | CSSColor, much: number): CSSColor;
export class CSSPercent {
    /**
     * @param {number} initialValue
     */
    constructor(initialValue: number);
    _d: number;
    set value(arg: string);
    get value(): string;
    toString(): string;
}
export function cssPercentTween(from: string | CSSPercent, to: string | CSSPercent, much: number): CSSPercent;
export class CSSPixels {
    /** @param {number} initialValue */
    constructor(initialValue: number);
    _d: number;
    set value(arg: string);
    get value(): string;
    toString(): string;
}
export function cssPixelsTween(from: string | CSSPixels, to: string | CSSPixels, much: number): CSSPixels;
/**
 * @template T
 * @typedef {
  T extends CSSColor
    ? CSSColor | string
    : T extends CSSPercent
      ? CSSPercent | string
      : T extends CSSPixels
        ? CSSPixels | string
        : T
} CSSVariablesAreAlsoStrings */
/**
 * @template T
 * @extends {AnimationTarget<CSSVariablesAreAlsoStrings<T>>}
 */
export class CSSVariableTarget<T> {
    /**
     * @param {string} variable The CSS variable name prefix to use.
     * It doesn't have to be unique, as each CSSVariableTarget automatically
     * gets a random extra few characters on the end.
     * @param {CSSVariablesAreAlsoStrings<T>} value The initial value.
     * This also sets the type of the interpolator, so you can't use
     * a bare string as the value if you intend to use a certain CSS type:
     * e.g. <code>value = "0px"</code> won't do what you want, you have to
     * use <code>value = CSSPixels(0)</code> instead.
     * @param {HTMLElement} anchor The element to use to put the CSS variable on.
     * This defaults to document.body, but you can substitute another HTML element
     * here to place the variable on something else.
     */
    constructor(variable: string, value: T extends CSSColor ? string | CSSColor : T extends CSSPercent ? string | CSSPercent : T extends CSSPixels ? string | CSSPixels : T, anchor?: HTMLElement);
    /** @private */
    private _variable;
    _anchor: HTMLElement;
    /** @type {CSSVariablesAreAlsoStrings<T>} */
    _value: T extends CSSColor ? string | CSSColor : T extends CSSPercent ? string | CSSPercent : T extends CSSPixels ? string | CSSPixels : T;
    /** @param {CSSVariablesAreAlsoStrings<T>} v */
    set value(arg: T extends CSSColor ? string | CSSColor : T extends CSSPercent ? string | CSSPercent : T extends CSSPixels ? string | CSSPixels : T);
    get value(): T extends CSSColor ? string | CSSColor : T extends CSSPercent ? string | CSSPercent : T extends CSSPixels ? string | CSSPixels : T;
    get var(): string;
}
export type CSSVariablesAreAlsoStrings<T> = T extends CSSColor ? string | CSSColor : T extends CSSPercent ? string | CSSPercent : T extends CSSPixels ? string | CSSPixels : T;
//# sourceMappingURL=css-property-target.d.ts.map