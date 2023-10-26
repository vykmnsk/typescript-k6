import { fail, check, sleep } from "k6";

export function retry(
  func: Function,
  args: any,
  maxTries: number,
  sleepSecs = 0.1
) {
  for (let i = 1; i <= maxTries; i++) {
    if (i > 1) {
      sleep(sleepSecs);
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
      return func(...args);
    } catch (err) {
      console.error(`Tried ${i} ${func.name}(): ${err as string}`);
    }
  }
  fail(`Exhausted ${maxTries} attempts for ${func.name}()`);
}

export function maskSecretValues(text: string, secretNames: string[]) {
  let regexp: RegExp;
  let safeText = text;
  for (const secretName of secretNames) {
    regexp = new RegExp(
      `("?${secretName}"?\\s*[=:]\\s*"?)([^"^&.]+)(["&]?.*)`,
      "gi"
    );
    safeText = safeText.replace(regexp, "$1###$3");
  }
  return safeText;
}

export function assertNotEmpty(collection: any[], message: string) {
  if (!check(collection, { [message]: (c) => c && c.length > 0 })) {
    fail(`fail: ${message}`);
  }
}

/**
 * Generates random UUID.
 * Copy of k6 helper from https://k6.io/docs/javascript-api/jslib/utils/uuidv4/
 * @returns a UUID string, e.g. "0c730854-9f28-4a5e-90ab-4d694b75e53f"
 */
export const uuidv4 = (): string =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
