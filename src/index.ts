import raf = require('raf');
raf.polyfill();

export type InterpolationFunction<T> = (from: T, to: T, much: number) => T;
export type EasingFunction = (x: number) => number;
export type Newable = new (...x: any[]) => any;
export interface TweenTypeRegistration<T> {
  type: any;
  interpFun: InterpolationFunction<T>;
}

// Would prefer for RegisteredTweenTypes to be a Map<any, InterpolationFunction>,
// however, using Map<K, V> would require polyfills in lower ES-es, and we don't
// want that.
let RegisteredTweenTypes: Array<TweenTypeRegistration<any>> = [];

export let quiet = false;

/**
 * clamp is a function which clamps numeric values so that they are strictly
 * between a given minimum and a maximum.
 * 
 * If the value is less than the min, then the min is returned. If the value
 * is greater than the max, then the max is returned. Otherwise, the original
 * value is returned.
 * 
 * @param value The value to clamp
 * @param min The minimum value allowed.
 * @param max The maximum value allowed.
 */
export function clamp(value: number, min: number, max: number): number {
  if(value < min) return min;
  if(value > max) return max;
  return value;
}

/**
 * lerp performs simple linear interpolation on numeric values.
 * This function is used frequently in animation and for the simpler tweens.
 * See https://en.wikipedia.org/wiki/Linear_interpolation for a simple explanation
 * of what this does.
 * 
 * @param from The start value
 * @param to The end value
 * @param much A decimal number between 0 and 1 (inclusive) which is the
 * fractional amount to interpolate between the <code>from</code> (starting) value and the
 * <code>to</code> (ending) value. For interpolation functions, using values outside the
 * range <code>0 <= much <= 1</code> causes undefined behavior and may or may not be bad.
 * Know what you're doing if you pass values outside this range, and, in general, **don't**.
 */
export function lerp(from: number, to: number, much: number): number {
  return from + ((to - from) * much);
}

/**
 * The following eases are reproduced based on Robert Penner's original equations.
 * They are used fairly under the terms of the BSD License; the terms of this License
 * are reproduced in the EASING-LICENSE property and external file. Including it here
 * as a string means that you still respect the license even when minifying this js file
 * or including a minified version in a project, how cool is that!?
 */
export const Eases = {
    "EASING-LICENSE": "The code in this JavaScript object is licensed under the following terms: TERMS OF USE - EASING EQUATIONS\n\nOpen source under the BSD License. \n\nCopyright © 2001 Robert Penner\nAll rights reserved.\n\nRedistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:\n\nRedistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.\nRedistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.\nNeither the name of the author nor the names of contributors may be used to endorse or promote products derived from this software without specific prior written permission.\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.",

    "easeInQuad": function(x: number): number {
        return x*x;
    },

    "easeOutQuad": function(x: number): number {
        return -1 * x * (x-2);
    },

    "easeInOutQuad": function(x: number): number {
        if((x/=1/2) < 1) return 1/2*x*x;
        return -1/2 * ((--x)*(x-2)-1);
    },

    "easeInCubic": function(x: number): number {
        return x*x*x;
    },

    "easeOutCubic": function(x: number): number {
        return ((--x)*x*x + 1);
    },

    "easeInOutCubic": function(x: number): number {
        if((x/=1/2) < 1) return 1/2*x*x*x;
        return 1/2*((x-=2)*x*x + 2);
    },

    "easeInQuart": function(x: number): number {
        return x*x*x*x;
    },

    "easeOutQuart": function(x: number): number {
        return -1 * ((--x)*x*x*x - 1);
    },

    "easeInQuint": function(x: number): number {
        return x*x*x*x*x;
    },

    "easeOutQuint": function(x: number): number {
        return (--x)*x*x*x*x + 1;
    }
}

/**
 * Seekable is the superclass for all animation building blocks in this library,
 * including Tween, ParTimeline, and SeqTimeline. A Seekable has a read-only property
 * `duration`, and a method, `seekTo(t)`, which will set an animation to "be" at a
 * given time along its duration.
 * 
 * A Seekable can also have an Ease function applied  to it, by using the `withEase()`
 * function, which returns a new Seekable that adds in the effects of the easing function.
 * While you could technically chain eases together, doing `withEase(a).withEase(b)` to get
 * nifty effects, you probably shouldn't, as this may cause performance issues. As with all
 * advanced features, use with caution.
 */
export class Seekable {
  readonly duration: number;

