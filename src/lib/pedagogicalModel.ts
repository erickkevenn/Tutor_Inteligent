import { QuadraticEquation } from '@/types/tutor';
import { StudentProfile } from './studentModel';
import { Difficulty } from './curriculum';

export interface TeachingStrategy {
  name: string;
  description: string;
  applicableFor: string[];
  techniques: string[];
}

export interface PedagogicalAction {
  type: 'hint' | 'explanation' | 'example' | 'practice' | 'review';
  content: string;
  priority: number;
  reason: string;
}

export interface LearningPath {
  currentConcept: string;
  nextConcepts: string[];
  prerequisites: string[];
  estimatedTime: number;
  difficulty: Difficulty;
}

export class PedagogicalModel {
  private teachingStrategies: TeachingStrategy[] = [
    {
      name: 'Scaffolding',
      description: 'Fornecer suporte gradual que diminui conforme o aluno progride',
      applicableFor: ['beginner', 'struggling'],
      techniques: ['step-by-step', 'guided-practice', 'hints']
    },
    {
      name: 'Mastery Learning',
      description: 'Garantir domínio completo antes de avançar',
      applicableFor: ['methodical', 'perfectionist'],
      techniques: ['repetition', 'varied-practice', 'assessment']
    },
    {
      name: 'Discovery Learning',
      description: 'Permitir que o aluno descubra conceitos por si mesmo',
      applicableFor: ['advanced', 'independent'],
      techniques: ['exploration', 'minimal-guidance', 'problem-solving']
    },
    {
      name: 'Adaptive Feedback',
      description: 'Ajustar feedback baseado no perfil do estudante',
      applicableFor: ['all'],
      techniques: ['immediate-feedback', 'delayed-feedback', 'peer-feedback']
    }
  ];

  // Selecionar estratégia de ensino baseada no perfil do estudante
  selectTeachingStrategy(studentProfile: StudentProfile): TeachingStrategy {
    const { level, totalAttempts, commonMistakes } = studentProfile;
    
    // Para iniciantes ou com muitos erros
    if (level === 'beginner' || commonMistakes.length > 3) {
      return this.teachingStrategies[0]; // Scaffolding
    }
    
    // Para estudantes metódicos
    if (totalAttempts > 20 && studentProfile.averageTime > 60) {
      return this.teachingStrategies[1]; // Mastery Learning
    }
    
    // Para estudantes avançados
    if (level === 'advanced') {
      return this.teachingStrategies[2]; // Discovery Learning
    }
    
    return this.teachingStrategies[3]; // Adaptive Feedback (padrão)
  }

  // Decidir próxima ação pedagógica
  decidePedagogicalAction(
    studentProfile: StudentProfile,
    currentEquation: QuadraticEquation,
    attempts: number,
    lastError?: string
  ): PedagogicalAction {
    const strategy = this.selectTeachingStrategy(studentProfile);
    const successRate = (studentProfile.correctAnswers / Math.max(1, studentProfile.totalAttempts)) * 100;

    // Se muitas tentativas incorretas
    if (attempts >= 3) {
      return {
        type: 'explanation',
        content: 'Vamos revisar o conceito passo a passo.',
        priority: 1,
        reason: 'Muitas tentativas incorretas indicam necessidade de revisão conceitual'
      };
    }

    // Se taxa de sucesso baixa
    if (successRate < 40) {
      return {
        type: 'review',
        content: 'Que tal revisar os conceitos básicos antes de continuar?',
        priority: 1,
        reason: 'Taxa de sucesso baixa indica lacunas no conhecimento'
      };
    }

    // Se erro específico identificado
    if (lastError) {
      return {
        type: 'hint',
        content: this.generateSpecificHint(lastError),
        priority: 2,
        reason: 'Erro específico identificado'
      };
    }

    // Baseado na estratégia selecionada
    if (strategy.name === 'Scaffolding') {
      return {
        type: 'hint',
        content: 'Vou te dar uma dica para te ajudar.',
        priority: 2,
        reason: 'Estratégia de scaffolding para suporte gradual'
      };
    }

    if (strategy.name === 'Discovery Learning') {
      return {
        type: 'practice',
        content: 'Tente resolver sem dicas primeiro.',
        priority: 3,
        reason: 'Estratégia de aprendizagem por descoberta'
      };
    }

    return {
      type: 'hint',
      content: 'Continue tentando, você está no caminho certo!',
      priority: 3,
      reason: 'Encorajamento geral'
    };
  }

  // Adaptar dificuldade baseada no desempenho
  adaptDifficulty(studentProfile: StudentProfile): {
    recommendedDifficulty: Difficulty;
    reason: string;
  } {
    const { level, totalAttempts, correctAnswers, averageTime } = studentProfile;
    const successRate = (correctAnswers / Math.max(1, totalAttempts)) * 100;

    // Critérios para aumentar dificuldade
    if (successRate >= 80 && averageTime < 45 && level !== 'beginner') {
      return {
        recommendedDifficulty: 'hard',
        reason: 'Alto desempenho e rapidez indicam capacidade para desafios maiores'
      };
    }

    // Critérios para diminuir dificuldade
    if (successRate < 40 || averageTime > 120) {
      return {
        recommendedDifficulty: 'easy',
        reason: 'Baixo desempenho ou tempo excessivo indicam necessidade de consolidação'
      };
    }

    // Dificuldade média
    if (successRate >= 50 && successRate < 80) {
      return {
        recommendedDifficulty: 'medium',
        reason: 'Desempenho equilibrado permite progressão gradual'
      };
    }

    return {
      recommendedDifficulty: 'medium',
      reason: 'Configuração padrão para manter engajamento'
    };
  }

