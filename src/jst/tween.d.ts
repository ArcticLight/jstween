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
import { Seekable } from "./seekable.js";
//# sourceMappingURL=tween.d.ts.map