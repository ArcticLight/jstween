"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var raf = require("raf");
raf.polyfill();
var RegisteredTweenTypes = [];
exports.quiet = false;
function clamp(value, min, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}
exports.clamp = clamp;
function lerp(from, to, much) {
    return from + (to - from) * much;
}
exports.lerp = lerp;
exports.Eases = {
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

var Seekable = function () {
    function Seekable() {
        var duration = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

        _classCallCheck(this, Seekable);

        this.duration = duration;
    }

    _createClass(Seekable, [{
        key: "seekTo",
        value: function seekTo(t) {}
    }, {
        key: "start",
        value: function start() {
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
    }, {
        key: "withEase",
        value: function withEase(ease) {
            return new EasedSeekable(this, ease);
        }
    }]);

    return Seekable;
}();

exports.Seekable = Seekable;

var EasedSeekable = function (_Seekable) {
    _inherits(EasedSeekable, _Seekable);

    function EasedSeekable(oldSeekable) {
        var ease = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        _classCallCheck(this, EasedSeekable);

        var _this = _possibleConstructorReturn(this, (EasedSeekable.__proto__ || Object.getPrototypeOf(EasedSeekable)).call(this, oldSeekable.duration));

        _this.oldSeek = oldSeekable;
        _this.ease = ease;
        return _this;
    }

    _createClass(EasedSeekable, [{
        key: "seekTo",
        value: function seekTo(t) {
            if (this.ease === null) {
                this.oldSeek.seekTo(t);
            } else {
                this.oldSeek.seekTo(this.ease(t / this.duration) * this.duration);
            }
        }
    }]);

    return EasedSeekable;
}(Seekable);

exports.EasedSeekable = EasedSeekable;

var Tween = function (_Seekable2) {
    _inherits(Tween, _Seekable2);

    function Tween(target, from, to) {
        var duration = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

        _classCallCheck(this, Tween);

        var _this2 = _possibleConstructorReturn(this, (Tween.__proto__ || Object.getPrototypeOf(Tween)).call(this, duration));

        _this2.target = target;
        _this2.from = from;
        _this2.to = to;
        return _this2;
    }

    _createClass(Tween, [{
        key: "seekTo",
        value: function seekTo(t) {
            this.target.value = this.target.interpFunc(this.from, this.to, t / this.duration);
        }
    }], [{
        key: "getInterpolateFunctionForType",
        value: function getInterpolateFunctionForType(type) {
            for (var i = 0; i < RegisteredTweenTypes.length; i++) {
                var registration = RegisteredTweenTypes[i];
                if (registration.type === type) return registration.interpFun;
            }
            if (!exports.quiet) {
                var strType = "";
                if (typeof type === "string") {
                    strType = type;
                } else {
                    strType = type.name;
                }
                console.warn("[jsTween] Unknown interpolation type \"" + strType + "\"! Using the default (numeric) interpolator!\n" + "[jsTween] If your animations aren't working correctly, register the correct interpolator with\n" + "[jsTween] the Tween#registerType() function!");
            }
            return lerp;
        }
    }, {
        key: "registerType",
        value: function registerType(type, func) {
            if (type === null) {
                throw new TypeError("Type can't be null!");
            }
            for (var i = 0; i < RegisteredTweenTypes.length; i++) {
                var registration = RegisteredTweenTypes[i];
                if (registration.type === type) {
                    var strType = "";
                    if (typeof type === "string") {
                        strType = type;
                    } else {
                        strType = type.name;
                    }
                    throw new TypeError("Type \"" + strType + "\" has already been registered!");
                }
            }
            RegisteredTweenTypes.push({
                "type": type,
                "interpFun": func
            });
        }
    }, {
        key: "unregisterType",
        value: function unregisterType(type) {
            function findIndex(x, find) {
                for (var i = 0; i < x.length; i++) {
                    if (x[i].type === find) return i;
                }
                return -1;
            }
            var index = findIndex(RegisteredTweenTypes, type);
            if (index === -1) {
                var strType = "";
                if (typeof type === "string") {
                    strType = type;
                } else {
                    strType = type.name;
                }
                throw new Error("Type \"" + strType + "\" was never registered!");
            } else {
                RegisteredTweenTypes.splice(index, 1);
            }
        }
    }]);

    return Tween;
}(Seekable);

exports.Tween = Tween;

var AnimationTarget = function AnimationTarget(initialValue) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : initialValue.constructor;

    _classCallCheck(this, AnimationTarget);

    this.type = type;
    this.value = initialValue;
    this.interpFunc = Tween.getInterpolateFunctionForType(this.type);
};

exports.AnimationTarget = AnimationTarget;

var ObjectPropertyAnimationTarget = function (_AnimationTarget) {
    _inherits(ObjectPropertyAnimationTarget, _AnimationTarget);

    function ObjectPropertyAnimationTarget(object, property) {
        var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : object[property].constructor;

        _classCallCheck(this, ObjectPropertyAnimationTarget);

        var _this3 = _possibleConstructorReturn(this, (ObjectPropertyAnimationTarget.__proto__ || Object.getPrototypeOf(ObjectPropertyAnimationTarget)).call(this, object[property], type));

        _this3.object = object;
        _this3.property = property;
        delete _this3.value;
        Object.defineProperty(_this3, "value", {
            get: function get() {
                return this.object[this.property];
            },
            set: function set(x) {
                this.object[this.property] = x;
            }
        });
        return _this3;
    }

    return ObjectPropertyAnimationTarget;
}(AnimationTarget);

exports.ObjectPropertyAnimationTarget = ObjectPropertyAnimationTarget;

var SeqTimeline = function (_Seekable3) {
    _inherits(SeqTimeline, _Seekable3);

    function SeqTimeline() {
        _classCallCheck(this, SeqTimeline);

        var duration = 0;

        for (var _len = arguments.length, timeline = Array(_len), _key = 0; _key < _len; _key++) {
            timeline[_key] = arguments[_key];
        }

        for (var i = 0; i < timeline.length; i++) {
            duration += timeline[i].duration;
        }

        var _this4 = _possibleConstructorReturn(this, (SeqTimeline.__proto__ || Object.getPrototypeOf(SeqTimeline)).call(this, duration));

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
        _this4.dtable = dtable;
        _this4.currentTime = 0;
        return _this4;
    }

    _createClass(SeqTimeline, [{
        key: "seekTo",
        value: function seekTo(t) {
            var qCurrentTime = this.currentTime;
            this.currentTime = clamp(t, 0, this.duration);
            var delta = this.currentTime - qCurrentTime;
            if (delta === 0) return;
            var lowTime = 0,
                highTime = 0;
            if (delta < 0) {
                lowTime = this.currentTime;
                highTime = qCurrentTime;
            } else {
                lowTime = qCurrentTime;
                highTime = this.currentTime;
            }
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
        }
    }]);

    return SeqTimeline;
}(Seekable);

exports.SeqTimeline = SeqTimeline;
function seqTimeline(item) {
    if (item instanceof Array) {
        return new (Function.prototype.bind.apply(SeqTimeline, [null].concat(_toConsumableArray(item))))();
    } else {
        for (var _len2 = arguments.length, rest = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            rest[_key2 - 1] = arguments[_key2];
        }

        return new (Function.prototype.bind.apply(SeqTimeline, [null].concat([item].concat(rest))))();
    }
}
exports.seqTimeline = seqTimeline;

var ParTimeline = function (_Seekable4) {
    _inherits(ParTimeline, _Seekable4);

    function ParTimeline() {
        _classCallCheck(this, ParTimeline);

        var duration = 0;

        for (var _len3 = arguments.length, timeline = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            timeline[_key3] = arguments[_key3];
        }

        for (var i = 0; i < timeline.length; i++) {
            if (duration < timeline[i].duration) {
                duration = timeline[i].duration;
            }
        }

        var _this5 = _possibleConstructorReturn(this, (ParTimeline.__proto__ || Object.getPrototypeOf(ParTimeline)).call(this, duration));

        _this5.timeline = timeline;
        return _this5;
    }

    _createClass(ParTimeline, [{
        key: "seekTo",
        value: function seekTo(t) {
            for (var i = 0; i < this.timeline.length; i++) {
                this.timeline[i].seekTo(clamp(t, 0, this.timeline[i].duration));
            }
        }
    }]);

    return ParTimeline;
}(Seekable);

exports.ParTimeline = ParTimeline;
function parTimeline(item) {
    if (item instanceof Array) {
        return new (Function.prototype.bind.apply(ParTimeline, [null].concat(_toConsumableArray(item))))();
    } else {
        for (var _len4 = arguments.length, rest = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
            rest[_key4 - 1] = arguments[_key4];
        }

        return new (Function.prototype.bind.apply(ParTimeline, [null].concat([item].concat(rest))))();
    }
}
exports.parTimeline = parTimeline;
function to(target, from, to) {
    var duration = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

    return new Tween(target, from, to, duration);
}
exports.to = to;
Tween.registerType(Number, lerp);
//# sourceMappingURL=index.js.map
