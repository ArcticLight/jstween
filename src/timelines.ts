import { Seekable } from './seekable';
import { clamp } from './functions';

interface DTableEntry {
  start: number;
  end: number;
  value: Seekable;
}

export class SeqTimeline extends Seekable {
  private dtable: Array<DTableEntry>;
  private currentTime: number;

  constructor(...timeline: Seekable[]) {
    let duration = 0;
    for (let i = 0; i < timeline.length; i++) {
      duration += timeline[i].duration;
    }
    super(duration);

    // TODO: The DTable could be much more performant
    // for linear seeking if it were a b-tree instead
    // of an array
    let dtable: Array<DTableEntry> = [];
    let accum = 0;
    for (let i = 0; i < timeline.length; i++) {
      dtable.push({
        start: accum,
        end: accum + timeline[i].duration,
        value: timeline[i],
      });
      accum += timeline[i].duration;
    }

    this.dtable = dtable;
    this.currentTime = 0;
  }

  seekTo(t: number): void {
    let qCurrentTime: number = this.currentTime;
    this.currentTime = clamp(t, 0, this.duration);
    let delta: number = this.currentTime - qCurrentTime;

    if (t === 0) {
      this.dtable[0].value.seekTo(0);
    }

    if (delta === 0) return;

    let lowTime = 0,
      highTime = 0;
    let forwards = true;
    if (delta < 0) {
      forwards = false;
      lowTime = this.currentTime;
      highTime = qCurrentTime;
    } else {
      lowTime = qCurrentTime;
      highTime = this.currentTime;
    }

    if (forwards) {
      for (let i = 0; i < this.dtable.length; i++) {
        let item = this.dtable[i];
        if (item.end < lowTime) {
          continue;
        } else if (item.start <= highTime) {
          item.value.seekTo(
            clamp(this.currentTime - item.start, 0, item.value.duration)
          );
        } else {
          break;
        }
      }
    } // if (forwards) { ... }
    else {
      for (let i = this.dtable.length - 1; i >= 0; i--) {
        let item = this.dtable[i];
        if (item.start > highTime) {
          continue;
        } else if (item.end >= lowTime) {
          item.value.seekTo(
            clamp(this.currentTime - item.start, 0, item.value.duration)
          );
        } else {
          break;
        }
      }
    }
  }
}

export function seqTimeline(
  item: Seekable | Seekable[],
  ...rest: Seekable[]
): SeqTimeline {
  if (item instanceof Array) {
    return new SeqTimeline(...item);
  } else {
    return new SeqTimeline(...[item, ...rest]);
  }
}

export class ParTimeline extends Seekable {
  timeline: Seekable[];

  constructor(...timeline: Seekable[]) {
    let duration = 0;
    for (let i = 0; i < timeline.length; i++) {
      if (duration < timeline[i].duration) {
        duration = timeline[i].duration;
      }
    }
    super(duration);

    this.timeline = timeline;
  }

  seekTo(t: number): void {
    for (let i = 0; i < this.timeline.length; i++) {
      this.timeline[i].seekTo(clamp(t, 0, this.timeline[i].duration));
    }
  }
}

export function parTimeline(
  item: Seekable | Seekable[],
  ...rest: Seekable[]
): ParTimeline {
  if (item instanceof Array) {
    return new ParTimeline(...item);
  } else {
    return new ParTimeline(...[item, ...rest]);
  }
}
