import { QuadraticEquation, Solution } from '@/types/tutor';
import { StudentModel } from './studentModel';
import { CurriculumRules } from './curriculum';

export class TutorController {
  private studentModel: StudentModel;
  private curriculum: CurriculumRules;

  constructor() {
    this.studentModel = new StudentModel();
    this.curriculum = new CurriculumRules();
  }

  // Orquestração de estados do tutor
  shouldShowHint(equation: QuadraticEquation, attempts: number): boolean {
    const difficulty = this.curriculum.getEquationDifficulty(equation);
    const studentLevel = this.studentModel.getCurrentLevel();
    
    // Mostrar dica mais cedo para equações difíceis ou estudantes iniciantes
    if (difficulty === 'hard' || studentLevel === 'beginner') {
      return attempts >= 1;
    }
    
    return attempts >= 2;
  }

  getNextHintLevel(currentHint: number, equation: QuadraticEquation): number {
    const maxHints = this.curriculum.getMaxHints(equation);
    return Math.min(currentHint + 1, maxHints - 1);
  }

  shouldGenerateEasierEquation(successRate: number): boolean {
    return successRate < 30; // Se taxa de sucesso for muito baixa
  }

  shouldGenerateHarderEquation(successRate: number): boolean {
    return successRate > 80; // Se taxa de sucesso for muito alta
  }

  getRecommendedEquation(successRate: number): QuadraticEquation {
    if (this.shouldGenerateEasierEquation(successRate)) {
      return this.curriculum.generateEquation('easy');
    } else if (this.shouldGenerateHarderEquation(successRate)) {
      return this.curriculum.generateEquation('hard');
    }
    return this.curriculum.generateEquation('medium');
  }

  processStudentAnswer(
    equation: QuadraticEquation, 
    userAnswer: string, 
    isCorrect: boolean,
    timeSpent: number
  ): void {
    this.studentModel.recordAttempt({
      equation,
      userAnswer,
      isCorrect,
      timeSpent,
      timestamp: Date.now()
    });

    // Atualizar nível do estudante baseado no desempenho
    if (isCorrect) {
      this.studentModel.incrementCorrectAnswers();
    }
  }

  getStudentProgress() {
    return this.studentModel.getProgress();
  }

  resetStudentProgress(): void {
    this.studentModel.reset();
  }
}