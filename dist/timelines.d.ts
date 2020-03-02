import { Seekable } from "./seekable";
export declare class SeqTimeline extends Seekable {
    private dtable;
    private currentTime;
    constructor(...timeline: Seekable[]);
    seekTo(t: number): void;
}
export declare function seqTimeline(item: (Seekable | Seekable[]), ...rest: Seekable[]): SeqTimeline;
export declare class ParTimeline extends Seekable {
    timeline: Seekable[];
    constructor(...timeline: Seekable[]);
    seekTo(t: number): void;
}
export declare function parTimeline(item: (Seekable | Seekable[]), ...rest: Seekable[]): ParTimeline;
