import each from "jest-each";
import { maskSecretValues } from "../common/utils";

describe("Unit Test :: Utils", () => {
  each([
    ["", ""],
    ["secret1=value1&secret2=value2", "secret1=###&secret2=###"],
    [
      "key1=value1&secret1=value11&key2=value2",
      "key1=value1&secret1=###&key2=value2",
    ],
    [
      '{"key1":"value1", "secret2":"value2"}',
      '{"key1":"value1", "secret2":"###"}',
    ],
    [
      '{"input":{"secret1":"value1","key2":"value2"}}',
      '{"input":{"secret1":"###","key2":"value2"}}',
    ],
  ]).it("Check mask secrets in payload", (text: string, safeText: string) => {
    const secretNames = ["secret1", "secret2"];
    const actual = maskSecretValues(text, secretNames);
    // eslint-disable-next-line jest/no-standalone-expect
    expect(actual).toStrictEqual(safeText);
  });
});
