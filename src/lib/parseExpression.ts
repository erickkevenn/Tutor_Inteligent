// src/lib/parseExpression.ts
import { parse, simplify, ConstantNode, OperatorNode, SymbolNode } from 'mathjs';

export interface Coeffs { a: number; b: number; c: number; }

/**
 * Recebe uma expressão string em x, aplica pré‐processamento e extrai coeficientes.
 * Retorna null se não puder extrair um polinômio de grau 2.
 */
export function extractCoefficients(exprInput: string): Coeffs | null {
  try {
    const x = 'x';
    // 1. Simplifica a expressão original
    let expr = simplify(exprInput);

    // 2. Elimina denominadores multiplicando por x^k (a mais alta fração que encontrar)
    //    Ex: x + (4/x)  -> simplifica -> (x^2 + 4)/x  -> * x => x^2 + 4
    const frac = expr.find((node: any) => node.isFunctionNode || node.isOperatorNode && node.op === '/');
    if (frac) {
      // multiplica por x para remover divisor x: 
      expr = simplify(`(${expr.toString()}) * x`);
    }

    // 3. Expande para garantir forma polinomial
    expr = simplify(expr.toString()); 

    // 4. Parseia a expressão final e percorre a árvore para somar coeficientes
    const node = parse(expr.toString());
    let a = 0, b = 0, c = 0;

    node.traverse((n: any, path: any, parent: any) => {
      // x^2
      if (n instanceof OperatorNode && n.op === '^') {
        const [base, exp] = n.args;
        if (base.name === x && +exp.value === 2) {
          // procura multiplicador
          if (parent && parent.isOperatorNode && parent.op === '*') {
            const other = parent.args.find((arg: any) => arg !== n);
            a += Number(other.evaluate());
          } else {
            a += 1;
          }
        }
      }

      // x^1
      if (n instanceof SymbolNode && n.name === x) {
        if (parent && parent.isOperatorNode && parent.op === '*') {
          const other = parent.args.find((arg: any) => arg !== n);
          b += Number(other.evaluate());
        } else {
          b += 1;
        }
      }

      // constante
      if (n instanceof ConstantNode) {
        c += Number(n.value);
      }
    });

    // Se não foi 2º grau, retorna null
    if (a === 0) return null;
    return { a, b, c };
  } catch {
    return null;
  }
}
