/**
 * K6 http wrapper
 */
// @ts-ignore
import { check } from "k6";
import execution from "k6/execution";
import k6Http, {
  type RefinedParams,
  type RefinedResponse,
  type RequestBody,
  type Response,
  type ResponseType,
} from "k6/http";
import { extractApiCalls, LOG_API_LINE_PREF } from "./log-api-calls-k6";
import { maskSecretValues } from "./utils";

k6Http.setResponseCallback(k6Http.expectedStatuses({ min: 200, max: 299 }));

type ExtendedParams<RT extends ResponseType | undefined> = RefinedParams<RT> & {
  logPayload?: boolean;
};

export const http = {
  request<RT extends ResponseType | undefined>(
    method: string,
    url: string,
    body?: RequestBody | null,
    params?: ExtendedParams<RT> | null
  ) {
    const paramsCopy = { ...params };
    delete paramsCopy.logPayload;
    const res = k6Http.request(method, url, body, paramsCopy);
    logPayload(res, params);
    return res;
  },
};

const logPayload = <RT extends ResponseType | undefined>(
  res: RefinedResponse<RT>,
  params?: ExtendedParams<RT> | null
) => {
  if (__ENV.LOG_API_CALLS) {
    for (const line of extractApiCalls(res.request)) {
      console.info(LOG_API_LINE_PREF, line);
    }
    return;
  }

  if (errorStatus(res)) {
    console.error(
      `Request failed with status=${res.status} for url=${res.request.url} for VU id ${execution.vu.idInTest}`
    );
    logRequestResponse(res);
  } else if (unexpectedStatus(res)) {
    console.warn(
      `Unexpected status ${res.status} received for url=${res.request.url}`
    );
    logRequestResponse(res);
  } else if (params?.logPayload) {
    logRequestResponse(res);
  }
};

const errorStatus = <RT extends ResponseType | undefined>(
  resp: RefinedResponse<RT>
): boolean => resp.status >= 400;

const unexpectedStatus = <RT extends ResponseType | undefined>(
  resp: RefinedResponse<RT>
): boolean =>
  resp.status === 300 ||
  resp.status === 301 ||
  (resp.status > 302 && resp.status < 400);

export const SECRET_NAMES = ["password", "client_secret"];

const logRequestResponse = <RT extends ResponseType | undefined>(
  res: RefinedResponse<RT>,
  prefix = ""
) => {
  console.log(
    prefix,
    `Request Payload for VU id ${execution.vu.idInTest} : `,
    maskSecretValues(res.request.body, SECRET_NAMES)
  );
  if (res.body) {
    console.log(prefix, "Response Payload: ", res.body);
  } else {
    console.log(prefix, "Response Payload is empty");
  }
};

type CallType = "Graph" | "Auth" | "Http";

export const checkJsonResponse = (
  resp: Response,
  callType: CallType
): boolean => {
  if (!resp || errorStatus(resp)) {
    return false;
  }

  const checkName = `${callType}Response_ErrorJson`;
  const checkOk = check(
    resp,
    {
      [`${callType}: JSON response OK`]: (r) =>
        isResponseJson(r) &&
        !(
          r.json("error") ||
          r.json("errors") ||
          r.json("#.errors")?.toString()
        ),
    },
    { name: checkName }
  );

  if (!checkOk) {
    console.error(`${callType}: JSON error(s) in response:`);
    logRequestResponse(resp, callType);
  }
  return checkOk;
};

export const isResponseJson = <RT extends ResponseType | undefined>(
  resp: RefinedResponse<RT>
): boolean => {
  try {
    resp.json();
    return true;
  } catch {
    return false;
  }
};
