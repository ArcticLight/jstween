import chai from 'chai';
import {
  lerp,
  Tween,
  AnimationTarget,
  ObjectPropertyAnimationTarget,
  SeqTimeline,
  seqTimeline,
  to,
} from '../src';

chai.should();

describe('AnimationTarget', () => {
  it('should be instantiable', () => {
    new AnimationTarget(0);
  });

  it('should have the type of the object it is instantiated with by default', () => {
    let target = new AnimationTarget(0) as any;
    target.type.should.equal(Number);

    target = new AnimationTarget('');
    target.type.should.equal(String);
  });

  it.skip('should not be able to change its type', () => {
    function bad() {
      let target = new AnimationTarget(0) as any;
      target.type = TypeError;
      target.type.should.equal(Number);
    }
    bad.should.throw(TypeError);
  });

  it('should have the initial value', () => {
    let target = new AnimationTarget(42);
    target.value.should.equal(42);
  });

  it('should be able to set its value', () => {
    let target = new AnimationTarget(42);
    target.value.should.equal(42);
    target.value = 81;
    target.value.should.equal(81);
  });
});

describe('ObjectPropertyAnimationTarget', () => {
  describe('in general', () => {
    it('should be instantiable', () => {
      new ObjectPropertyAnimationTarget({ foo: 0 }, 'foo');
    });

    it('should have the type of the named property at creation time by default', () => {
      let t = new ObjectPropertyAnimationTarget(
        { bar: 0, baz: new TypeError('') },
        'baz'
      ) as any;
      t.type.should.equal(TypeError);
    });
  });

  describe('when instantiated', () => {
    let global: {
      target: AnimationTarget<number>;
      targetObject: {
        a: number;
        b: number;
      };
    };
    beforeEach(function() {
      const targetObject = {
        a: 0,
        b: 3,
      };
      global = {
        targetObject,
        target: new ObjectPropertyAnimationTarget(targetObject, 'a', Number),
      };
    });

    it('should be able to set its value (thus causing side effects)', () => {
      global.targetObject.a.should.equal(0);
      global.target.value = 16;
      global.targetObject.a.should.equal(16);
    });

    it('should be able to get a new value (given outside effects)', () => {
      global.targetObject.a.should.equal(0);
      global.target.value.should.equal(0);
      global.targetObject.a = 32;
      global.targetObject.a.should.equal(32);
      global.target.value.should.equal(32);
    });
  });
});

describe('Tween', () => {
  describe('#getInterpolateFunctionForType()', () => {
    it('should return exactly module.exports.lerp on type "number"', () => {
      Tween.getInterpolateFunctionForType(Number).should.equal(lerp);
    });

    it('should return exactly module.exports.lerp on an unknown type', () => {
      Tween.getInterpolateFunctionForType(TypeError).should.equal(lerp);
    });
  });

  describe('#registerType()', () => {
    it('should register a type', () => {
      function foo(_x: any, _y: any, _z: any) {
        return 42;
      }

      Tween.registerType(RangeError, foo);
      Tween.getInterpolateFunctionForType(RangeError).should.equal(foo);
    });

    it('should fail to register a type twice', () => {
      function bad() {
        Tween.registerType('aNewType2', () => {});
        Tween.registerType('aNewType2', () => {});
      }

      bad.should.throw(TypeError);
    });
  });

  describe('#unregisterType()', () => {
    it('should unregister a registered type', () => {
      function foo() {}

      Tween.registerType(String, foo);
      Tween.getInterpolateFunctionForType(String).should.equal(foo);
      Tween.unregisterType(String);
      Tween.getInterpolateFunctionForType(String).should.equal(lerp);
    });

    it('should throw when unregistering a *non* registered type', () => {
      Tween.getInterpolateFunctionForType(String).should.equal(lerp);

      function bad() {
        Tween.unregisterType(String);
      }

      bad.should.throw(Error);
    });
  });

  describe('#to()', () => {
    let global: { target: AnimationTarget<number> };
    beforeEach(function() {
      global = {
        target: new AnimationTarget(0),
      };
    });

    it('should create a Tween', () => {
      let t = to(global.target, 0, 1);
      t.constructor.should.equal(Tween);
    });

    it('should interpolate forwards to a new value', () => {
      to(global.target, 0, 1).seekTo(1);
      global.target.value.should.equal(1);
    });

    it('should interpolate backwards to time 0 with a start value not equal to the current value', () => {
      global.target.value.should.equal(0);
      to(global.target, -1, 1).seekTo(0);
      global.target.value.should.equal(-1);
    });

    it('should interpolate halfway', () => {
      to(global.target, 0, 1).seekTo(0.5);
      global.target.value.should.equal(0.5);
    });

    it('should seek completely with a large duration', () => {
      to(global.target, 0, 35, 999).seekTo(999);
      global.target.value.should.equal(35);
    });

    it('should interpolate halfway with a larger duration', () => {
      to(global.target, 0, 18, 2000000).seekTo(1000000);
      global.target.value.should.equal(9);
    });
  });
});

