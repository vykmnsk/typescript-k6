import axios from "axios";
import * as yargs from "yargs";

import { apiErrorMsg, fetchAwsSecret } from "./utils";
import { postToSlack } from "./slack-post-results";

export const K6CLOUD_APIKEY_PATH = "k6/CloudUser/ApiKey";

interface Arguments {
  testRunId: string;
}

interface TestRunStatus {
  "k6-run": {
    created: string;
    id: number;
    result_status: number;
    run_status: number;
    test_id: number;
  };
}

interface TestLookup {
  "k6-tests": [
    {
      id: number;
      name: string;
    }
  ];
}

const k6ApiEndpoint = "https://api.k6.io/loadtests/v2/";
const k6ResultsEndpoint = `${k6ApiEndpoint}runs/`;
const k6TestLookupEndpoint = `${k6ApiEndpoint}tests`;
const k6ResultsUIEndpoint = "https://app.k6.io/runs/";
const statusCheckWaitTime = 60000;
const k6ProjectId = 1234;

/**
 * Status code mappings found here https://k6.io/docs/cloud/cloud-reference/test-status-codes/
 */
const statusCodes = new Map<number, string>([
  [-2, "Created"],
  [-1, "Validated"],
  [0, "Queued"],
  [1, "Initializing"],
  [2, "Running"],
  [3, "Finished"],
  [4, "Timed out"],
  [5, "Aborted by user"],
  [6, "Aborted by system"],
  [7, "Aborted by script error"],
  [8, "Aborted by threshold"],
  [9, "Aborted by limit"],
]);

/**
 * Result status code mappings found here https://k6.io/docs/cloud/cloud-reference/cloud-rest-api/test-runs/
 */
const resultStatusCodes = new Map<number, string>([
  [0, "Passed"],
  [1, "Failed"],
]);

/**
 * Argument parser with the following options; testRunId
 * @returns accepted arguments
 */
function Parser() {
  return yargs.option("testRunId", {
    description: "ID of the test to retrieve details from",
    type: "string",
    default: "",
  }).argv;
}

async function getTestLookupResults(
  apiClientSecret: string
): Promise<TestLookup> {
  try {
    const getUrl = `${k6TestLookupEndpoint}?$select=id,name&project_id=${k6ProjectId}`;

    const res = await axios.get<{ access_token: string }>(getUrl, {
      headers: { authorization: `Token ${apiClientSecret}` },
    });
    const k6TestsResp = res.data as unknown as TestLookup;

    return k6TestsResp;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw Error(apiErrorMsg(err));
    } else {
      throw err;
    }
  }
}

async function getTestRunResults(
  testRunId: string,
  apiClientSecret: string
): Promise<TestRunStatus> {
  try {
    const getUrl = `${k6ResultsEndpoint}${testRunId}?$select=id,test_id,run_status,result_status,created`;

    const res = await axios.get<{ access_token: string }>(getUrl, {
      headers: { authorization: `Token ${apiClientSecret}` },
    });
    const k6RunStatusResp = res.data as unknown as TestRunStatus;

    return k6RunStatusResp;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw Error(apiErrorMsg(err));
    } else {
      throw err;
    }
  }
}

async function executeGetTestRunResults(args: Arguments) {
  // to determine if test run has completed the status needs to be at least 3 (3 is mapped to 'Finished');
  const completedTestRunStatus = 3;
  // maximum iterations to check test run status
  const maxIterations = 10;
  // Get testRunId
  const testRunId = args.testRunId;

  const k6ApiToken: string = await fetchAwsSecret(K6CLOUD_APIKEY_PATH, "token");

  console.log("--- Retrieving test run results for test run id:", testRunId);

  let testResults: TestRunStatus = await getTestRunResults(
    testRunId,
    k6ApiToken
  );

  for (let i = 0; i < maxIterations; i++) {
    testResults = await getTestRunResults(testRunId, k6ApiToken);

    if (testResults["k6-run"].run_status >= completedTestRunStatus) {
      break;
    }
    // wait for x seconds before checking status again
    await new Promise((f) => setTimeout(f, statusCheckWaitTime));
  }

  const testId = testResults["k6-run"].test_id;
  const testLookup = await getTestLookupResults(k6ApiToken);
  const test = testLookup["k6-tests"].find((t) => t.id === testId);
  const testRunStatus =
    statusCodes.get(testResults["k6-run"].run_status) || "unknown";
  const testResultsUrl = `${k6ResultsUIEndpoint}${testRunId}`;
  let testResultStatus =
    resultStatusCodes.get(testResults["k6-run"].result_status) || "unknown";

  if (testRunStatus !== "Finished") {
    testResultStatus = "Failed";
  }

  console.log("    --- Test ID:", testId);
  console.log("    --- Test name:", test!.name);
  console.log("    --- Test run ID:", testRunId);
  console.log("    --- Test run status:", testRunStatus);
  console.log("    --- Test result status:", testResultStatus);
  console.log("    --- Test results URL:", testResultsUrl);

  await postToSlack(testResultStatus, testRunStatus, testResultsUrl);
}

(async function () {
  // parse the passed in arguments
  const argv = await Parser();

  // execute the build commands corresponding to the passed in arguments
  await executeGetTestRunResults(argv);
})().catch((err) => {
  console.log(err);
});
