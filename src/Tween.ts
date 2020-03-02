import { TweenTypeRegistration, Newable, InterpolationFunction } from './types';

import { lerp } from './functions';
import { Seekable } from './seekable';

let RegisteredTweenTypes: Map<any, TweenTypeRegistration<any>> = new Map();

/**
 * Defines a known animation target. While you can change the value to be
 * anything at all, take care not to give it a value with a different type
 * than the initial value. This may cause your animations to break.
 */
export class AnimationTarget<T> {
  private readonly type: string | Newable;
  public value: T;
  readonly interpFunc: InterpolationFunction<T>;

  constructor(initialValue: T, type?: any) {
    this.type =
      typeof type === 'undefined' ? (initialValue as any).constructor : type;
    this.value = initialValue;
    this.interpFunc = Tween.getInterpolateFunctionForType(this.type);
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
 */
export class ObjectPropertyAnimationTarget<
  O,
  P extends keyof O
> extends AnimationTarget<O[P]> {
  readonly object: O;
  readonly property: P;
  value: O[P];

  /**
   * @param object The object whose property you want to animate.
   * @param property The property of the object you want to animate,
   * such that <code>object[property] = someValue</code> sets the animated value correctly.
   */
  constructor(object: O, property: P, type?: any) {
    super(object[property], type);
    this.object = object;
    this.property = property;

    // @ts-ignore: Comes from superclass
    delete this.value;

    Object.defineProperty(this, 'value', {
      get: function(): O[P] {
        return this.object[this.property];
      },
      set: function(x: O[P]) {
        this.object[this.property] = x;
      },
    });
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
 */
export class Tween<T> extends Seekable {
  target: AnimationTarget<T>;
  from: T;
  to: T;

  /**
   * Creates a Tween of an AnimationTarget.
   *
   * @param target The AnimationTarget this Tween applies to
   * @param from The start value of the Tween; must be a value of the same type that as the AnimationTarget is for
   * @param to The end value of the Tween; must be a value of the same type that the AnimationTarget is for
   * @param duration The duration of the Tween. Defaults to 1.
   */
  constructor(
    target: AnimationTarget<T>,
    from: T,
    to: T,
    duration: number = 1
  ) {
    super(duration);

    this.target = target;
    this.from = from;
    this.to = to;
  }

  /**
   * Seeks this Tween to the time specified.
   *
   * This method directly modifies the value of the AnimationTarget to be the result
   * of this Tween at time t.
   *
   * @param t The time. Note that this time value **IS NOT** clamped to be within
   * the range <code>0 <= t <= this.duration</code> and therefore you MAY get weirdness if
   * you try to seek to times outside this range!
   */
  seekTo(t: number): void {
    this.target.value = this.target.interpFunc(
      this.from,
      this.to,
      t / this.duration
    );
  }

  /**
   * Get the appropriate interpolation function for a given type, as registered
   * by {@link registerType}.
   * @param type The type to find
   */
  static getInterpolateFunctionForType(
    type: string | Newable
  ): InterpolationFunction<any> {
    const registration = RegisteredTweenTypes.get(type);
    if (registration) {
      return registration.interpFun;
    }

    let strType = typeof type === 'string' ? type : typeof type;

    console.warn(
      `[jsTween] Unknown interpolation type "${strType}"! Using the default (numeric) interpolator!\n` +
        `[jsTween] If your animations aren't working correctly, register the correct interpolator with\n` +
        `[jsTween] the Tween#registerType() function!`
    );

    return lerp;
  }

  /**
   * Register a particular (custom) interpolation function for a given type.
   * Types that are registered in this way will be available for use with
   * all AnimationTarget and Tween methods, without generating warnings.
   *
   * @param type The type to register. You would usually pass <code>typeof foo</code> or similar,
   * because that way the type will be inferred automatically when the library sees that type, but
   * you can also pass a unique string to identify the type instead. If passing a string to registerType(),
   * you will need to remember to pass that string as the type of any AnimationTarget(s) you create, in
   * order to have the target be targeting the right type.
   *
   * @param func The function to register with the given type. This function will be used when
   *  interpolating values of type <code>type</code>. The function registered MUST have the same function
   *  signature of the lerp function, namely <code>(from: T, to: T, much: number) => number</code>, where the parameters
   *  <code>from</code> and <code>to</code> are of type <code>type</code>, and the parameter <code>much</code>
   *  is a decimal number between 0 and 1.
   */
  static registerType(
    type: string | Newable,
    func: InterpolationFunction<any>
  ): void {
    if (type === null) {
      throw new TypeError("Type can't be null!");
    }

    if (RegisteredTweenTypes.has(type)) {
      let strType = typeof type === 'string' ? type : typeof type;
      throw new TypeError(`Type "${strType}" has already been registered!`);
    }

    RegisteredTweenTypes.set(type, {
      type: type,
      interpFun: func,
    });
  }

  static unregisterType(type: string | Newable): void {
    if (!RegisteredTweenTypes.has(type)) {
      let strType = typeof type === 'string' ? type : typeof type;
      throw new Error(`Type "${strType}" was never registered!`);
    } else {
      RegisteredTweenTypes.delete(type);
    }
  }
}

export function to<T>(
  target: AnimationTarget<T>,
  from: T,
  to: T,
  duration: number = 1
): Tween<T> {
  return new Tween(target, from, to, duration);
}

Tween.registerType(Number, lerp);
