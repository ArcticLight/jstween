/**
 * @param {Seekable | Seekable[]} item
 * @param {Seekable[]} rest
 * @returns {SeqTimeline}
 */
export function seqTimeline(item: Seekable | Seekable[], ...rest: Seekable[]): SeqTimeline;
/**
 * @param {Seekable | Seekable[]} item
 * @param {Seekable[]} rest
 * @returns {ParTimeline}
 */
export function parTimeline(item: Seekable | Seekable[], ...rest: Seekable[]): ParTimeline;
export class SeqTimeline extends Seekable {
    /** @param {Seekable[]} timeline */
    constructor(...timeline: Seekable[]);
    /** @private */
    private _dTable;
    /** @private */
    private _currentTime;
}
export class ParTimeline extends Seekable {
    /**
     * @param {Seekable[]} timeline
     */
    constructor(...timeline: Seekable[]);
    /** @private */
    private _timeline;
}
import { Seekable } from "./seekable.js";
//# sourceMappingURL=timelines.d.ts.map