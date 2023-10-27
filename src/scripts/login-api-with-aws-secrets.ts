import axios, { type AxiosError } from "axios";
import { apiErrorMsg, fetchAwsSecret } from "./utils";

const WAIT_FOR_EXIT_SECONDS = 5;
const failures: string[] = [];

const email = "load-test+1@example.xyz";
const auth = {
  candidateClientId: "xxxxxxxxxxxxxxxxxxxxxxx",
  scope: "openid profile email test:load-test",
  audience: "https://website/api/test-user",
  loginHost: "https://login.website.com",
};

async function run() {
  await warnDelayRun();

  const apiClientSecret: string = await fetchAwsSecret(
    "Auth0/SyntheticLogin/Candidate",
    "client_secret"
  );
  console.log(`fetched API_secret=${apiClientSecret}`);

  const candidatePwd: string = await fetchAwsSecret(
    "Auth0/TestUser/Credentials/Candidate",
    "password"
  );
  console.log(`fetched pwd=${candidatePwd}`);

  await loginAPI(email, candidatePwd, apiClientSecret);

  /** Output list of failures if any */
  if (failures.length > 0) {
    console.log("The following accounts failed: ", failures);
  } else {
    console.log("All accounts finished successfully");
  }
}

function delaySeconds(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

async function warnDelayRun() {
  console.log(`Going to execute in ${WAIT_FOR_EXIT_SECONDS} seconds...`);
  console.log("Press Ctrl-C to exit");
  await delaySeconds(WAIT_FOR_EXIT_SECONDS);
}

async function loginAPI(
  email: string,
  candidatePwd: string,
  apiClientSecret: string
) {
  let authToken: string;
  try {
    authToken = await fetchAuthToken(email, candidatePwd, apiClientSecret);
    console.log(`logged in and fetched API auth token=${authToken}`);
  } catch (err) {
    console.log(`ERROR on login ${email}: ${err as string}`);
    failures.push(email);
  }
}

async function fetchAuthToken(
  email: string,
  candidatePwd: string,
  apiClientSecret: string
) {
  const headers = {
    accept: "application/json",
    "Content-Type": "application/json",
    "x-load-site": "perf-customer-scenario-tests",
    "load-test": "true",
    "load-test-scope": "load-test",
  };

  const data = JSON.stringify({
    username: email,
    password: candidatePwd,
    client_secret: apiClientSecret,
    client_id: auth.candidateClientId,
    audience: auth.audience,
    scope: auth.scope,
    grant_type: "password",
  });

  try {
    const res = await axios.post<{ access_token: string }>(
      `${auth.loginHost}/oauth/token`,
      data,
      { headers }
    );
    return res.data.access_token;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw Error(apiErrorMsg(err));
    } else {
      throw err;
    }
  }
}

(async function () {
  await run();
})().catch((err) => {
  console.log(err);
});
