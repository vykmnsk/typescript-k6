// @ts-ignore
import { URL } from "https://jslib.k6.io/url/1.0.0/index.js";

import {
  type RequestData,
  type ApiCallData,
  extractApiCallLines,
} from "./log-api-calls";

export const LOG_API_LINE_PREF = "API-CALL>>";

export function extractApiCalls(req: RequestData): string[] {
  const apiCall: ApiCallData = {
    ...req,
    baseUrl: extractBaseUrl(req),
    queryParams: Array.from(extractQueryParams(req)),
    isGraph: isGraphCall(req),
  };
  return extractApiCallLines(apiCall);
}

function extractBaseUrl(req: RequestData): string {
  const url = new URL(req.url);
  return `${url.origin as string}${url.pathname as string}`;
}

function extractQueryParams(req: RequestData): string[] {
  const url = new URL(req.url);
  return url.searchParams.keys() as string[];
}

function isGraphCall(req: RequestData): boolean {
  const url = new URL(req.url);
  return (url.pathname as string).toLowerCase().endsWith("graphql");
}
