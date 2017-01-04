"use strict"

const should = require('chai').should()

const jsTween = require('../build/index.js')
jsTween.quiet = true
const {lerp, clamp, Tween, AnimationTarget, ObjectPropertyAnimationTarget, seqTimeline, parTimeline} = jsTween

describe('AnimationTarget', () => {
    it('should be instantiable', () => {
        new AnimationTarget(0)
    })

    it('should have the type of the object it is instantiated with by default', () => {
        let target = new AnimationTarget(0)
        target.type.should.equal(Number)

        target = new AnimationTarget(new String(""))
        target.type.should.equal(String)
    })

    it.skip('should not be able to change its type', () => {
        function bad() {
            let target = new AnimationTarget(0)
            let oldType = target.type
            let newType = TypeError
            target.type = newType
            target.type.should.equal(Number);
        }
        bad.should.throw(TypeError);
    })

    it('should have the initial value', () => {
        let target = new AnimationTarget(42)
        target.value.should.equal(42)
    })

    it('should be able to set its value', () => {
        let target = new AnimationTarget(42)
        target.value.should.equal(42)
        target.value = 81
        target.value.should.equal(81)
    })
})

describe('ObjectPropertyAnimationTarget', () => {
    describe('in general', () => {
        it('should be instantiable', () => {
            new ObjectPropertyAnimationTarget({foo: 0}, "foo")
        })

        it('should have the type of the named property at creation time by default', () => {
            let t = new ObjectPropertyAnimationTarget({bar: 0, baz: new TypeError("")}, "baz")
            t.type.should.equal(TypeError)
        })
    })

    describe('when instantiated', () => {
        beforeEach(function() {
            global.targetObject = {
                a: 0,
                b: 3
            }

            global.target = new jsTween.ObjectPropertyAnimationTarget(global.targetObject, "a", Number)
        })

        it('should be able to set its value (thus causing side effects)', () => {
            global.targetObject.a.should.equal(0)
            global.target.value = 16
            global.targetObject.a.should.equal(16)
        })

        it('should be able to get a new value (given outside effects)', () => {
            global.targetObject.a.should.equal(0)
            global.target.value.should.equal(0)
            global.targetObject.a = 32
            global.targetObject.a.should.equal(32)
            global.target.value.should.equal(32)
        })
    })
})

describe('Tween', () => {
    describe('#getInterpolateFunctionForType()', () => {
        it('should return exactly module.exports.lerp on type "number"', () => {
            Tween.getInterpolateFunctionForType(Number).should.equal(lerp)
        })

        it('should return exactly module.exports.lerp on an unknown type', () => {
            Tween.getInterpolateFunctionForType(TypeError).should.equal(lerp)
        })
    })

    describe('#registerType()', () => {
        it('should register a type', () => {
            function foo(x, y, z) {
                return 42
            }

            Tween.registerType(RangeError, foo)
            Tween.getInterpolateFunctionForType(RangeError).should.equal(foo)
        })

        it('should fail to register a type twice', () => {
            function bad() {
                Tween.registerType("aNewType2", null)
                Tween.registerType("aNewType2", null)
            }

            bad.should.throw(TypeError)
        })
    })

    describe('#unregisterType()', () => {
        it('should unregister a registered type', () => {
            function foo() {}

            Tween.registerType(String, foo)
            Tween.getInterpolateFunctionForType(String).should.equal(foo)
            Tween.unregisterType(String)
            Tween.getInterpolateFunctionForType(String).should.equal(lerp)
        })

        it('should throw when unregistering a *non* registered type', () => {
            Tween.getInterpolateFunctionForType(String).should.equal(lerp)
            
            function bad() {
                Tween.unregisterType(String)
            }

            bad.should.throw(Error)
        })
    })

    describe('#to()', () => {
        beforeEach(function() {
            global.target = new AnimationTarget(0)
        })

        it('should create a Tween', () => {
            let t = jsTween.to(global.target, 0, 1)
            t.constructor.should.equal(Tween)
        })

        it('should interpolate forwards to a new value', () => {
            jsTween.to(global.target, 0, 1).seekTo(1)
            global.target.value.should.equal(1)
        })

        it('should interpolate backwards to time 0 with a start value not equal to the current value', () => {
            global.target.value.should.equal(0)
            jsTween.to(global.target, -1, 1).seekTo(0)
            global.target.value.should.equal(-1)
        })

        it('should interpolate halfway', () => {
            jsTween.to(global.target, 0, 1).seekTo(0.5)
            global.target.value.should.equal(0.5)
        })

        it('should seek completely with a large duration', () => {
            jsTween.to(global.target, 0, 35, 999).seekTo(999)
            global.target.value.should.equal(35)
        })

        it('should interpolate halfway with a larger duration', () => {
            jsTween.to(global.target, 0, 18, 2000000).seekTo(1000000)
            global.target.value.should.equal(9)
        })
    })
})

