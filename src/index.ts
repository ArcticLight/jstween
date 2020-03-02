import { lerp, clamp } from './functions';
import { Seekable } from './seekable';
import { Eases } from './eases';
import {
  Tween,
  to,
  AnimationTarget,
  ObjectPropertyAnimationTarget,
} from './Tween';
import {
  SeqTimeline,
  seqTimeline,
  ParTimeline,
  parTimeline,
} from './timelines';

export * from './types.js';

export {
  lerp,
  clamp,
  Seekable,
  Eases,
  Tween,
  to,
  AnimationTarget,
  ObjectPropertyAnimationTarget,
  SeqTimeline,
  seqTimeline,
  ParTimeline,
  parTimeline,
};
