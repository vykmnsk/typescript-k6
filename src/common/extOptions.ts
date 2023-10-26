import type { CollectorOptions } from "k6/options";

export function makeExtensionOptions(testName: string): CollectorOptions {
  const distribution = {
    "amazon:au:sydney": {
      loadZone: "amazon:au:sydney",
      percent: 25,
    },
    "amazon:cn:hong kong": {
      loadZone: "amazon:cn:hong kong",
      percent: 25,
    },
    "amazon:jp:tokyo": {
      loadZone: "amazon:jp:tokyo",
      percent: 25,
    },
    "amazon:sg:singapore": {
      loadZone: "amazon:sg:singapore",
      percent: 25,
    },
  };

  // Load tests generate too many time series
  const drop_metrics = [
    "http_req_tls_handshaking",
    "http_req_blocked",
    "http_req_connecting",
    "http_req_receiving",
    "http_req_sending",
    "http_req_waiting",
  ];

  return {
    loadimpact: {
      name: testName,
      projectID: 1234,
      staticIPs: true,
      distribution,
      drop_metrics,
    },
  };
}