  constructor(duration: number = 1) {
    this.duration = duration;
  }

  /**
   * Set an animation to be at the time specified as t.
   * If t is outside the range <code>0 <= t <= duration</code>,
   * then its behavior is undefined, meaning that some animations may
   * extend the available animation to fit outside of the original duration,
   * and some animations may completely break.
   * 
   * TL;DR: Seek with caution, clamp when necessary.
   * 
   * @param t The time to seek to
   */
  seekTo(t: number): void {
      // does nothing
  }

  /**
   * A convenience method that starts an animation right away, handling all the fiddly
   * details about updating the time and using `requestAnimationFrame()` for you. It
   * assumes that your durations are measured in seconds.
   */
  start(): void {

    //This is clearly not idiomatic typescript, but I wasn't sure
    //how to properly port this hack from the original JavaScript.
    let fn = function(timestamp: number) {
      if(!this.timeStarted) {
        this.timeStarted = timestamp;
        this.u.seekTo(0);
        requestAnimationFrame(this.self.bind(this));
        return;
      }

      let dt = clamp((timestamp - this.timeStarted)/1000, 0, this.u.duration);
      this.u.seekTo(dt);
      if(dt < this.u.duration) {
        requestAnimationFrame(this.self.bind(this));
      }
    }
      
    fn = fn.bind({
        u: this,
        self: fn
    });

    requestAnimationFrame(fn);
  }

  /**
   * Returns a new Seekable with the given easing function applied.
   * 
   * Note that if you attempt to combine eases, e.g. you call withEase on a
   * Tween which already has an ease, the performance of the code will start
   * to get *really bad*. Consider instead creating a new ease function that
   * does what you want, and setting the Tween's ease to your new function instead.
   * 
   * @param ease The easing function to use. The easing function can be any function
   * with the signature <code>(x) => number</code> where x is a number in the range <code>0 <= x <= 1</code>
   */
  withEase(ease: EasingFunction): EasedSeekable {
      return new EasedSeekable(this, ease)
  }
}

export class EasedSeekable extends Seekable {
  private oldSeek: Seekable;
  private ease: EasingFunction;

  constructor(oldSeekable: Seekable, ease: EasingFunction = null) {
    super(oldSeekable.duration);
    this.oldSeek = oldSeekable;

    this.ease = ease;
  }

