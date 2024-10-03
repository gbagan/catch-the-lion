export const last = <A>(xs: A[]) => xs.length === 0 ? null : xs[xs.length - 1];

export const countIf = <A>(xs: A[], f: (x: A) => boolean) => {
  let res = 0;
  let n = xs.length;
  for (let i = 0; i < n; i++) {
    if (f(xs[i])) {
      res++;
    }
  }
  return res;
}

export function sample<A>(arr: A[]): A | null {
  return arr[Math.random() * arr.length | 0] ?? null;
}
;
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));