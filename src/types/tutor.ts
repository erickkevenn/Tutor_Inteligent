export interface QuadraticEquation {
  a: number;
  b: number;
  c: number;
}

export interface Solution {
  x1: number | null;
  x2: number | null;
  delta: number;
  hasRealSolutions: boolean;
}