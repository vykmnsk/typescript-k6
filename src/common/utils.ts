import { fail, sleep } from "k6";

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
