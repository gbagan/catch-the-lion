export const last = <A>(xs: A[]) => xs.length === 0 ? null : xs[xs.length - 1];

export function sample<A>(arr: A[]): A | null {
  return arr[Math.random() * arr.length | 0] ?? null;
}

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));