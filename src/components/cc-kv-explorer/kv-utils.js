/**
 * @param {string} pattern
 * @param {string} string
 * @return {boolean}
 */
export function matchKvPattern(pattern, string) {
  const regexp = convertKvMatchToRegex(pattern);
  return string.match(regexp) != null;
}

const specialPatternChars = '?*[]';
const specialRegexChars = '^$.+=!:|\\/(){},';

/**
 * @param {string} match
 * @return {RegExp}
 */
function convertKvMatchToRegex(match) {
  const len = match.length;

  let reg = '';
  let i = 0;

  while (i < len) {
    const char = match.charAt(i);
    const nextChar = i < len - 1 ? match.charAt(i + 1) : null;

    // skip escaped
    if (char === '\\' && specialPatternChars.includes(nextChar)) {
      reg += `${char}${nextChar}`;
      i++;
    }
    // escape regex chars
    else if (specialRegexChars.includes(char)) {
      reg += `\\${char}`;
    }
    // transform to regex
    else if (char === '*') {
      reg += `.*`;
    } else if (char === '?') {
      reg += `.`;
    }
    // otherwise
    else {
      reg += char;
    }

    i++;
  }

  return new RegExp(`^${reg}$`);
}

class Semaphore {
  constructor() {
    /** @type {AbortController} */
    this.abortCtrl = null;
  }

  /**
   * @param {(...args: Array<any>) => Promise<T>} func
   * @returns {Promise<T>}
   * @template T
   */
  async run(func) {
    this.abortCtrl?.abort();
    this.abortCtrl = new AbortController();

    return new Promise((resolve, reject) => {
      func(this.abortCtrl.signal)
        .then(resolve)
        .catch((e) => {
          if (!(e instanceof DOMException && e.name === 'AbortError')) {
            reject(e);
          }
        });
    });
  }
}

export const kvSharedSemaphore = new Semaphore();
