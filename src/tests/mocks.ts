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
