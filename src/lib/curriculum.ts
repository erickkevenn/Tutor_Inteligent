import { QuadraticEquation } from '@/types/tutor';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface CurriculumRule {
  name: string;
  condition: (equation: QuadraticEquation) => boolean;
  difficulty: Difficulty;
  description: string;
}

export class CurriculumRules {
  private rules: CurriculumRule[] = [
    {
      name: 'perfect_square',
      condition: (eq) => this.isPerfectSquare(eq),
      difficulty: 'easy',
      description: 'Equação do tipo quadrado perfeito'
    },
    {
      name: 'no_linear_term',
      condition: (eq) => eq.b === 0,
      difficulty: 'easy',
      description: 'Equação sem termo linear (bx)'
    },
    {
      name: 'no_constant_term',
      condition: (eq) => eq.c === 0,
      difficulty: 'easy',
      description: 'Equação sem termo constante'
    },
    {
      name: 'integer_coefficients_small',
      condition: (eq) => this.hasSmallIntegerCoefficients(eq),
      difficulty: 'medium',
      description: 'Coeficientes inteiros pequenos'
    },
    {
      name: 'negative_discriminant',
      condition: (eq) => this.getDiscriminant(eq) < 0,
      difficulty: 'medium',
      description: 'Discriminante negativo (sem soluções reais)'
    },
    {
      name: 'large_coefficients',
      condition: (eq) => this.hasLargeCoefficients(eq),
      difficulty: 'hard',
      description: 'Coeficientes grandes'
    },
    {
      name: 'decimal_coefficients',
      condition: (eq) => this.hasDecimalCoefficients(eq),
      difficulty: 'hard',
      description: 'Coeficientes decimais'
    },
    {
      name: 'irrational_roots',
      condition: (eq) => this.hasIrrationalRoots(eq),
      difficulty: 'hard',
      description: 'Raízes irracionais'
    }
  ];

  getEquationDifficulty(equation: QuadraticEquation): Difficulty {
    for (const rule of this.rules) {
      if (rule.condition(equation)) {
        return rule.difficulty;
      }
    }
    return 'medium'; // padrão
  }

  generateEquation(targetDifficulty: Difficulty): QuadraticEquation {
    const maxAttempts = 50;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const equation = this.generateRandomEquation(targetDifficulty);
      if (this.getEquationDifficulty(equation) === targetDifficulty) {
        return equation;
      }
      attempts++;
    }
    
    // Fallback: gerar equação simples
    return this.generateSimpleEquation(targetDifficulty);
  }

  private generateRandomEquation(difficulty: Difficulty): QuadraticEquation {
    switch (difficulty) {
      case 'easy':
        return {
          a: Math.floor(Math.random() * 3) + 1, // 1-3
          b: Math.floor(Math.random() * 7) - 3, // -3 a 3
          c: Math.floor(Math.random() * 7) - 3  // -3 a 3
        };
      
      case 'medium':
        return {
          a: Math.floor(Math.random() * 5) + 1, // 1-5
          b: Math.floor(Math.random() * 11) - 5, // -5 a 5
          c: Math.floor(Math.random() * 11) - 5  // -5 a 5
        };
      
      case 'hard':
        return {
          a: Math.floor(Math.random() * 8) + 2, // 2-9
          b: Math.floor(Math.random() * 21) - 10, // -10 a 10
          c: Math.floor(Math.random() * 21) - 10  // -10 a 10
        };
      
      default:
        return { a: 1, b: 0, c: -1 };
    }
  }

  private generateSimpleEquation(difficulty: Difficulty): QuadraticEquation {
    switch (difficulty) {
      case 'easy':
        return { a: 1, b: 0, c: -4 }; // x² - 4 = 0
      case 'medium':
        return { a: 2, b: 3, c: -5 }; // 2x² + 3x - 5 = 0
      case 'hard':
        return { a: 3, b: 7, c: 2 }; // 3x² + 7x + 2 = 0
      default:
        return { a: 1, b: 0, c: -1 };
    }
  }

  getMaxHints(equation: QuadraticEquation): number {
    const difficulty = this.getEquationDifficulty(equation);
    switch (difficulty) {
      case 'easy': return 3;
      case 'medium': return 4;
      case 'hard': return 5;
      default: return 4;
    }
  }

  getApplicableRules(equation: QuadraticEquation): CurriculumRule[] {
    return this.rules.filter(rule => rule.condition(equation));
  }

  // Métodos auxiliares para as regras
  private isPerfectSquare(eq: QuadraticEquation): boolean {
    // Verifica se é da forma (ax + b)²
    const discriminant = this.getDiscriminant(eq);
    return discriminant === 0;
  }

  private hasSmallIntegerCoefficients(eq: QuadraticEquation): boolean {
    return Math.abs(eq.a) <= 5 && Math.abs(eq.b) <= 5 && Math.abs(eq.c) <= 5 &&
           Number.isInteger(eq.a) && Number.isInteger(eq.b) && Number.isInteger(eq.c);
  }

  private hasLargeCoefficients(eq: QuadraticEquation): boolean {
    return Math.abs(eq.a) > 10 || Math.abs(eq.b) > 10 || Math.abs(eq.c) > 10;
  }

  private hasDecimalCoefficients(eq: QuadraticEquation): boolean {
    return !Number.isInteger(eq.a) || !Number.isInteger(eq.b) || !Number.isInteger(eq.c);
  }

  private hasIrrationalRoots(eq: QuadraticEquation): boolean {
    const discriminant = this.getDiscriminant(eq);
    if (discriminant <= 0) return false;
    
    const sqrt = Math.sqrt(discriminant);
    return !Number.isInteger(sqrt);
  }

  private getDiscriminant(eq: QuadraticEquation): number {
    return eq.b * eq.b - 4 * eq.a * eq.c;
  }

  // Métodos para análise curricular
  getCurriculumProgress(attempts: any[]): {
    easyCompleted: number;
    mediumCompleted: number;
    hardCompleted: number;
    totalCompleted: number;
  } {
    const completed = attempts.filter(attempt => attempt.isCorrect);
    
    return {
      easyCompleted: completed.filter(a => this.getEquationDifficulty(a.equation) === 'easy').length,
      mediumCompleted: completed.filter(a => this.getEquationDifficulty(a.equation) === 'medium').length,
      hardCompleted: completed.filter(a => this.getEquationDifficulty(a.equation) === 'hard').length,
      totalCompleted: completed.length
    };
  }

  getRecommendedTopics(studentLevel: string, recentMistakes: string[]): string[] {
    const topics = [];
    
    if (studentLevel === 'beginner') {
      topics.push('Identificação de coeficientes', 'Cálculo do discriminante');
    }
    
    if (recentMistakes.includes('Uso incorreto do símbolo ±')) {
      topics.push('Fórmula de Bhaskara', 'Interpretação de raízes');
    }
    
    if (recentMistakes.includes('Forneceu apenas uma raiz quando há duas')) {
      topics.push('Casos especiais do discriminante', 'Duas soluções distintas');
    }
    
    return topics;
  }
}