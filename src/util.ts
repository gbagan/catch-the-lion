export const last = <A>(xs: A[]) => xs.length === 0 ? null : xs[xs.length - 1];

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));