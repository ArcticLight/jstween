import { clamp } from "./functions.js";
import { Seekable } from "./seekable.js";
import { AnimationTarget } from "./tween.js";

export class SeqTimeline extends Seekable {
  /** @param {Seekable[]} timeline */
  constructor(...timeline) {
    if (timeline.length === 0) {
      throw new TypeError("Can't construct an empty SeqTimeline!");
    }

    let myDuration = 0;
    /** @type {Set<AnimationTarget<any>>} */
    const myTargets = new Set();
    timeline.forEach(({duration, targets}) => {
      myDuration += duration;
      targets.forEach((t) => myTargets.add(t));
    });
    super(myDuration, Array.from(myTargets));

    // TODO: The DTable could be much more performant
    // for linear seeking if it were a b-tree instead
    // of an array

    /** @type {{
      start: number;
      end: number;
      value: Seekable;
    }[]}
     */
    const dTable = [];
    let acc = 0;
    for (let i = 0; i < timeline.length; i++) {
      dTable.push({
        start: acc,
        end: acc + timeline[i].duration,
        value: timeline[i],
      });
      acc += timeline[i].duration;
    }

    /** @private */
    this._dTable = dTable;
    /** @private */
    this._currentTime = 0;
  }

  /**
   * @override
   * @param {number} t
   */
  seekTo(t) {
    const qCurrentTime = this._currentTime;
    this._currentTime = clamp(t, 0, this.duration);
    const delta = this._currentTime - qCurrentTime;

    if (delta === 0) {
      if (t === 0) {
        this._dTable[0].value.seekTo(0);
      }
      return;
    }

    let lowTime = 0, highTime = 0;
    let forwards = true;
    if (delta < 0) {
      forwards = false;
      lowTime = this._currentTime;
      highTime = qCurrentTime;
    } else {
      lowTime = qCurrentTime;
      highTime = this._currentTime;
    }

    if (forwards) {
      for (let i = 0; i < this._dTable.length; i++) {
        const item = this._dTable[i];
        if (item.end < lowTime) {
          continue;
        } else if (item.start <= highTime) {
          item.value.seekTo(
            clamp(this._currentTime - item.start, 0, item.value.duration)
          );
        } else {
          break;
        }
      }
    } // if (forwards) { ... }
    else {
      for (let i = this._dTable.length - 1; i >= 0; i--) {
        const item = this._dTable[i];
        if (item.start > highTime) {
          continue;
        } else if (item.end >= lowTime) {
          item.value.seekTo(
            clamp(this._currentTime - item.start, 0, item.value.duration),
          );
        } else {
          break;
        }
      }
    }
  }
}

/**
 * @param {Seekable | Seekable[]} item
 * @param {Seekable[]} rest
 * @returns {SeqTimeline}
 */
export function seqTimeline(item, ...rest) {
  if (Array.isArray(item)) {
    return new SeqTimeline(...item);
  }

  return new SeqTimeline(...[item, ...rest]);
}

export class ParTimeline extends Seekable {
  /**
   * @param {Seekable[]} timeline
   */
  constructor(...timeline) {
    if (timeline.length === 0) {
      throw new TypeError("Can't construct an empty ParTimeline!");
    }

    let myDuration = 0;
    const myTargets = new Set();
    timeline.forEach(({duration, targets}) => {
      if (myDuration < duration) {
        myDuration = duration;
      }
      targets.forEach((t) => myTargets.add(t));
    });

    super(myDuration, Array.from(myTargets));

    /** @private */
    this._timeline = timeline;
  }

  /**
   * @override
   * @param {number} t
   */
  seekTo(t) {
    this._timeline.forEach((item) => {
      item.seekTo(
        clamp(t, 0, item.duration),
      );
    });
  }
}

/**
 * @param {Seekable | Seekable[]} item
 * @param {Seekable[]} rest
 * @returns {ParTimeline}
 */
export function parTimeline(item, ...rest) {
  if (Array.isArray(item)) {
    return new ParTimeline(...item);
  }

  return new ParTimeline(...[item, ...rest]);
}
