import execution from "k6/execution";
import type {
  ConstantArrivalRateScenario,
  SharedIterationsScenario,
} from "k6/options";

export const setupTimeout = "10m";
export const authLife = { expiresAt: "" };
const AUTH_TOKEN_LIFE_SEC = 60 * 60 * 24;


export function setupAllVUs(
  setupVUFn: (vuId: number) => {} | null,
  vuSetupSeconds: number,
  vuIterSeconds: number
) {
  const vus = calcTotalVUs();
  const expiresAt = calcAllVUsSetupExpiry(
    vuIterSeconds,
    vuSetupSeconds,
    vus
  ).toISOString();
  console.log(`Total VUs configured to run: ${vus}`);
  const allVUsData = [...Array(vus).keys()].map((i) => setupVUFn(i + 1));
  return { allVUsData, expiresAt };
}

function calcTotalVUs() {
  let totalVUs = 0;

  if (execution.test.options.scenarios) {
    const sharedIterationsScenarioVus: number[] = Object.values(
      execution.test.options.scenarios as unknown as SharedIterationsScenario
    ).map((o) => o.vus as number);

    const constantArrivalRateScenarioVus: number[] = Object.values(
      execution.test.options.scenarios as unknown as ConstantArrivalRateScenario
    ).map((o) => o.preAllocatedVUs as number);

    if (
      sharedIterationsScenarioVus.length > 0 &&
      sharedIterationsScenarioVus[sharedIterationsScenarioVus.length - 1]
    ) {
      // we only want to return the greatest number of configured VUs in the scenarios not a sum of all
      totalVUs = Math.max(...sharedIterationsScenarioVus);
    } else if (
      constantArrivalRateScenarioVus.length > 0 &&
      constantArrivalRateScenarioVus[constantArrivalRateScenarioVus.length - 1]
    ) {
      // we only want to return the greatest number of configured VUs in the scenarios not a sum of all
      totalVUs = Math.max(...constantArrivalRateScenarioVus);
    }
  }
  if (totalVUs < 1) {
    execution.test.abort(
      `Total VUs found (${totalVUs}) is less than 1. Aborting test!`
    );
  }
  return totalVUs;
}

export function pickVUSetup(vuId: number, setupData: Array<{} | null>) {
  const setupId = (vuId - 1) % setupData.length;
  const vuSetup = setupData[setupId];
  if (!vuSetup) {
    console.log(`Setup for VU=${vuId} is missing`);
  }
  return vuSetup;
}

function calcAllVUsSetupExpiry(
  vuIterSeconds: number,
  vuSetupSeconds: number,
  vusCount: number
) {
  return dateInSeconds(
    AUTH_TOKEN_LIFE_SEC - vuIterSeconds - vuSetupSeconds * vusCount
  );
}

function calcVUExpiry(iterationSeconds: number) {
  return dateInSeconds(AUTH_TOKEN_LIFE_SEC - iterationSeconds);
}

function dateInSeconds(sec: number) {
  const date = new Date();
  date.setSeconds(date.getSeconds() + sec);
  return date;
}

export function setNewTokenIfExpired(
  authLifeObj: { expiresAt: string },
  vuId: number,
  iterationSeconds: number
) {
  const now = new Date().toISOString();
  if (now > authLifeObj.expiresAt) {
    // get new access token here for vuId
    authLifeObj.expiresAt = calcVUExpiry(iterationSeconds).toISOString();
  }
}