describe('SeqTimeline', function() {

    describe('with a 3-element sequence', () =>{
        beforeEach(function() {
            global.a = new AnimationTarget(0)
            global.b = new AnimationTarget(0)
            global.c = new AnimationTarget(0)
            global.timeline = seqTimeline(
                jsTween.to(a, 0, 1),
                jsTween.to(b, 0, 1),
                jsTween.to(c, 0, 1)
            )
        })

        it('should interpolate fully with the complete duration', () => {
            global.a.value.should.equal(0)
            global.b.value.should.equal(0)
            global.c.value.should.equal(0)
            global.timeline.seekTo(3)
            global.a.value.should.equal(1)
            global.b.value.should.equal(1)
            global.c.value.should.equal(1)
        })

        it('should interpolate the first value fully on the first edge', () => {
            global.a.value.should.equal(0)
            global.b.value.should.equal(0)
            global.c.value.should.equal(0)
            global.timeline.seekTo(1)
            global.a.value.should.equal(1)
            global.b.value.should.equal(0)
            global.c.value.should.equal(0)
        })

        it('should interpolate the first and second value fully on the second edge', () => {
            global.a.value.should.equal(0)
            global.b.value.should.equal(0)
            global.c.value.should.equal(0)
            global.timeline.seekTo(2)
            global.a.value.should.equal(1)
            global.b.value.should.equal(1)
            global.c.value.should.equal(0)
        })

        it('should interpolate the first value fully and second value halfway when seeked halfway', () => {
            global.a.value.should.equal(0)
            global.b.value.should.equal(0)
            global.c.value.should.equal(0)
            global.timeline.seekTo(1.5)
            global.a.value.should.equal(1)
            global.b.value.should.equal(0.5)
            global.c.value.should.equal(0)
        })

        it('should seek forwards and then backwards completely', () => {
            global.a.value.should.equal(0)
            global.b.value.should.equal(0)
            global.c.value.should.equal(0)
            global.timeline.seekTo(3)
            global.timeline.seekTo(0)
            global.a.value.should.equal(0)
            global.b.value.should.equal(0)
            global.c.value.should.equal(0)
        })

        it('should perform a complicated seek correctly', () => {
            global.a.value.should.equal(0)
            global.b.value.should.equal(0)
            global.c.value.should.equal(0)
            global.timeline.seekTo(3)
            global.timeline.seekTo(1.5)
            global.timeline.seekTo(0)
            global.timeline.seekTo(2)
            global.timeline.seekTo(1.1)
            global.timeline.seekTo(1.25)
            global.a.value.should.equal(1)
            global.b.value.should.equal(.25)
            global.c.value.should.equal(0)
        })
    })

    describe('With a 10,000 element sequence', function() {
        beforeEach(function(done) {
            this.timeout(500)

            let timeline = []
            let duration = 0
            for(let i = 0; i < 10000; i++) {
                timeline.push(
                    jsTween.to(new AnimationTarget(0), 0, 1, i)
                )
                duration += i
            }
            global.duration = duration
            global.timeline = seqTimeline(timeline)
            done()
        })

        it('should finish in less than 10ms when doing a complicated seek', function(done) {
            this.timeout(10)
            global.timeline.seekTo(global.duration)
            global.timeline.seekTo(global.duration/2)
            global.timeline.seekTo(global.duration/4)
            global.timeline.seekTo(global.duration)
            global.timeline.seekTo(0)
            done()
        })
    })
})