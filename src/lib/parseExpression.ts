export interface QuadraticCoefficients {
  a: number;
  b: number;
  c: number;
  reduced: string;
}

export function parseToQuadratic(exprStr: string): QuadraticCoefficients {
  // Expressão regular para extrair coeficientes
  const regex = /([+-]?\s*\d*\.?\d+)?\s*x\^2\s*([+-]?\s*\d*\.?\d+)?\s*x\s*([+-]?\s*\d*\.?\d+)?/;

  // Função para aplicar regex e extrair coeficientes
  function extractCoefficients(equation: string): { a: number, b: number, c: number } {
    const matches = equation.replace(/\s+/g, '').match(regex);
    console.log(matches)

    if (matches) {
      const a = matches[1] ? parseFloat(matches[1].replace(/\s/g, '')) : 1;
      const b = matches[2] ? parseFloat(matches[2].replace(/\s/g, '')) : 0;
      const c = matches[3] ? parseFloat(matches[3].replace(/\s/g, '')) : 0;
      return { a, b, c };
    }
    return { a: 0, b: 0, c: 0 };
  }

  // Coleta os coeficientes a, b, c da equação
  const { a, b, c } = extractCoefficients(exprStr);

  // Monta a equação reduzida
  let eqReduzida = "";
  if (a !== 0) eqReduzida += `${a === 1 ? "" : a === -1 ? "-" : a}x^2`;
  if (b !== 0) eqReduzida += `${eqReduzida && b > 0 ? " + " : b < 0 ? " - " : ""}${Math.abs(b) !== 1 ? Math.abs(b) : ""}${b !== 0 ? "x" : ""}`;
  if (c !== 0) eqReduzida += `${eqReduzida && c > 0 ? " + " : c < 0 ? " - " : ""}${Math.abs(c)}`;
  if (!eqReduzida) eqReduzida = "0";
  eqReduzida += " = 0";

  // Logs para depuração
  console.log("Coeficientes finais:", { a, b, c });

  return { a, b, c, reduced: eqReduzida };
}
