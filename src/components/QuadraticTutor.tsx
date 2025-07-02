// src/components/QuadraticTutor.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useStudentInteractions } from '@/hooks/useStudentInteractions';
import { TutorController } from '@/lib/tutorController';
import { ExpertModel } from '@/lib/expertModel';
import { PedagogicalModel } from '@/lib/pedagogicalModel';
import beerLogo from '@/assets/beer-logo.png';
import { extractCoefficients } from '@/lib/parseExpression';

interface QuadraticEquation {
  a: number;
  b: number;
  c: number;
}

interface Solution {
  x1: number | null;
  x2: number | null;
  delta: number;
  hasRealSolutions: boolean;
}

const QuadraticTutor: React.FC = () => {
  // Estados principais
  const [expressionInput, setExpressionInput] = useState('x + (4/x)');
  const [equation, setEquation] = useState<QuadraticEquation>({ a: 2, b: 3, c: -5 });
  const [userAnswer, setUserAnswer] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());

  // STI Components
  const [tutorController] = useState(() => new TutorController());
  const [expertModel] = useState(() => new ExpertModel());
  const [pedagogicalModel] = useState(() => new PedagogicalModel());
  const { recordInteraction, getSuccessRate } = useStudentInteractions();
  const { toast } = useToast();

  // Limpa e reseta o estado de resposta
  const resetQuestion = () => {
    setUserAnswer('');
    setShowSolution(false);
    setShowHints(false);
    setCurrentHint(0);
    setAttempts(0);
    setStartTime(Date.now());
  };

  // Gera equação aleatória adaptada ao sucesso do aluno
  const generateRandomEquation = () => {
    const successRate = getSuccessRate();
    const newEq = tutorController.getRecommendedEquation(successRate);
    setEquation(newEq);
    resetQuestion();
    recordInteraction({
      type: 'equation_input',
      data: { equation: newEq, source: 'random', successRate }
    });
  };

  // Aplica a expressão livre: parse -> extrai a,b,c -> seta equação
  const applyExpression = () => {
    const coeffs = extractCoefficients(expressionInput);
    if (!coeffs) {
      toast({
        title: "Expressão inválida",
        description: "Não conseguiu extrair coeficientes de 2º grau.",
        variant: "destructive",
      });
      return;
    }
    const { a, b, c } = coeffs;
    if (a === 0) {
      toast({
        title: "Não é 2º grau",
        description: "O coeficiente quadrático (a) resultou em zero.",
        variant: "destructive",
      });
      return;
    }
    setEquation({ a, b, c });
    resetQuestion();
    recordInteraction({
      type: 'custom_equation',
      data: { equation: { a, b, c }, expression: expressionInput }
    });
  };

  // Resolução e formatação
  const solveQuadratic = (eq: QuadraticEquation): Solution => {
    const { a, b, c } = eq;
    const delta = b * b - 4 * a * c;
    if (delta < 0) return { x1: null, x2: null, delta, hasRealSolutions: false };
    if (delta === 0) {
      const x = -b / (2 * a);
      return { x1: x, x2: x, delta, hasRealSolutions: true };
    }
    const x1 = (-b + Math.sqrt(delta)) / (2 * a);
    const x2 = (-b - Math.sqrt(delta)) / (2 * a);
    return { x1, x2, delta, hasRealSolutions: true };
  };

  const formatEquation = ({ a, b, c }: QuadraticEquation) => {
    let str = `${a}x²`;
    str += b >= 0 ? ` + ${b}x` : ` - ${Math.abs(b)}x`;
    str += c >= 0 ? ` + ${c}` : ` - ${Math.abs(c)}`;
    return str + ' = 0';
  };

  // Verifica a resposta do aluno
  const checkAnswer = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    const timeSpent = (Date.now() - startTime) / 1000;
    const validation = expertModel.validateAnswer(equation, userAnswer);
    tutorController.processStudentAnswer(equation, userAnswer, validation.isCorrect, timeSpent);
    recordInteraction({
      type: 'answer_submission',
      data: { equation, userAnswer, attempts: newAttempts, timeSpent },
      success: validation.isCorrect
    });
    const profile = tutorController.getStudentProgress();
    const feedback = pedagogicalModel.generatePersonalizedFeedback(
      validation.isCorrect, profile, newAttempts
    );
    toast({
      title: validation.isCorrect ? "Correto! 🎉" : "Incorreto 😔",
      description: feedback,
      variant: validation.isCorrect ? "default" : "destructive",
    });
    if (!validation.isCorrect && pedagogicalModel.shouldShowHint(profile, newAttempts)) {
      setShowHints(true);
    }
  };

  const solution = solveQuadratic(equation);
  const solutionSteps = expertModel.solveStepByStep(equation);
  const studentProgress = tutorController.getStudentProgress();

  // Exibe solução automaticamente se a pedagogia mandar
  useEffect(() => {
    if (pedagogicalModel.shouldShowSolution(studentProgress, attempts)) {
      setShowSolution(true);
    }
  }, [attempts, studentProgress]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <Card className="bg-gradient-primary shadow-elegant">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <img src={beerLogo} alt="Logo" className="w-16 h-16" />
              <div>
                <CardTitle className="text-4xl font-bold text-primary-foreground">
                  BRAHMA
                </CardTitle>
                <h2 className="text-2xl font-semibold text-secondary">
                  Quadratic Master
                </h2>
              </div>
              <img src={beerLogo} alt="Logo" className="w-16 h-16" />
            </div>
          </CardHeader>
        </Card>

        {/* Expressão Livre */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-xl text-center">Expressão</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center gap-4">
            <Input
              value={expressionInput}
              onChange={e => setExpressionInput(e.target.value)}
              placeholder="Ex: x + (4/x) ou 3*x^2 - x + 5"
              className="w-full max-w-md"
            />
            <Button onClick={applyExpression} variant="secondary">
              Aplicar Expressão
            </Button>
          </CardContent>
        </Card>

        {/* Equação Atual e Resposta */}
        <Card className="shadow-elegant">
          <CardContent className="p-8 text-center space-y-6">
            <div className="bg-muted p-6 rounded-lg">
              <h3 className="text-3xl font-bold text-foreground">
                {formatEquation(equation)}
              </h3>
            </div>
            <div className="flex items-center gap-4 justify-center">
              <label className="text-xl font-semibold">Sua resposta:</label>
              <Input
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                placeholder="Ex: 1, -2.5 ou 'sem soluções'"
                className="max-w-md"
              />
              <Button
                onClick={checkAnswer}
                className="bg-secondary hover:bg-secondary/90"
              >
                Submit
              </Button>
            </div>
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setShowHints(!showHints);
                  if (!showHints) setCurrentHint(0);
                }}
              >
                {showHints ? 'Ocultar Dicas' : 'Mostrar Dicas'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowSolution(!showSolution);
                }}
              >
                {showSolution ? 'Ocultar Solução' : 'Ver Solução'}
              </Button>
              <Button
                variant="secondary"
                onClick={generateRandomEquation}
              >
                Nova Equação
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Seções de Dicas e Solução Passo a Passo seguem inalteradas... */}
        {showHints && (
          <Card className="shadow-elegant">
            {/* ...conteúdo das dicas */}
          </Card>
        )}
        {showSolution && (
          <Card className="shadow-elegant border-secondary">
            {/* ...conteúdo da solução passo a passo */}
          </Card>
        )}

      </div>
    </div>
  );
};

export default QuadraticTutor;
