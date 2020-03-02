import { EasingFunction } from './types';
import { clamp } from './functions';
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
   * @param _ The time to seek to
   */
  seekTo(_: number): void {
    // does nothing
  }

  /**
   * A convenience method that starts an animation right away, handling all the fiddly
   * details about updating the time and using `requestAnimationFrame()` for you. It
   * assumes that your durations are measured in seconds.
   */
  start(): void {
    //TODO: This is clearly not idiomatic typescript, but I wasn't sure
    //how to properly port this hack from the original JavaScript.
    let fn = function(
      this: {
        u: Seekable;
        self: (t: number) => void;
        timeStarted?: number;
      },
      timestamp: number
    ) {
      if (!this.timeStarted) {
        this.timeStarted = timestamp;
        this.u.seekTo(0);
        requestAnimationFrame(this.self.bind(this));
        return;
      }

      let dt = clamp((timestamp - this.timeStarted) / 1000, 0, this.u.duration);
      this.u.seekTo(dt);
      if (dt < this.u.duration) {
        requestAnimationFrame(this.self.bind(this));
      }
    };

    fn = fn.bind({
      u: this,
      self: fn,
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
    return new EasedSeekable(this, ease);
  }
}

class EasedSeekable extends Seekable {
  private oldSeek: Seekable;
  private ease: EasingFunction | null;

  constructor(oldSeekable: Seekable, ease: EasingFunction | null = null) {
    super(oldSeekable.duration);
    this.oldSeek = oldSeekable;

    this.ease = ease;
  }

  seekTo(t: number) {
    if (this.ease === null) {
      // um.... Don't do this?
      this.oldSeek.seekTo(t);
    } else {
      this.oldSeek.seekTo(this.ease(t / this.duration) * this.duration);
    }
  }
}
