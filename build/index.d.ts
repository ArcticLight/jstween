export declare type InterpolationFunction<T> = (from: T, to: T, much: number) => T;
export declare type EasingFunction = (x: number) => number;
export declare type Newable = new (...x: any[]) => any;
export interface TweenTypeRegistration<T> {
    type: any;
    interpFun: InterpolationFunction<T>;
}
export declare let quiet: boolean;
export declare function clamp(value: number, min: number, max: number): number;
export declare function lerp(from: number, to: number, much: number): number;
declare let Eases: {
    "EASING-LICENSE": string;
    "easeInQuad": (x: number) => number;
    "easeOutQuad": (x: number) => number;
    "easeInOutQuad": (x: number) => number;
    "easeInCubic": (x: number) => number;
    "easeOutCubic": (x: number) => number;
    "easeInOutCubic": (x: number) => number;
    "easeInQuart": (x: number) => number;
    "easeOutQuart": (x: number) => number;
    "easeInQuint": (x: number) => number;
    "easeOutQuint": (x: number) => number;
};
export { Eases };
export declare class Seekable {
    readonly duration: number;
    constructor(duration?: number);
    seekTo(t: number): void;
    start(): void;
    withEase(ease: EasingFunction): EasedSeekable;
}
export declare class EasedSeekable extends Seekable {
    private oldSeek;
    private ease;
    constructor(oldSeekable: Seekable, ease?: EasingFunction);
    seekTo(t: number): void;
}
export declare class Tween<T> extends Seekable {
    target: AnimationTarget<T>;
    from: T;
    to: T;
    constructor(target: AnimationTarget<T>, from: T, to: T, duration?: number);
    seekTo(t: number): void;
    static getInterpolateFunctionForType(type: string | Newable): InterpolationFunction<any>;
    static registerType(type: string | Newable, func: InterpolationFunction<any>): void;
    static unregisterType(type: string | Newable): void;
}
export declare class AnimationTarget<T> {
    private readonly type;
    value: T;
    readonly interpFunc: InterpolationFunction<T>;
    constructor(initialValue: T, type?: string | Newable);
}
export declare class ObjectPropertyAnimationTarget<T, O, P extends keyof O> extends AnimationTarget<T> {
    readonly object: {
        [P in keyof O]: T;
    };
    readonly property: P;
    value: T;
    constructor(object: {
        [P in keyof O]: T;
    }, property: P, type?: string | Newable);
}
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
export declare function to<T>(target: AnimationTarget<T>, from: T, to: T, duration?: number): Tween<T>;
