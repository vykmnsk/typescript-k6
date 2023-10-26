jest.mock("k6", () => ({}), { virtual: true });
jest.mock("k6/http", () => fakeHttp, { virtual: true });
jest.mock("src/common/core/http", () => ({ http: fakeHttp }));
jest.mock(
  "k6",
  () => ({
    check: jest.fn(),
    sleep: jest.fn(),
    group: jest.fn((_name: string, fn: Function) => {
      fn();
    }),
  }),
  { virtual: true }
);
jest.mock(
  "k6/metrics",
  () => ({
    Rate: jest.fn().mockImplementation(() =>
      // Works and lets you check for constructor calls
      ({ constructor: () => {} })
    ),
    Counter: jest.fn().mockImplementation(() => ({ constructor: () => {} })),
  }),
  { virtual: true }
);
jest.mock("k6/crypto", () => {}, { virtual: true });

export const fakeHttp: {
  postCalls: { data: any; url: string; headers: any }[];
  post(url: string, data: string, headers: any): void;
} = {
  postCalls: [],
  post(url: string, data: string, headers: any) {
    this.postCalls.push({
      url,
      data,
      headers,
    });
  },
};
