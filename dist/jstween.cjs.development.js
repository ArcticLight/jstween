'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
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

function lerp(from, to, much) {
  return from + (to - from) * much;
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
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

var Seekable =
/*#__PURE__*/
function () {
  function Seekable(duration) {
    if (duration === void 0) {
      duration = 1;
    }

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


  var _proto = Seekable.prototype;

  _proto.seekTo = function seekTo(_) {} // does nothing

  /**
   * A convenience method that starts an animation right away, handling all the fiddly
   * details about updating the time and using `requestAnimationFrame()` for you. It
   * assumes that your durations are measured in seconds.
   */
  ;

  _proto.start = function start() {
    //TODO: This is clearly not idiomatic typescript, but I wasn't sure
    //how to properly port this hack from the original JavaScript.
    var fn = function fn(timestamp) {
      if (!this.timeStarted) {
        this.timeStarted = timestamp;
        this.u.seekTo(0);
        requestAnimationFrame(this.self.bind(this));
        return;
      }

      var dt = clamp((timestamp - this.timeStarted) / 1000, 0, this.u.duration);
      this.u.seekTo(dt);

      if (dt < this.u.duration) {
        requestAnimationFrame(this.self.bind(this));
      }
    };

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
  ;

  _proto.withEase = function withEase(ease) {
    return new EasedSeekable(this, ease);
  };

  return Seekable;
}();

var EasedSeekable =
/*#__PURE__*/
function (_Seekable) {
  _inheritsLoose(EasedSeekable, _Seekable);

  function EasedSeekable(oldSeekable, ease) {
    var _this;

    if (ease === void 0) {
      ease = null;
    }

    _this = _Seekable.call(this, oldSeekable.duration) || this;
    _this.oldSeek = oldSeekable;
    _this.ease = ease;
    return _this;
  }

  var _proto2 = EasedSeekable.prototype;

  _proto2.seekTo = function seekTo(t) {
    if (this.ease === null) {
      // um.... Don't do this?
      this.oldSeek.seekTo(t);
    } else {
      this.oldSeek.seekTo(this.ease(t / this.duration) * this.duration);
    }
  };

  return EasedSeekable;
}(Seekable);

/**
 * The following eases are reproduced based on Robert Penner's original equations.
 * They are used fairly under the terms of the BSD License; the terms of this License
 * are reproduced in the EASING-LICENSE property and external file. Including it here
 * as a string means that you still respect the license even when minifying this js file
 * or including a minified version in a project, how cool is that!?
 */
var Eases = {
  "EASING-LICENSE": "The code in this JavaScript object is licensed under the following terms: TERMS OF USE - EASING EQUATIONS\n\nOpen source under the BSD License. \n\nCopyright © 2001 Robert Penner\nAll rights reserved.\n\nRedistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:\n\nRedistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.\nRedistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.\nNeither the name of the author nor the names of contributors may be used to endorse or promote products derived from this software without specific prior written permission.\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.",
  "easeInQuad": function easeInQuad(x) {
    return x * x;
  },
  "easeOutQuad": function easeOutQuad(x) {
    return -1 * x * (x - 2);
  },
  "easeInOutQuad": function easeInOutQuad(x) {
    if ((x /= 1 / 2) < 1) return 1 / 2 * x * x;
    return -1 / 2 * (--x * (x - 2) - 1);
  },
  "easeInCubic": function easeInCubic(x) {
    return x * x * x;
  },
  "easeOutCubic": function easeOutCubic(x) {
    return --x * x * x + 1;
  },
  "easeInOutCubic": function easeInOutCubic(x) {
    if ((x /= 1 / 2) < 1) return 1 / 2 * x * x * x;
    return 1 / 2 * ((x -= 2) * x * x + 2);
  },
  "easeInQuart": function easeInQuart(x) {
    return x * x * x * x;
  },
  "easeOutQuart": function easeOutQuart(x) {
    return -1 * (--x * x * x * x - 1);
  },
  "easeInQuint": function easeInQuint(x) {
    return x * x * x * x * x;
  },
  "easeOutQuint": function easeOutQuint(x) {
    return --x * x * x * x * x + 1;
  }
};

var RegisteredTweenTypes =
/*#__PURE__*/
new Map();
/**
 * Defines a known animation target. While you can change the value to be
 * anything at all, take care not to give it a value with a different type
 * than the initial value. This may cause your animations to break.
 */

var AnimationTarget = function AnimationTarget(initialValue, type) {
  if (type === void 0) {
    type = initialValue;
  }

  if (typeof type === 'string') {
    this.type = type;
  } else if (type.constructor) {
    this.type = type.constructor;
  } else {
    this.type = typeof type;
  }

  this.value = initialValue;
  this.interpFunc = Tween.getInterpolateFunctionForType(this.type);
};
/**
 * Defines an animation target for a completely separate object's property.
 *
 * WARNING: This is an ugly hack which is provided for compatibility purposes;
 * ideally you should ABSOLUTELY design your own objects which make use of the proper
 * AnimationTarget and not use ObjectPropertyAnimator.
 *
 * Be careful when using objects of this type, because behavior may be odd.
 */

var ObjectPropertyAnimationTarget =
/*#__PURE__*/
function (_AnimationTarget) {
  _inheritsLoose(ObjectPropertyAnimationTarget, _AnimationTarget);

  /**
   * @param object The object whose property you want to animate.
   * @param property The property of the object you want to animate,
   * such that <code>object[property] = someValue</code> sets the animated value correctly.
   */
  function ObjectPropertyAnimationTarget(object, property, type) {
    var _this;

    if (type === void 0) {
      type = object[property];
    }

    _this = _AnimationTarget.call(this, object[property], type) || this;
    _this.object = object;
    _this.property = property; // @ts-ignore: Comes from superclass

    delete _this.value;
    Object.defineProperty(_assertThisInitialized(_this), "value", {
      get: function get() {
        return this.object[this.property];
      },
      set: function set(x) {
        this.object[this.property] = x;
      }
    });
    return _this;
  }

  return ObjectPropertyAnimationTarget;
}(AnimationTarget);
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

var Tween =
/*#__PURE__*/
function (_Seekable) {
  _inheritsLoose(Tween, _Seekable);

  /**
   * Creates a Tween of an AnimationTarget.
   *
   * @param target The AnimationTarget this Tween applies to
   * @param from The start value of the Tween; must be a value of the same type that as the AnimationTarget is for
   * @param to The end value of the Tween; must be a value of the same type that the AnimationTarget is for
   * @param duration The duration of the Tween. Defaults to 1.
   */
  function Tween(target, from, to, duration) {
    var _this2;

    if (duration === void 0) {
      duration = 1;
    }

    _this2 = _Seekable.call(this, duration) || this;
    _this2.target = target;
    _this2.from = from;
    _this2.to = to;
    return _this2;
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


  var _proto = Tween.prototype;

  _proto.seekTo = function seekTo(t) {
    this.target.value = this.target.interpFunc(this.from, this.to, t / this.duration);
  }
  /**
   * Get the appropriate interpolation function for a given type, as registered
   * by {@link registerType}.
   * @param type The type to find
   */
  ;

  Tween.getInterpolateFunctionForType = function getInterpolateFunctionForType(type) {
    var registration = RegisteredTweenTypes.get(type);

    if (registration) {
      return registration.interpFun;
    }

    var strType = typeof type === 'string' ? type : typeof type;
    console.warn("[jsTween] Unknown interpolation type \"" + strType + "\"! Using the default (numeric) interpolator!\n" + "[jsTween] If your animations aren't working correctly, register the correct interpolator with\n" + "[jsTween] the Tween#registerType() function!");
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
  ;

  Tween.registerType = function registerType(type, func) {
    if (type === null) {
      throw new TypeError("Type can't be null!");
    }

    if (RegisteredTweenTypes.has(type)) {
      var strType = typeof type === 'string' ? type : typeof type;
      throw new TypeError("Type \"" + strType + "\" has already been registered!");
    }

    RegisteredTweenTypes.set(type, {
      "type": type,
      "interpFun": func
    });
  };

  Tween.unregisterType = function unregisterType(type) {
    if (!RegisteredTweenTypes.has(type)) {
      var strType = typeof type === 'string' ? type : typeof type;
      throw new Error("Type \"" + strType + "\" was never registered!");
    } else {
      RegisteredTweenTypes["delete"](type);
    }
  };

  return Tween;
}(Seekable);
function to(target, from, to, duration) {
  if (duration === void 0) {
    duration = 1;
  }

  return new Tween(target, from, to, duration);
}
Tween.registerType(Number, lerp);

var SeqTimeline =
/*#__PURE__*/
function (_Seekable) {
  _inheritsLoose(SeqTimeline, _Seekable);

  function SeqTimeline() {
    var _this;

    var duration = 0;

    for (var _len = arguments.length, timeline = new Array(_len), _key = 0; _key < _len; _key++) {
      timeline[_key] = arguments[_key];
    }

    for (var i = 0; i < timeline.length; i++) {
      duration += timeline[i].duration;
    }

    _this = _Seekable.call(this, duration) || this; // TODO: The DTable could be much more performant
    // for linear seeking if it were a b-tree instead
    // of an array

    var dtable = [];
    var accum = 0;

    for (var _i = 0; _i < timeline.length; _i++) {
      dtable.push({
        start: accum,
        end: accum + timeline[_i].duration,
        value: timeline[_i]
      });
      accum += timeline[_i].duration;
    }

    _this.dtable = dtable;
    _this.currentTime = 0;
    return _this;
  }

  var _proto = SeqTimeline.prototype;

  _proto.seekTo = function seekTo(t) {
    var qCurrentTime = this.currentTime;
    this.currentTime = clamp(t, 0, this.duration);
    var delta = this.currentTime - qCurrentTime;

    if (t === 0) {
      this.dtable[0].value.seekTo(0);
    }

    if (delta === 0) return;
    var lowTime = 0,
        highTime = 0;
    var forwards = true;

    if (delta < 0) {
      forwards = false;
      lowTime = this.currentTime;
      highTime = qCurrentTime;
    } else {
      lowTime = qCurrentTime;
      highTime = this.currentTime;
    }

    if (forwards) {
      for (var i = 0; i < this.dtable.length; i++) {
        var item = this.dtable[i];

        if (item.end < lowTime) {
          continue;
        } else if (item.start <= highTime) {
          item.value.seekTo(clamp(this.currentTime - item.start, 0, item.value.duration));
        } else {
          break;
        }
      }
    } // if (forwards) { ... }
    else {
        for (var _i2 = this.dtable.length - 1; _i2 >= 0; _i2--) {
          var _item = this.dtable[_i2];

          if (_item.start > highTime) {
            continue;
          } else if (_item.end >= lowTime) {
            _item.value.seekTo(clamp(this.currentTime - _item.start, 0, _item.value.duration));
          } else {
            break;
          }
        }
      }
  };

  return SeqTimeline;
}(Seekable);
function seqTimeline(item) {
  if (item instanceof Array) {
    return _construct(SeqTimeline, item);
  } else {
    for (var _len2 = arguments.length, rest = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      rest[_key2 - 1] = arguments[_key2];
    }

    return _construct(SeqTimeline, [item].concat(rest));
  }
}
var ParTimeline =
/*#__PURE__*/
function (_Seekable2) {
  _inheritsLoose(ParTimeline, _Seekable2);

  function ParTimeline() {
    var _this2;

    var duration = 0;

    for (var _len3 = arguments.length, timeline = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      timeline[_key3] = arguments[_key3];
    }

    for (var i = 0; i < timeline.length; i++) {
      if (duration < timeline[i].duration) {
        duration = timeline[i].duration;
      }
    }

    _this2 = _Seekable2.call(this, duration) || this;
    _this2.timeline = timeline;
    return _this2;
  }

  var _proto2 = ParTimeline.prototype;

  _proto2.seekTo = function seekTo(t) {
    for (var i = 0; i < this.timeline.length; i++) {
      this.timeline[i].seekTo(clamp(t, 0, this.timeline[i].duration));
    }
  };

  return ParTimeline;
}(Seekable);
function parTimeline(item) {
  if (item instanceof Array) {
    return _construct(ParTimeline, item);
  } else {
    for (var _len4 = arguments.length, rest = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      rest[_key4 - 1] = arguments[_key4];
    }

    return _construct(ParTimeline, [item].concat(rest));
  }
}

exports.AnimationTarget = AnimationTarget;
exports.Eases = Eases;
exports.ObjectPropertyAnimationTarget = ObjectPropertyAnimationTarget;
exports.ParTimeline = ParTimeline;
exports.Seekable = Seekable;
exports.SeqTimeline = SeqTimeline;
exports.Tween = Tween;
exports.clamp = clamp;
exports.lerp = lerp;
exports.parTimeline = parTimeline;
exports.seqTimeline = seqTimeline;
exports.to = to;
//# sourceMappingURL=jstween.cjs.development.js.map
