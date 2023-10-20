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
