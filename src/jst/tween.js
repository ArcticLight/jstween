import { lerp } from './functions.js';
import { Seekable } from './seekable.js';

/**
 * @template T
 * @typedef {(from: T, to: T, much: number) => T} InterpolationFunction
 */

/**
 * @type {Map<string | (new (...args: any) => any), InterpolationFunction<any>>}
 */
const RegisteredTweenTypes = new Map();

/**
 * Defines a known animation target. While you can change the value
 * to be anything at all, take care not to give it a value with an
 * incompatible interpolation type than the current value, which
 * would cause your animations to break.
 * @template T
 */
export class AnimationTarget {
  /**
   * @param {T} initialValue
   * @param {any} type
   */
  constructor(initialValue, type = undefined) {
    /**
     * @type {any}
     */
    let _t = type;
    if (typeof type === 'undefined') {
      _t = initialValue;
    }

    /**
     * @private
     * @readonly
     * @type {string | (new (...args: any) => any)}
     */
    this.type = 'unknown';
    if (typeof _t === 'string') {
      this.type = _t;
    } else if (_t.constructor) {
      this.type = _t.constructor;
    } else {
      this.type = typeof type;
    }

    /**
     * @protected
     */
    this._value = initialValue;
    this._f = Tween.getInterpolateFunctionForType(this.type);
  }

  get value() {
    return this._value;
  }

  set value(v) {
    this._value = v;
  }
}

/**
 * Defines an animation target for a completely separate object's property.
 *
 * WARNING: This is an ugly hack which is provided for compatibility purposes;
 * ideally you should ABSOLUTELY design your own objects which make use of the proper
 * AnimationTarget and not use ObjectPropertyAnimator.
 *
 * Be careful when using objects of this type, because behavior may be odd.
 * @template O
 * @template {keyof O} K
 * @extends {AnimationTarget<O[K]>}
 */
export class ObjectPropertyAnimationTarget extends AnimationTarget {
  /**
   * @param {O} object The object whose property you want to animate
   * @param {K} key The property (key) of the object you want to animate, such that
   * the code <code>object[key] = someValue</code> sets the animated value correctly.
   * @param {O[K]=} [initialValue=object[key]] The initial value of the target, which is set
   * immediately. If undefined, defaults to the value of <code>object[key]</code> at
   * construction time.
   * @param {any=} [type=undefined] Overrides the detected interpolation type, if set
   */
  constructor(object, key, initialValue, type = undefined) {
    /** @type {any} */
    const _v = (typeof initialValue === 'undefined') ? object[key] : initialValue;

    super(_v, type);

    this._o = object;
    this._k = key;
  }

  get value() {
    return this._o[this._k];
  }

  set value(v) {
    this._o[this._k] = v;
  }
}

/**
 * This is the Tween class, one of the basic building blocks of animation.
 *
 * A Tween simply represents going *from* one value *to* another value, for
 * some duration. For instance, you might animate some visual object from
 * fully transparent to fully opaque, and that would be a Tween.
 *
 * Note that a Tween can only apply to *one* property of something, and that
 * you cannot have multiple "stops" along the way, so you cannot have a Tween
 * that goes from transparent -> opaque and then opaque -> transparent. To do
 * that, you make a *timeline* of multiple Tweens. Making timelines allows you
 * to quickly build out complete animations that do exactly what you want, even
 * that thing where the box comes onto the screen while rotating, blinking very
 * fast, and changing colors.
 *
 * @template T
 */
export class Tween extends Seekable {
  /**
   * Creates a Tween of an AnimationTarget.
   *
   * @param {AnimationTarget<T>} target The AnimationTarget this Tween applies to
   * @param {T} from The start value of the Tween; must be a value of the same type that as the AnimationTarget is for
   * @param {T} to The end value of the Tween; must be a value of the same type that the AnimationTarget is for
   * @param {number} duration The duration of the Tween. Defaults to 1.
   */
  constructor(target, from, to, duration = 1) {
    super(duration, [target]);
    this.from = from;
    this.to = to;
  }

  /**
   * @override
   * @param {number} t
   */
  seekTo(t) {
    this.targets[0].value = this.targets[0]._f(this.from, this.to, t / this.duration);
  }

  /**
   * @param {string | (new (...args: any) => any)} type
   * @returns {InterpolationFunction<any>}
   */
  static getInterpolateFunctionForType(type) {
    const registration = RegisteredTweenTypes.get(type);

    if (registration) {
      return registration;
    }

    const strType = (typeof type === 'string')? type : typeof type;
    console.warn(`[jsTween] Unknown interpolation type "${strType}"! Using the default (numeric) interpolator!\n[jsTween] If your animations aren't working correctly, register the correct interpolator with\n[jsTween] the Tween#registerType() function!`);
    return lerp;
  }

  /**
   * Register a particular (custom) interpolation function for a given type.
   * Types that are registered in this way will be available for use with
   * all AnimationTarget and Tween methods, without generating warnings.
   * @template T
   * @param {string | (new (...args: any) => any)} type The type to register.
   * You would usually pass <code>typeof foo</code>, the Class itself, or similar,
   * because that way the type will be inferred automatically when the library sees that type, but
   * you can also pass a unique string to identify the type instead. If passing a string to registerType(),
   * you will need to remember to pass that string as the type of any AnimationTarget(s) you create, in
   * order to have the target be targeting the right type.
   *
   * @param {InterpolationFunction<T>} func The function to register with the given type. This function will be used when
   *  interpolating values of type <code>type</code>. The function registered MUST have the same function
   *  signature of the lerp function, namely <code>(from: T, to: T, much: number) => number</code>, where the parameters
   *  <code>from</code> and <code>to</code> are of type <code>type</code>, and the parameter <code>much</code>
   *  is a decimal number between 0 and 1.
   */
  static registerType(type, func) {
    if (type === null || typeof type === 'undefined') {
      throw new TypeError("Type can't be null!");
    }

    if (RegisteredTweenTypes.has(type)) {
      var strType = typeof type === 'string' ? type : typeof type;
      throw new TypeError(`Type "${strType}" has already been registered!`);
    }
    RegisteredTweenTypes.set(type, func);
  }

  /**
   * @param {string | (new (...args: any) => any)} type
   */
  static unregisterType(type) {
    if (!RegisteredTweenTypes.has(type)) {
      var strType = typeof type === 'string' ? type : typeof type;
      throw new Error(`Type "${strType}" was never registered!`);
    }
    RegisteredTweenTypes.delete(type);
  }
}

/**
 * @template T
 * @param {AnimationTarget<T>} target
 * @param {T} from
 * @param {T} to
 * @param {number} duration
 * @returns {Tween<T>}
 */
export function to(target, from, to, duration = 1) {
  return new Tween(target, from, to, duration);
}

// Registers numbers by default, to suppress the default warning
// on Number:
Tween.registerType(Number, lerp);
