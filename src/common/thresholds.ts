import type { Threshold } from "k6/options";

export const abortOnErrorThreshold: Threshold = {
  threshold: "rate == 0",
  abortOnFail: true,
};

export const continueOnAnyResponseThreshold: Threshold = {
  threshold: "p(95) < 800",
  abortOnFail: false,
  delayAbortEval: "1m",
};

export const allChecks = {
  checks: [{ threshold: "rate > 0.80", abortOnFail: true }],
};

export function errorsInResponseChecks() {
  const abortOnFail = true;
  let delayAbortEval = "1m";
  let thresholdRate = "0.95";

  return {
    "checks{name:AuthResponse_ErrorJson}": [
      { threshold: `rate > ${thresholdRate}`, abortOnFail, delayAbortEval },
    ],
    "checks{name:GraphResponse_ErrorJson}": [
      { threshold: `rate > ${thresholdRate}`, abortOnFail, delayAbortEval },
    ],
    "checks{name:HttpResponse_ErrorJson}": [
      { threshold: `rate > ${thresholdRate}`, abortOnFail, delayAbortEval },
    ],
  };
}
