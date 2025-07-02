import { QuadraticEquation, Solution } from '@/types/tutor';

export interface ExpertKnowledge {
  concept: string;
  prerequisites: string[];
  procedures: string[];
  examples: QuadraticEquation[];
  commonErrors: string[];
}

export interface SolutionStep {
  step: number;
  description: string;
  formula?: string;
  calculation?: string;
  result?: string;
}

export class ExpertModel {
  private knowledgeBase: ExpertKnowledge[] = [
    {
      concept: 'Identificação de Coeficientes',
      prerequisites: ['Álgebra básica', 'Polinômios'],
      procedures: [
        'Identificar o coeficiente a (termo x²)',
        'Identificar o coeficiente b (termo x)',
        'Identificar o coeficiente c (termo constante)'
      ],
      examples: [
        { a: 1, b: 2, c: 1 },
        { a: 2, b: -3, c: 1 },
        { a: 1, b: 0, c: -4 }
      ],
      commonErrors: [
        'Confundir a ordem dos coeficientes',
        'Não identificar coeficientes negativos',
        'Ignorar coeficientes implícitos (como 1 em x²)'
      ]
    },
    {
      concept: 'Cálculo do Discriminante',
      prerequisites: ['Identificação de Coeficientes'],
      procedures: [
        'Aplicar a fórmula Δ = b² - 4ac',
        'Calcular b²',
        'Calcular 4ac',
        'Subtrair os valores'
      ],
      examples: [
        { a: 1, b: 2, c: 1 }, // Δ = 0
        { a: 1, b: 3, c: 2 }, // Δ > 0
        { a: 1, b: 1, c: 1 }  // Δ < 0
      ],
      commonErrors: [
        'Esquecer de elevar b ao quadrado',
        'Erro no sinal de 4ac',
        'Erro aritmético básico'
      ]
    },
    {
      concept: 'Fórmula de Bhaskara',
      prerequisites: ['Cálculo do Discriminante'],
      procedures: [
        'Verificar se Δ ≥ 0',
        'Aplicar x = (-b ± √Δ) / (2a)',
        'Calcular x₁ = (-b + √Δ) / (2a)',
        'Calcular x₂ = (-b - √Δ) / (2a)'
      ],
      examples: [
        { a: 1, b: -3, c: 2 },
        { a: 2, b: 4, c: 2 },
        { a: 1, b: 0, c: -4 }
      ],
      commonErrors: [
        'Usar fórmula quando Δ < 0',
        'Erro de sinal em -b',
        'Esquecer de dividir por 2a'
      ]
    }
  ];

  // Resolver equação passo a passo
  solveStepByStep(equation: QuadraticEquation): SolutionStep[] {
    const steps: SolutionStep[] = [];
    const { a, b, c } = equation;

    // Passo 1: Identificar coeficientes
    steps.push({
      step: 1,
      description: 'Identificar os coeficientes da equação',
      formula: `ax² + bx + c = 0`,
      calculation: `a = ${a}, b = ${b}, c = ${c}`,
      result: `Coeficientes identificados`
    });

    // Passo 2: Calcular discriminante
    const delta = b * b - 4 * a * c;
    steps.push({
      step: 2,
      description: 'Calcular o discriminante (Δ)',
      formula: 'Δ = b² - 4ac',
      calculation: `Δ = ${b}² - 4(${a})(${c}) = ${b * b} - ${4 * a * c}`,
      result: `Δ = ${delta}`
    });

    // Passo 3: Analisar discriminante
    if (delta < 0) {
      steps.push({
        step: 3,
        description: 'Analisar o discriminante',
        calculation: `Como Δ = ${delta} < 0`,
        result: 'A equação não possui soluções reais'
      });
    } else if (delta === 0) {
      const x = -b / (2 * a);
      steps.push({
        step: 3,
        description: 'Analisar o discriminante',
        calculation: `Como Δ = 0`,
        result: 'A equação possui uma solução dupla'
      });
      
      steps.push({
        step: 4,
        description: 'Calcular a solução',
        formula: 'x = -b / (2a)',
        calculation: `x = -${b} / (2 × ${a}) = ${-b} / ${2 * a}`,
        result: `x = ${x.toFixed(2)}`
      });
    } else {
      steps.push({
        step: 3,
        description: 'Analisar o discriminante',
        calculation: `Como Δ = ${delta} > 0`,
        result: 'A equação possui duas soluções reais distintas'
      });

      const x1 = (-b + Math.sqrt(delta)) / (2 * a);
      const x2 = (-b - Math.sqrt(delta)) / (2 * a);

      steps.push({
        step: 4,
        description: 'Aplicar a fórmula de Bhaskara',
        formula: 'x = (-b ± √Δ) / (2a)',
        calculation: `x = (${-b} ± √${delta}) / ${2 * a}`,
        result: 'Calculando as duas raízes'
      });

      steps.push({
        step: 5,
        description: 'Calcular x₁',
        calculation: `x₁ = (${-b} + √${delta}) / ${2 * a} = (${-b} + ${Math.sqrt(delta).toFixed(2)}) / ${2 * a}`,
        result: `x₁ = ${x1.toFixed(2)}`
      });

      steps.push({
        step: 6,
        description: 'Calcular x₂',
        calculation: `x₂ = (${-b} - √${delta}) / ${2 * a} = (${-b} - ${Math.sqrt(delta).toFixed(2)}) / ${2 * a}`,
        result: `x₂ = ${x2.toFixed(2)}`
      });
    }

    return steps;
  }

