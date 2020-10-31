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
  constructor(duration = 1, targets = []) {
    /**
     * @readonly
     */
    this.duration = duration;

    /**
     * @readonly
     */
    this.targets = targets;
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
   * @param {number} _ The time to seek to
   */
  seekTo(_) {
    // default implementation does nothing
  }

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
  withEase(ease) {
    return new EasedSeekable(this, ease);
  }
}

class EasedSeekable extends Seekable {
  /**
   * @param {Seekable} oldSeekable
   * @param {EasingFunction | null} ease
   */
  constructor(oldSeekable, ease) {
    super(oldSeekable.duration)
    /** @private */
    this._old = oldSeekable;
    /** @private */
    this._ease = ease;
  }

  /**
   * @override
   * @param {number} t
   */
  seekTo(t) {
    if (!this._ease) {
      // um... Don't do this?
      this._old.seekTo(t);
    } else {
      this._old.seekTo(this._ease(t / this.duration) * this.duration);
    }
  }
}
