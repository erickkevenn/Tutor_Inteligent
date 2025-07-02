import { QuadraticEquation } from '@/types/tutor';

export interface StudentAttempt {
  equation: QuadraticEquation;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number; // em segundos
  timestamp: number;
}

export interface StudentProfile {
  level: 'beginner' | 'intermediate' | 'advanced';
  totalAttempts: number;
  correctAnswers: number;
  averageTime: number;
  commonMistakes: string[];
  preferredDifficulty: 'easy' | 'medium' | 'hard';
  lastSession: number;
}

export class StudentModel {
  private profile: StudentProfile;
  private attempts: StudentAttempt[] = [];
  private readonly STORAGE_KEY = 'quadratic_tutor_student';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.profile = data.profile;
        this.attempts = data.attempts || [];
      } else {
        this.initializeProfile();
      }
    } catch (error) {
      console.error('Erro ao carregar dados do estudante:', error);
      this.initializeProfile();
    }
  }

  private saveToStorage(): void {
    try {
      const data = {
        profile: this.profile,
        attempts: this.attempts.slice(-50) // Manter apenas as últimas 50 tentativas
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar dados do estudante:', error);
    }
  }

  private initializeProfile(): void {
    this.profile = {
      level: 'beginner',
      totalAttempts: 0,
      correctAnswers: 0,
      averageTime: 0,
      commonMistakes: [],
      preferredDifficulty: 'easy',
      lastSession: Date.now()
    };
    this.attempts = [];
  }

  recordAttempt(attempt: StudentAttempt): void {
    this.attempts.push(attempt);
    this.profile.totalAttempts++;
    this.profile.lastSession = Date.now();

    if (attempt.isCorrect) {
      this.profile.correctAnswers++;
    } else {
      this.analyzeError(attempt);
    }

    this.updateAverageTime(attempt.timeSpent);
    this.updateLevel();
    this.updatePreferredDifficulty();
    this.saveToStorage();
  }

  private analyzeError(attempt: StudentAttempt): void {
    // Análise simples de erros comuns
    const { equation, userAnswer } = attempt;
    
    if (userAnswer.includes('±')) {
      this.addCommonMistake('Uso incorreto do símbolo ±');
    }
    
    if (parseFloat(userAnswer) && !userAnswer.includes(',')) {
      this.addCommonMistake('Forneceu apenas uma raiz quando há duas');
    }
  }

  private addCommonMistake(mistake: string): void {
    if (!this.profile.commonMistakes.includes(mistake)) {
      this.profile.commonMistakes.push(mistake);
      // Manter apenas os 5 erros mais recentes
      if (this.profile.commonMistakes.length > 5) {
        this.profile.commonMistakes.shift();
      }
    }
  }

  private updateAverageTime(newTime: number): void {
    const total = this.profile.averageTime * (this.profile.totalAttempts - 1) + newTime;
    this.profile.averageTime = total / this.profile.totalAttempts;
  }

  private updateLevel(): void {
    const successRate = this.getSuccessRate();
    const totalAttempts = this.profile.totalAttempts;

    if (totalAttempts >= 20 && successRate >= 80) {
      this.profile.level = 'advanced';
    } else if (totalAttempts >= 10 && successRate >= 60) {
      this.profile.level = 'intermediate';
    } else {
      this.profile.level = 'beginner';
    }
  }

  private updatePreferredDifficulty(): void {
    const recentAttempts = this.attempts.slice(-10);
    const recentSuccessRate = recentAttempts.length > 0 ? 
      (recentAttempts.filter(a => a.isCorrect).length / recentAttempts.length) * 100 : 0;

    if (recentSuccessRate >= 80) {
      this.profile.preferredDifficulty = 'hard';
    } else if (recentSuccessRate >= 50) {
      this.profile.preferredDifficulty = 'medium';
    } else {
      this.profile.preferredDifficulty = 'easy';
    }
  }

  getSuccessRate(): number {
    if (this.profile.totalAttempts === 0) return 0;
    return (this.profile.correctAnswers / this.profile.totalAttempts) * 100;
  }

  getCurrentLevel(): 'beginner' | 'intermediate' | 'advanced' {
    return this.profile.level;
  }

  getProgress(): StudentProfile {
    return { ...this.profile };
  }

  getRecentAttempts(count: number = 10): StudentAttempt[] {
    return this.attempts.slice(-count);
  }

  incrementCorrectAnswers(): void {
    // Este método é chamado pelo controller quando uma resposta está correta
    // A lógica principal já está no recordAttempt
  }

  reset(): void {
    this.initializeProfile();
    this.attempts = [];
    this.saveToStorage();
  }

  exportData(): string {
    return JSON.stringify({
      profile: this.profile,
      attempts: this.attempts
    }, null, 2);
  }
}