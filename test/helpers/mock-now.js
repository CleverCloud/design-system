/**
 * @param {string} nowIsoString The fake now ISO string
 * @param {function} fn the function to execute
 */
export function withMockedNow(nowIsoString, fn) {
  const realDate = window.Date;
  const fakeNow = new Date(nowIsoString).getTime();
  // @ts-ignore
  window.Date = class extends Date {
    static now() {
      return fakeNow;
    }

    // @ts-ignore
    constructor(...options) {
      if (options.length > 0) {
        // @ts-ignore
        super(...options);
      } else {
        super(fakeNow);
      }
    }
  };
  try {
    return fn();
  } finally {
    window.Date = realDate;
  }
}