  seekTo(t: number) {
    if(this.ease === null) {
      // um.... Don't do this?
      this.oldSeek.seekTo(t);
    } else {
      this.oldSeek.seekTo(this.ease(t/this.duration)*this.duration);
    }
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
  constructor(target: AnimationTarget<T>, from: T, to: T, duration: number = 1) {
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
    this.target.value = this.target.interpFunc(this.from, this.to, t/this.duration);
  }

  /**
   * Get the appropriate interpolation function for a given type, as registered
   * by {@link registerType}.
   * @param type The type to find
   */
  static getInterpolateFunctionForType(type: string | Newable): InterpolationFunction<any> {
    for(let i = 0; i < RegisteredTweenTypes.length; i++) {
      let registration = RegisteredTweenTypes[i];
      if(registration.type === type) return registration.interpFun;
    }

    if(!quiet) {
      let strType: string = "";
      if(typeof type === "string") {
        strType = type;
      } else {
        strType = type.name;
      }
      console.warn(`[jsTween] Unknown interpolation type "${strType}"! Using the default (numeric) interpolator!\n`
                  +`[jsTween] If your animations aren't working correctly, register the correct interpolator with\n`
                  +`[jsTween] the Tween#registerType() function!`);
    }

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
  static registerType(type: string | Newable, func: InterpolationFunction<any>): void {
    if(type === null) {
      throw new TypeError("Type can't be null!");
    }

    for(let i = 0; i < RegisteredTweenTypes.length; i++) {
      let registration = RegisteredTweenTypes[i];
      if(registration.type === type) {
        let strType: string = "";
        if(typeof type === "string") {
          strType = type;
        } else {
          strType = type.name;
        }
        throw new TypeError(`Type "${strType}" has already been registered!`);
      }
    }

    RegisteredTweenTypes.push({
      "type": type,
      "interpFun": func
    });
  }

  static unregisterType(type: string | Newable): void {
    function findIndex(x: typeof RegisteredTweenTypes, find: string | Newable): number {
      for(let i = 0; i < x.length; i++) {
        if(x[i].type === find) return i;
      }
      return -1;
    }

    let index = findIndex(RegisteredTweenTypes, type);
    if(index === -1) {
      let strType: string = "";
      if(typeof type === "string") {
        strType = type;
      } else {
        strType = type.name;
      }
      throw new Error(`Type "${strType}" was never registered!`);
    } else {
      RegisteredTweenTypes.splice(index, 1);
    }
  }
}

/**
 * Defines a known animation target. While you can change the value to be
 * anything at all, take care not to give it a value with a different type
 * than the initial value. This may cause your animations to break.
 */
export class AnimationTarget<T> {
  private readonly type: string | Newable;
  public value: T;
  readonly interpFunc: InterpolationFunction<T>;

  constructor(initialValue: T, type: string | Newable = (<Newable>initialValue!.constructor)) {
    this.type = type!;
    this.value = initialValue!;

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

export class ObjectPropertyAnimationTarget<T, O, P extends keyof O> extends AnimationTarget<T> {
  readonly object: { [P in keyof O]: T };
  readonly property: P;
  value: T;

  /**
   * @param object The object whose property you want to animate.
   * @param property The property of the object you want to animate,
   * such that <code>object[property] = someValue</code> sets the animated value correctly.
   */
  constructor(object: { [P in keyof O]: T }, property: P, type: string | Newable = (<Newable>object[property]!.constructor)) {
    super(object[property], type);
    this.object = object;
    this.property = property;

    delete this.value;

    Object.defineProperty(this, "value", {
      get: function(): T {
        return this.object[this.property];
      },
      set: function(x: T) {
        this.object[this.property] = x;
      }
    });
  }
}

interface DTableEntry {
    start: number;
    end: number;
    value: Seekable;
}

export class SeqTimeline extends Seekable {
  private dtable: Array<DTableEntry>;
  private currentTime: number;

  constructor(...timeline: Seekable[]) {
    let duration = 0;
    for(let i = 0; i < timeline.length; i++) {
      duration += timeline[i].duration;
    }
    super(duration);

    let dtable: Array<DTableEntry> = [];
    let accum = 0;
    for(let i = 0; i < timeline.length; i++) {
      dtable.push({
        start: accum,
        end: accum + (timeline[i].duration),
        value: timeline[i]
      });
      accum += timeline[i].duration;
    }

    this.dtable = dtable;
    this.currentTime = 0;
  }

  seekTo(t: number): void {
    let qCurrentTime: number = this.currentTime;
    this.currentTime = clamp(t, 0, this.duration);
    let delta: number = this.currentTime - qCurrentTime;
    if(delta === 0) return;

    let lowTime = 0, highTime = 0;

    if(delta < 0) {
      lowTime = this.currentTime;
      highTime = qCurrentTime;
    } else {
      lowTime = qCurrentTime;
      highTime = this.currentTime;
    }

    for(let i = 0; i < this.dtable.length; i++) {
      let item: DTableEntry = this.dtable[i];
      if(item.end < lowTime) {
        continue;
      } else if(item.start <= highTime) {
        item.value.seekTo(clamp(this.currentTime - item.start, 0, item.value.duration));
      } else {
        break;
      }
    }
  }
}

export function seqTimeline(item: (Seekable | Seekable[]), ...rest: Seekable[]): SeqTimeline {
  if(item instanceof Array) {
    return new SeqTimeline(...item);
  } else {
    return new SeqTimeline(...[item, ...rest]);
  }
}

export class ParTimeline extends Seekable {
  timeline: Seekable[];

  constructor(...timeline: Seekable[]) {
    let duration = 0;
    for(let i = 0; i < timeline.length; i++) {
      if(duration < timeline[i].duration) {
        duration = timeline[i].duration;
      }
    }
    super(duration);

    this.timeline = timeline;
  }

  seekTo(t: number): void {
    for(let i = 0; i < this.timeline.length; i++) {
      this.timeline[i].seekTo(clamp(t, 0, this.timeline[i].duration));
    }
  }
}

export function parTimeline(item: (Seekable | Seekable[]), ...rest: Seekable[]): ParTimeline {
  if(item instanceof Array) {
    return new ParTimeline(...item);
  } else {
    return new ParTimeline(...[item, ...rest]);
  }
}

export function to<T>(target: AnimationTarget<T>, from: T, to: T, duration: number = 1): Tween<T> {
  return new Tween(target, from, to, duration);
}

Tween.registerType(Number, lerp);