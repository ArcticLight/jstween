import {
  Seekable
} from '../index.js';

/** @param {number} time */
export const Delay = (time) => new Seekable(time);
