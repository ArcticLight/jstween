export declare type InterpolationFunction<T> = (from: T, to: T, much: number) => T;
export declare type EasingFunction = (x: number) => number;
export declare type Newable = new (...x: any[]) => any;
export interface TweenTypeRegistration<T> {
    type: any;
    interpFun: InterpolationFunction<T>;
}
