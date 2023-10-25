import { sleep } from "k6";
import { http } from "../common/http";

export function runTest(): void {
  http.request('GET', "https://test.k6.io/404");

  sleep(1);
}

export default runTest;
