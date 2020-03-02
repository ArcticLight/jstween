export type InterpolationFunction<T> = (from: T, to: T, much: number) => T;
export type EasingFunction = (x: number) => number;
export type Newable = new (...x: any[]) => any;
export interface TweenTypeRegistration<T> {
  type: any;
  interpFun: InterpolationFunction<T>;
}