describe('SeqTimeline', function() {
  describe('with a 3-element sequence', () => {
    let global: {
      a: AnimationTarget<number>;
      b: AnimationTarget<number>;
      c: AnimationTarget<number>;
      timeline: SeqTimeline;
    };

    beforeEach(function() {
      const a = new AnimationTarget(0);
      const b = new AnimationTarget(0);
      const c = new AnimationTarget(0);
      global = {
        a,
        b,
        c,
        timeline: seqTimeline(to(a, 0, 1), to(b, 0, 1), to(c, 0, 1)),
      };
    });

    it('should interpolate fully with the complete duration', () => {
      global.a.value.should.equal(0);
      global.b.value.should.equal(0);
      global.c.value.should.equal(0);
      global.timeline.seekTo(3);
      global.a.value.should.equal(1);
      global.b.value.should.equal(1);
      global.c.value.should.equal(1);
    });

    it('should interpolate the first value fully on the first edge', () => {
      global.a.value.should.equal(0);
      global.b.value.should.equal(0);
      global.c.value.should.equal(0);
      global.timeline.seekTo(1);
      global.a.value.should.equal(1);
      global.b.value.should.equal(0);
      global.c.value.should.equal(0);
    });

    it('should interpolate the first and second value fully on the second edge', () => {
      global.a.value.should.equal(0);
      global.b.value.should.equal(0);
      global.c.value.should.equal(0);
      global.timeline.seekTo(2);
      global.a.value.should.equal(1);
      global.b.value.should.equal(1);
      global.c.value.should.equal(0);
    });

    it('should interpolate the first value fully and second value halfway when seeked halfway', () => {
      global.a.value.should.equal(0);
      global.b.value.should.equal(0);
      global.c.value.should.equal(0);
      global.timeline.seekTo(1.5);
      global.a.value.should.equal(1);
      global.b.value.should.equal(0.5);
      global.c.value.should.equal(0);
    });

    it('should seek forwards and then backwards completely', () => {
      global.a.value.should.equal(0);
      global.b.value.should.equal(0);
      global.c.value.should.equal(0);
      global.timeline.seekTo(3);
      global.timeline.seekTo(0);
      global.a.value.should.equal(0);
      global.b.value.should.equal(0);
      global.c.value.should.equal(0);
    });

    it('should perform a complicated seek correctly', () => {
      global.a.value.should.equal(0);
      global.b.value.should.equal(0);
      global.c.value.should.equal(0);
      global.timeline.seekTo(3);
      global.timeline.seekTo(1.5);
      global.timeline.seekTo(0);
      global.timeline.seekTo(2);
      global.timeline.seekTo(1.1);
      global.timeline.seekTo(1.25);
      global.a.value.should.equal(1);
      global.b.value.should.equal(0.25);
      global.c.value.should.equal(0);
    });
  });

  describe('With a 10,000 element sequence', function() {
    let global: {
      duration: number;
      timeline: SeqTimeline;
    };

    beforeEach(function(done) {
      jest.setTimeout(500);

      let timeline = [];
      let duration = 0;
      for (let i = 0; i < 10000; i++) {
        timeline.push(to(new AnimationTarget(0), 0, 1, i));
        duration += i;
      }

      global = {
        duration,
        timeline: seqTimeline(timeline),
      };
      done();
    });

    it('should finish in less than 10ms when doing a complicated seek', function(done) {
      jest.setTimeout(10);
      global.timeline.seekTo(global.duration);
      global.timeline.seekTo(global.duration / 2);
      global.timeline.seekTo(global.duration / 4);
      global.timeline.seekTo(global.duration);
      global.timeline.seekTo(0);
      done();
    });
  });
});
