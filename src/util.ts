export function countIf<A>(xs: A[], f: (x: A) => boolean) {
  let res = 0;
  const n = xs.length;
  for (let i = 0; i < n; i++) {
    if (f(xs[i])) {
      res++;
    }
  }
  return res;
}

export function partition<A>(xs: A[], f: (x: A) => boolean): [A[], A[]] {
  const yes: A[] = [];
  const no: A[] = [];
  const n = xs.length;
  for (let i = 0; i < n; i++) {
    const x = xs[i];
    if (f(x)) { yes.push(x) } else  { no.push(x) };
  }
  return [yes, no];
}

// export const sample = <A>(arr: A[]): A | null => arr[Math.random() * arr.length | 0] ?? null;

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));