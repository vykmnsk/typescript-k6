import { sleep } from "k6";
import k6Http from "k6/http";

export function runTest(): void {
  k6Http.get("https://test.k6.io");

  sleep(1);
}

export default runTest;
