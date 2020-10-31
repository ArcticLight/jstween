declare module "jst/functions" {
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
    export function clamp(value: number, min: number, max: number): number;
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
    export function lerp(from: number, to: number, much: number): number;
}
declare module "jst/tween" {
    /**
     * @template T
     * @param {AnimationTarget<T>} target
     * @param {T} from
     * @param {T} to
     * @param {number} duration
     * @returns {Tween<T>}
     */
    export function to<T>(target: AnimationTarget<T>, from: T, to: T, duration?: number): Tween<T>;
    /**
     * Defines a known animation target. While you can change the value
     * to be anything at all, take care not to give it a value with an
     * incompatible interpolation type than the current value, which
     * would cause your animations to break.
     * @template T
     */
    export class AnimationTarget<T> {
        /**
         * @param {T} initialValue
         * @param {any} type
         */
        constructor(initialValue: T, type?: any);
        /**
         * @private
         * @readonly
         * @type {string | (new (...args: any) => any)}
         */
        private readonly type;
        /**
         * @protected
         */
        protected _value: T;
        _f: (from: any, to: any, much: number) => any;
        set value(arg: T);
        get value(): T;
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
    export class ObjectPropertyAnimationTarget<O, K extends keyof O> extends AnimationTarget<O[K]> {
        /**
         * @param {O} object The object whose property you want to animate
         * @param {K} key The property (key) of the object you want to animate, such that
         * the code <code>object[key] = someValue</code> sets the animated value correctly.
         * @param {O[K]=} [initialValue=object[key]] The initial value of the target, which is set
         * immediately. If undefined, defaults to the value of <code>object[key]</code> at
         * construction time.
         * @param {any=} [type=undefined] Overrides the detected interpolation type, if set
         */
        constructor(object: O, key: K, initialValue?: O[K] | undefined, type?: any | undefined);
        _o: O;
        _k: K;
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
    export class Tween<T> extends Seekable {
        /**
         * @param {string | (new (...args: any) => any)} type
         * @returns {InterpolationFunction<any>}
         */
        static getInterpolateFunctionForType(type: string | (new (...args: any) => any)): InterpolationFunction<any>;
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
        static registerType<T_1>(type: string | (new (...args: any) => any), func: (from: T_1, to: T_1, much: number) => T_1): void;
        /**
         * @param {string | (new (...args: any) => any)} type
         */
        static unregisterType(type: string | (new (...args: any) => any)): void;
        /**
         * Creates a Tween of an AnimationTarget.
         *
         * @param {AnimationTarget<T>} target The AnimationTarget this Tween applies to
         * @param {T} from The start value of the Tween; must be a value of the same type that as the AnimationTarget is for
         * @param {T} to The end value of the Tween; must be a value of the same type that the AnimationTarget is for
         * @param {number} duration The duration of the Tween. Defaults to 1.
         */
        constructor(target: AnimationTarget<T>, from: T, to: T, duration?: number);
        from: T;
        to: T;
    }
    export type InterpolationFunction<T> = (from: T, to: T, much: number) => T;
    import { Seekable } from "jst/seekable.js";
}
declare module "jst/seekable" {
    /**
     * @typedef {(x: number) => number} EasingFunction
     */
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
        /**
         * @param {number} duration
         * @param {import('./tween.js').AnimationTarget<any>[]} targets
         */
        constructor(duration?: number, targets?: import('./tween.js').AnimationTarget<any>[]);
        /**
         * @readonly
         */
        readonly duration: number;
        /**
         * @readonly
         */
        readonly targets: import("jst/tween.js").AnimationTarget<any>[];
        /**
         * Set an animation to be at the time specified as t.
         * If t is outside the range <code>0 <= t <= duration</code>,
         * then its behavior is undefined, meaning that some animations may
         * extend the available animation to fit outside of the original duration,
         * and some animations may completely break.
         *
         * TL;DR: Seek with caution, clamp when necessary.
         *
         * @param {number} _ The time to seek to
         */
        seekTo(_: number): void;
        /**
         * Returns a new Seekable with the given easing function applied.
         *
         * Note that if you attempt to combine eases, e.g. you call withEase on a
         * Tween which already has an ease, the performance of the code will start
         * to get *really bad*. Consider instead creating a new ease function that
         * does what you want, and setting the Tween's ease to your new function instead.
         *
         * @param {EasingFunction} ease The easing function to use. The easing function can be any function
         * with the signature <code>(x) => number</code> where x is a number in the range <code>0 <= x <= 1</code>
         * @returns {Seekable}
         */
        withEase(ease: EasingFunction): Seekable;
    }
    export type EasingFunction = (x: number) => number;
}
declare module "jst/eases" {
    /**
     * The following eases are reproduced based on Robert Penner's original equations.
     * They are used fairly under the terms of the BSD License; the terms of this License
     * are reproduced in the EASING-LICENSE property and external file. Including it here
     * as a string means that you still respect the license even when minifying this js file
     */
    export const Eases: {
        "EASING-LICENSE": string;
        /** @param {number} x */
        easeInQuad(x: number): number;
        /** @param {number} x */
        easeOutQuad(x: number): number;
        /** @param {number} x */
        easeInOutQuad(x: number): number;
        /** @param {number} x */
        easeInCubic(x: number): number;
        /** @param {number} x */
        easeOutCubic(x: number): number;
        /** @param {number} x */
        easeInOutCubic(x: number): number;
        /** @param {number} x */
        easeInQuart(x: number): number;
        /** @param {number} x */
        easeOutQuart(x: number): number;
        /** @param {number} x */
        easeInOutQuart(x: number): number;
        /** @param {number} x */
        easeInQuint(x: number): number;
        /** @param {number} x */
        easeOutQuint(x: number): number;
        /** @param {number} x */
        easeInOutQuint(x: number): number;
    };
}
declare module "jst/timelines" {
    /**
     * @param {Seekable | Seekable[]} item
     * @param {Seekable[]} rest
     * @returns {SeqTimeline}
     */
    export function seqTimeline(item: Seekable | Seekable[], ...rest: Seekable[]): SeqTimeline;
    /**
     * @param {Seekable | Seekable[]} item
     * @param {Seekable[]} rest
     * @returns {ParTimeline}
     */
    export function parTimeline(item: Seekable | Seekable[], ...rest: Seekable[]): ParTimeline;
    export class SeqTimeline extends Seekable {
        /** @param {Seekable[]} timeline */
        constructor(...timeline: Seekable[]);
        /** @private */
        private _dTable;
        /** @private */
        private _currentTime;
    }
    export class ParTimeline extends Seekable {
        /**
         * @param {Seekable[]} timeline
         */
        constructor(...timeline: Seekable[]);
        /** @private */
        private _timeline;
    }
    import { Seekable } from "jst/seekable.js";
}
declare module "index" {
    import { lerp } from "jst/functions.js";
    import { clamp } from "jst/functions.js";
    import { Seekable } from "jst/seekable.js";
    import { Eases } from "jst/eases.js";
    import { Tween } from "jst/tween.js";
    import { to } from "jst/tween.js";
    import { AnimationTarget } from "jst/tween.js";
    import { ObjectPropertyAnimationTarget } from "jst/tween.js";
    import { SeqTimeline } from "jst/timelines.js";
    import { seqTimeline } from "jst/timelines.js";
    import { ParTimeline } from "jst/timelines.js";
    import { parTimeline } from "jst/timelines.js";
    export { lerp, clamp, Seekable, Eases, Tween, to, AnimationTarget, ObjectPropertyAnimationTarget, SeqTimeline, seqTimeline, ParTimeline, parTimeline };
}
//# sourceMappingURL=index.d.ts.map