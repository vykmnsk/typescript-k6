// K6 irrelevant tracing logic

export interface GraphQlOp {
  operationName: string;
  variables: object;
  query: string;
}

export type Payload = GraphQlOp | Array<GraphQlOp>;

export interface RequestData {
  url: string;
  method: string;
  body?: string;
}

export interface ApiCallData {
  url: string;
  method: string;
  body?: string;

  baseUrl: string;
  queryParams?: string[];
  isGraph?: boolean;
}

export const SEP_CSV = "|";
const SEP_ARRAY = " ";

export function extractApiCallLines(apiCall: ApiCallData): string[] {
  const callLines: any[] = [];
  for (const callPart of extractAPICallParts(apiCall)) {
    callLines.push(callPart.join(SEP_CSV));
  }
  return callLines;
}

function extractAPICallParts(apiCall: ApiCallData): string[][] {
  const method = apiCall.method;
  let paramsStr = "";
  if (method === "GET") {
    if (apiCall.queryParams && apiCall.queryParams.length > 0) {
      paramsStr = apiCall.queryParams?.join(SEP_ARRAY);
    }
    return [[apiCall.baseUrl, method, paramsStr]];
  }

  if (method === "POST") {
    const payload = apiCall.body;

    if (payload && apiCall.isGraph) {
      const graphParts: any[] = [];
      const typedPayload = JSON.parse(payload) as unknown as Payload;
      let operations: GraphQlOp[];
      if (Array.isArray(typedPayload)) {
        operations = typedPayload as unknown as GraphQlOp[];
      } else {
        const op = typedPayload as unknown as GraphQlOp;
        operations = [op];
      }
      for (const op of operations) {
        const { operationName, query } = extractGraphOperation(op);
        graphParts.push([apiCall.baseUrl, "GRAPH", operationName, query]);
      }
      return graphParts;
    }
  }
  return [[apiCall.baseUrl, method, "?"]];
}

function extractGraphOperation(payload: GraphQlOp) {
  const operationName = payload.operationName;
  const query = encodeGraphQuery(payload.query);
  return {
    operationName,
    query,
  };
}

function encodeGraphQuery(query: string): string {
  if (!query) {
    return "";
  }
  return query.trim().replace(/(\r\n|\n|\r)/gm, "");
}
