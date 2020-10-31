/**
 * The following eases are reproduced based on Robert Penner's original equations.
 * They are used fairly under the terms of the BSD License; the terms of this License
 * are reproduced in the EASING-LICENSE property and external file. Including it here
 * as a string means that you still respect the license even when minifying this js file
 */
export const Eases = {
  "EASING-LICENSE": "The code in this JavaScript object is licensed under the following terms: TERMS OF USE - EASING EQUATIONS\n\nOpen source under the BSD License.\n\nCopyright © 2001 Robert Penner\nAll rights reserved.\n\nRedistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:\n\nRedistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.\nRedistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.\nNeither the name of the author nor the names of contributors may be used to endorse or promote products derived from this software without specific prior written permission.\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.",
  /** @param {number} x */
  easeInQuad(x) {
    return x * x;
  },
  /** @param {number} x */
  easeOutQuad(x) {
    return -1 * x * (x - 2);
  },
  /** @param {number} x */
  easeInOutQuad(x) {
    if ((x /= .5) < 1) return .5 * x * x;
    return -.5 * (--x * (x - 2) - 1);
  },
  /** @param {number} x */
  easeInCubic(x) {
    return x * x * x;
  },
  /** @param {number} x */
  easeOutCubic(x) {
    return --x * x * x + 1;
  },
  /** @param {number} x */
  easeInOutCubic(x) {
    if ((x /= .5) < 1) return .5 * x * x * x;
    return .5 * ((x -= 2) * x * x + 2);
  },
  /** @param {number} x */
  easeInQuart(x) {
    return x * x * x * x;
  },
  /** @param {number} x */
  easeOutQuart(x) {
    return -1 * (--x * x * x * x - 1);
  },
  /** @param {number} x */
  easeInOutQuart(x) {
    if ((x /= .5) < 1) return .5 * x * x * x * x;
    return -.5 * ((x -= 2) * x * x * x - 2);
  },
  /** @param {number} x */
  easeInQuint(x) {
    return x * x * x * x * x;
  },
  /** @param {number} x */
  easeOutQuint(x) {
    return --x * x * x * x * x + 1;
  },
  /** @param {number} x */
  easeInOutQuint(x) {
    if ((x /= .5) < 1) return .5 * x * x * x * x * x;
    return .5 * ((x -= 2) * x * x * x * x + 2);
  }
};