  // Gerar trilha de aprendizagem personalizada
  generateLearningPath(studentProfile: StudentProfile): LearningPath {
    const { level, commonMistakes } = studentProfile;

    if (level === 'beginner') {
      return {
        currentConcept: 'Identificação de Coeficientes',
        nextConcepts: ['Cálculo do Discriminante', 'Interpretação do Discriminante'],
        prerequisites: ['Álgebra básica', 'Operações com números negativos'],
        estimatedTime: 30,
        difficulty: 'easy'
      };
    }

    if (level === 'intermediate') {
      const hasDiscriminantIssues = commonMistakes.some(m => 
        m.includes('discriminante') || m.includes('delta')
      );

      if (hasDiscriminantIssues) {
        return {
          currentConcept: 'Cálculo do Discriminante',
          nextConcepts: ['Fórmula de Bhaskara', 'Casos Especiais'],
          prerequisites: ['Identificação de Coeficientes'],
          estimatedTime: 25,
          difficulty: 'medium'
        };
      }

      return {
        currentConcept: 'Fórmula de Bhaskara',
        nextConcepts: ['Casos Especiais', 'Aplicações Práticas'],
        prerequisites: ['Cálculo do Discriminante'],
        estimatedTime: 20,
        difficulty: 'medium'
      };
    }

    // Advanced
    return {
      currentConcept: 'Casos Especiais e Aplicações',
      nextConcepts: ['Equações Bicuadradas', 'Sistemas com Quadráticas'],
      prerequisites: ['Fórmula de Bhaskara', 'Interpretação Gráfica'],
      estimatedTime: 15,
      difficulty: 'hard'
    };
  }

  // Calcular tempo de estudo recomendado
  calculateStudyTime(studentProfile: StudentProfile, targetConcept: string): number {
    const { level, averageTime, totalAttempts } = studentProfile;
    let baseTime = 20; // minutos base

    // Ajustar baseado no nível
    if (level === 'beginner') baseTime = 30;
    else if (level === 'advanced') baseTime = 15;

    // Ajustar baseado no tempo médio do estudante
    if (averageTime > 60) baseTime *= 1.5;
    else if (averageTime < 30) baseTime *= 0.8;

    // Ajustar baseado na experiência (total de tentativas)
    if (totalAttempts < 10) baseTime *= 1.2;
    else if (totalAttempts > 50) baseTime *= 0.9;

    return Math.round(baseTime);
  }

  // Gerar feedback personalizado
  generatePersonalizedFeedback(
    isCorrect: boolean,
    studentProfile: StudentProfile,
    attempts: number
  ): string {
    const { level, commonMistakes } = studentProfile;

    if (isCorrect) {
      if (level === 'beginner') {
        return attempts === 1 ? 
          '🎉 Excelente! Você acertou de primeira!' : 
          '✅ Muito bem! Você conseguiu resolver!';
      } else if (level === 'advanced') {
        return attempts === 1 ? 
          '🏆 Perfeito! Domínio completo!' : 
          '👍 Correto! Continue assim!';
      } else {
        return attempts === 1 ? 
          '🌟 Ótimo trabalho!' : 
          '✅ Correto! Você está progredindo!';
      }
    } else {
      // Feedback para resposta incorreta
      if (attempts === 1) {
        return level === 'beginner' ? 
          '🤔 Não se preocupe, vamos tentar novamente com calma.' :
          '🎯 Quase lá! Revise seus cálculos.';
      } else if (attempts === 2) {
        return 'Que tal dar uma olhada nas dicas? Elas podem ajudar!';
      } else {
        return 'Vamos revisar o conceito passo a passo para esclarecer suas dúvidas.';
      }
    }
  }

  // Determinar quando mostrar dicas
  shouldShowHint(studentProfile: StudentProfile, attempts: number): boolean {
    const { level } = studentProfile;
    
    if (level === 'beginner') return attempts >= 1;
    if (level === 'intermediate') return attempts >= 2;
    return attempts >= 3; // advanced
  }

  // Determinar quando mostrar solução
  shouldShowSolution(studentProfile: StudentProfile, attempts: number): boolean {
    const { level } = studentProfile;
    
    if (level === 'beginner') return attempts >= 3;
    if (level === 'intermediate') return attempts >= 4;
    return attempts >= 5; // advanced
  }

  private generateSpecificHint(error: string): string {
    if (error.includes('discriminante')) {
      return 'Lembre-se: Δ = b² - 4ac. Verifique se você elevou b ao quadrado corretamente.';
    }
    
    if (error.includes('raiz')) {
      return 'Quando Δ > 0, há duas raízes distintas. Use x = (-b ± √Δ) / (2a).';
    }
    
    if (error.includes('sinal')) {
      return 'Atenção aos sinais! O termo -b já inclui a mudança de sinal.';
    }
    
    return 'Revise seus cálculos passo a passo. Identifique onde pode ter ocorrido o erro.';
  }

  // Sugerir próxima atividade
  suggestNextActivity(studentProfile: StudentProfile): {
    activity: string;
    description: string;
    estimatedTime: number;
  } {
    const successRate = (studentProfile.correctAnswers / Math.max(1, studentProfile.totalAttempts)) * 100;
    
    if (successRate < 50) {
      return {
        activity: 'Revisão de Conceitos Básicos',
        description: 'Vamos revisar a identificação de coeficientes e o cálculo do discriminante.',
        estimatedTime: 15
      };
    }
    
    if (successRate < 75) {
      return {
        activity: 'Prática Guiada',
        description: 'Resolva algumas equações com dicas disponíveis.',
        estimatedTime: 20
      };
    }
    
    return {
      activity: 'Desafio Avançado',
      description: 'Teste seus conhecimentos com equações mais complexas.',
      estimatedTime: 25
    };
  }
}