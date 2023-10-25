export function randomIntInclusive(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function numberUpTo(max: number, input?: number): number {
  let num = input || randomIntInclusive(1, max);
  num = num % max;
  if (num === 0) num = max;
  return num;
}

export function randomItem<T>(items: Array<T>): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function randomItems<T>(arr: readonly T[], numItems: number): T[] {
  // Create a copy to avoid mutation
  const shuffledArr = arr.slice();

  // shuffle to randomize
  for (let i = shuffledArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArr[i], shuffledArr[j]] = [shuffledArr[j], shuffledArr[i]];
  }

  return shuffledArr.slice(0, numItems);
}


export interface WeightedOption<T> {
  option: T;
  weight: number;
}

export function randomWeightedOption<T>(items: Array<WeightedOption<T>>): T {
  const totalWeight = items.reduce((pVal, cVal) => pVal + cVal.weight, 0);

  if (totalWeight <= 0) {
    throw Error("Sum of all weights should be greater than zero");
  }

  const threshold = Math.random() * totalWeight;

  let runningTotalWeight = 0;
  const item = items.find(
    (el) => (runningTotalWeight += el.weight) > threshold
  ) as WeightedOption<T>;

  return item.option;
}