  // Verificar resposta do estudante
  validateAnswer(equation: QuadraticEquation, studentAnswer: string): {
    isCorrect: boolean;
    feedback: string;
    suggestedAction: string;
  } {
    const solution = this.solve(equation);
    const studentAnswers = this.parseStudentAnswer(studentAnswer);

    if (!solution.hasRealSolutions) {
      const noSolutionAnswers = ['sem solução', 'sem soluções', 'não há soluções', 'impossível'];
      const isCorrect = noSolutionAnswers.some(ans => 
        studentAnswer.toLowerCase().includes(ans)
      );

      return {
        isCorrect,
        feedback: isCorrect ? 
          'Correto! A equação não possui soluções reais.' :
          'Incorreto. Quando o discriminante é negativo, não há soluções reais.',
        suggestedAction: isCorrect ? 'continue' : 'review_discriminant'
      };
    }

    const correctAnswers = solution.x1 === solution.x2 ? 
      [solution.x1!] : 
      [solution.x1!, solution.x2!].sort((a, b) => a - b);

    if (studentAnswers.length === 0) {
      return {
        isCorrect: false,
        feedback: 'Por favor, forneça uma resposta válida.',
        suggestedAction: 'retry'
      };
    }

    const sortedStudentAnswers = studentAnswers.sort((a, b) => a - b);
    const tolerance = 0.01;

    const isCorrect = correctAnswers.length === sortedStudentAnswers.length &&
      correctAnswers.every((ans, idx) => 
        Math.abs(ans - sortedStudentAnswers[idx]) < tolerance
      );

    if (isCorrect) {
      return {
        isCorrect: true,
        feedback: 'Excelente! Resposta correta.',
        suggestedAction: 'continue'
      };
    }

    // Análise de erro específica
    if (studentAnswers.length === 1 && correctAnswers.length === 2) {
      return {
        isCorrect: false,
        feedback: 'Você encontrou apenas uma raiz. Esta equação possui duas soluções.',
        suggestedAction: 'review_bhaskara'
      };
    }

    if (studentAnswers.length === 2 && correctAnswers.length === 1) {
      return {
        isCorrect: false,
        feedback: 'Esta equação possui apenas uma solução (raiz dupla).',
        suggestedAction: 'review_discriminant'
      };
    }

    return {
      isCorrect: false,
      feedback: 'Resposta incorreta. Verifique seus cálculos.',
      suggestedAction: 'show_hint'
    };
  }

  private parseStudentAnswer(answer: string): number[] {
    // Remove espaços e divide por vírgula ou ponto e vírgula
    const parts = answer.replace(/\s/g, '').split(/[,;]/);
    const numbers: number[] = [];

    for (const part of parts) {
      const num = parseFloat(part);
      if (!isNaN(num)) {
        numbers.push(num);
      }
    }

    return numbers;
  }

  private solve(equation: QuadraticEquation): Solution {
    const { a, b, c } = equation;
    const delta = b * b - 4 * a * c;
    
    if (delta < 0) {
      return { x1: null, x2: null, delta, hasRealSolutions: false };
    }
    
    if (delta === 0) {
      const x = -b / (2 * a);
      return { x1: x, x2: x, delta, hasRealSolutions: true };
    }
    
    const x1 = (-b + Math.sqrt(delta)) / (2 * a);
    const x2 = (-b - Math.sqrt(delta)) / (2 * a);
    
    return { x1, x2, delta, hasRealSolutions: true };
  }

  // Obter conhecimento sobre um conceito
  getKnowledge(concept: string): ExpertKnowledge | null {
    return this.knowledgeBase.find(kb => kb.concept === concept) || null;
  }

  // Obter todos os conceitos
  getAllConcepts(): string[] {
    return this.knowledgeBase.map(kb => kb.concept);
  }

  // Identificar erro comum
  identifyCommonError(studentAnswer: string, equation: QuadraticEquation): string | null {
    const solution = this.solve(equation);
    
    // Verificar se usou ± incorretamente
    if (studentAnswer.includes('±') && solution.hasRealSolutions) {
      return 'Uso incorreto do símbolo ±. As duas raízes devem ser calculadas separadamente.';
    }

    // Verificar se esqueceu uma raiz
    const numbers = this.parseStudentAnswer(studentAnswer);
    if (numbers.length === 1 && solution.x1 !== solution.x2) {
      return 'Você encontrou apenas uma raiz, mas esta equação possui duas soluções distintas.';
    }

    return null;
  }

  // Gerar exemplo similar
  generateSimilarExample(equation: QuadraticEquation): QuadraticEquation {
    // Manter a mesma estrutura mas com coeficientes ligeiramente diferentes
    const variations = [-1, 0, 1];
    const randomVariation = () => variations[Math.floor(Math.random() * variations.length)];

    return {
      a: Math.max(1, equation.a + randomVariation()),
      b: equation.b + randomVariation(),
      c: equation.c + randomVariation()
    };
  }
}