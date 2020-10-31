import {
  AnimationTarget,
  Tween,
  lerp,
} from '../index.js';
import {
  rgb,
  colorInterpolator,
} from './rgb.js';

const ColorParser = new RegExp(/rgba\(\s*(\d+\.?\d*)\s*,\s*(\d+\.?\d*)\s*,\s*(\d+\.?\d*)\s*,\s*(\d+\.?\d*)\s*\)/);
export class CSSColor {
  /**
   * @param {ReturnType<rgb>} initialValue
   */
  constructor(initialValue) {
    this._d = initialValue || rgb(0);
  }

  get value() {
    return `rgba(${this._d.r},${this._d.g},${this._d.b},${this._d.a/255})`;
  }

  /**
   * @param {string | CSSColor} val
   */
  set value(val) {
    if (typeof val === 'string') {
      const _e = ColorParser.exec(val);
      if (_e) {
        const [, r, g, b, a] = _e;
        this._d = rgb(~~r, ~~g, ~~b, (a)? +a * 255 : 255);
      }
    } else {
      this._d = val._d;
    }
  }

  toString() {
    return this.value;
  }
}

/**
 * @param {string | CSSColor} from
 * @param {string | CSSColor} to
 * @param {number} much
 */
export const cssColorTween = (from, to, much) => {
  const _ea = ColorParser.exec(`${from}`);
  const _eb = ColorParser.exec(`${to}`);
  if (_ea && _eb) {
    const [, fr, fg, fb, fa] = _ea;
    const [, tr, tg, tb, ta] = _eb;
    return new CSSColor(
      colorInterpolator({r: +fr, g: +fg, b: +fb, a: +fa * 255}, {r: +tr, g: +tg, b: +tb, a: +ta * 255}, much),
    );
  };
  return new CSSColor(rgb(255,0,0));
}

Tween.registerType(CSSColor, cssColorTween);
Tween.registerType('csscolor', cssColorTween);

export class CSSPercent {
  /**
   * @param {number} initialValue
   */
  constructor(initialValue) {
    this._d = +initialValue;
  }

  get value() {
    return `${this._d}${this._d != 0 ? '' : '%'}`;
  }

  set value(v) {
    if (v === '0') {
      this._d = 0;
    } else {
      this._d = Number.parseFloat(v.substr(0, v.length - 1));
    }
  }

  toString() {
    return this._d + '%';
  }
}

/**
 * @param {string | CSSPercent} from
 * @param {string | CSSPercent} to
 * @param {number} much
 */
export const cssPercentTween = (from, to, much) => {
  const sa = `${from}`;
  const sb = `${to}`;

  /** @type {number} */
  let a;
  /** @type {number} */
  let b;
  if (sa === '0') {
    a = 0;
  } else {
    a = Number.parseFloat(sa.substr(0, sa.length - 1));
  }
  if (sb === '0') {
    b = 0;
  } else {
    b = Number.parseFloat(sb.substr(0, sb.length - 1));
  }

  return new CSSPercent(
    lerp(a, b, much)
  );
}
Tween.registerType(CSSPercent, cssPercentTween);
Tween.registerType('csspercent', cssPercentTween);

export class CSSPixels {
  /** @param {number} initialValue */
  constructor(initialValue) {
    this._d = initialValue;
  }

  get value() {
    return this.toString();
  }

  set value(v) {
    if (v === '0') {
      this._d = 0;
    } else {
      this._d = Number.parseFloat(v.substr(0, v.length - 2));
    }
  }

  toString() {
    return `${this._d}${this._d == 0 ? '' : 'px'}`;
  }
}

/**
 * @param {string | CSSPixels} from
 * @param {string | CSSPixels} to
 * @param {number} much
 */
export const cssPixelsTween = (from, to, much) => {
  const sa = `${from}`;
  const sb = `${to}`;

  /** @type {number} */
  let a;
  /** @type {number} */
  let b;
  if (sa === '0') {
    a = 0;
  } else {
    a = Number.parseFloat(sa.substr(0, sa.length - 2));
  }
  if (sb === '0') {
    b = 0;
  } else {
    b = Number.parseFloat(sb.substr(0, sb.length - 2));
  }

  return new CSSPixels(
    lerp(a, b, much)
  );
}
Tween.registerType(CSSPixels, cssPixelsTween);
Tween.registerType('csspixels', cssPixelsTween);

const rnda = () => '-' + Array(6).fill(0).map(() => 'abcdefghijklmnopqrstuvwxyz'[~~(Math.random() * 26)]).join('');
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
export class CSSVariableTarget extends AnimationTarget {
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
  constructor(variable, value, anchor = document.body) {
    super(value);
    /** @private */
    this._variable = variable + rnda();
    this._anchor = anchor;
    /** @type {CSSVariablesAreAlsoStrings<T>} */
    this._value = value;
    this.value = value;
  }

  get var() {
    return `var(${this._variable})`;
  }

  get value() {
    return this._value;
  }

  /** @param {CSSVariablesAreAlsoStrings<T>} v */
  set value(v) {
    this._value = v;
    if (this._variable) {
      this._anchor.style.setProperty(this._variable, `${this._value}`);
    }
  }
}

