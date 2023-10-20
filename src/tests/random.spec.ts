import { numberUpTo } from "../random";

describe("numberUpTo", () => {
  it("gives returns same number if input upto max", () => {
    expect(numberUpTo(10, 1)).toBe(1);
    expect(numberUpTo(10, 9)).toBe(9);
    expect(numberUpTo(10, 10)).toBe(10);
  });

  it("gives number within max if input above max", () => {
    expect(numberUpTo(10, 11)).toBe(1);
    expect(numberUpTo(10, 20)).toBe(10);
    expect(numberUpTo(10, 109)).toBe(9);
  });

  it("generates number within max if no input", () => {
    for (let i = 0; i < 10; i++) {
      const result = numberUpTo(5);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(5);
    }
  });
});
