/** Small seeded PRNG (mulberry32) for reproducible exams. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rng = () => number;

export function randInt(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Never returns undefined — throws if the array is empty. */
export function pick<T>(rng: Rng, arr: readonly T[]): T {
  if (!arr.length) {
    throw new Error("pick() called with empty array");
  }
  return arr[Math.floor(rng() * arr.length)]!;
}

/** Prefer filtered list; fall back if filter is empty. */
export function pickPrefer<T>(
  rng: Rng,
  preferred: readonly T[],
  fallback: readonly T[]
): T {
  return pick(rng, preferred.length > 0 ? preferred : fallback);
}

export function shuffle<T>(rng: Rng, arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
