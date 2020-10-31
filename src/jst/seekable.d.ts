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
    readonly targets: import("./tween.js").AnimationTarget<any>[];
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
//# sourceMappingURL=seekable.d.ts.map