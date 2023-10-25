import {
  numberUpTo,
  randomItem,
  randomItems,
  randomWeightedOption,
  WeightedOption,
} from "../common/random";

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

describe("randomItem", () => {
  it("gives uniform distribution", () => {
    const testArr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const times = 10000;
    const results: string[] = [];
    for (let i = 0; i < times; i++) {
      results.push(randomItem(testArr).toString());
    }
    const resultStats = arrayToStatsHash(results);
    const checkOk = Object.values(resultStats).every(
      (r) => 900 < r && r < 1100
    );
    expect(checkOk).toBe(true);
  });
});

describe("randomItems", () => {
  it("gives uniform distribution", () => {
    const testArr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const times = 5000;
    const itemsEachTime = 2;
    const results: string[] = [];
    for (let i = 0; i < times; i++) {
      const items = randomItems(testArr, itemsEachTime);
      items.forEach((it) => results.push(it.toString()));
    }
    const resultStats = arrayToStatsHash(results);
    const checkOk = Object.values(resultStats).every(
      (r) => 900 < r && r < 1100
    );
    // console.log(JSON.stringify(resultStats));
    expect(checkOk).toBe(true);
  });
});

describe("randomItemWithWeights", () => {
  it("more likely gives option with higher weight", () => {
    const testOptions: WeightedOption<string>[] = [
      { option: "often", weight: 60 },
      { option: "medium", weight: 30 },
      { option: "rare", weight: 10 },
    ];

    const times = 1000;
    const results: string[] = [];
    for (let i = 0; i < times; i++) {
      results.push(randomWeightedOption(testOptions));
    }
    const resultStats = arrayToStatsHash(results);
    // console.log(JSON.stringify(resultStats));
    expect(resultStats.often).toBeGreaterThan(resultStats.medium);
    expect(resultStats.medium).toBeGreaterThan(resultStats.rare);
  });
});

function arrayToStatsHash(arr: string[]) {
  const hash: { [idx: string]: number } = {};
  for (let i = 0; i < arr.length; i++) {
    const key = arr[i];
    if (!hash[key]) {
      hash[key] = 1;
    }
    hash[key] += 1;
  }
  return hash;
}
