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

const QuadraticTutor = () => {
  const [equation, setEquation] = useState<QuadraticEquation>({ a: 2, b: 3, c: -5 });
  const [userAnswer, setUserAnswer] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [customA, setCustomA] = useState('2');
  const [customB, setCustomB] = useState('3');
  const [customC, setCustomC] = useState('-5');
  const [startTime, setStartTime] = useState(Date.now());
  
  // STI Components
  const [tutorController] = useState(() => new TutorController());
  const [expertModel] = useState(() => new ExpertModel());
  const [pedagogicalModel] = useState(() => new PedagogicalModel());
  const { recordInteraction, getSuccessRate } = useStudentInteractions();
  const { toast } = useToast();

  const generateRandomEquation = () => {
    const successRate = getSuccessRate();
    const newEquation = tutorController.getRecommendedEquation(successRate);
    
    setEquation(newEquation);
    setCustomA(newEquation.a.toString());
    setCustomB(newEquation.b.toString());
    setCustomC(newEquation.c.toString());
    resetQuestion();
    
    recordInteraction({
      type: 'equation_input',
      data: { equation: newEquation, source: 'random', successRate }
    });
  };

  const applyCustomEquation = () => {
    const a = parseFloat(customA);
    const b = parseFloat(customB);
    const c = parseFloat(customC);
    
    if (isNaN(a) || isNaN(b) || isNaN(c) || a === 0) {
      toast({
        title: "Valores inválidos",
        description: "Por favor, insira números válidos. O coeficiente 'a' não pode ser zero.",
        variant: "destructive",
      });
      return;
    }
    
    const newEquation = { a, b, c };
    setEquation(newEquation);
    resetQuestion();
    
    recordInteraction({
      type: 'custom_equation',
      data: { equation: newEquation }
    });
  };

  const resetQuestion = () => {
    setUserAnswer('');
    setShowSolution(false);
    setShowHints(false);
    setCurrentHint(0);
    setAttempts(0);
    setStartTime(Date.now());
  };

  const nextHint = () => {
    if (currentHint < 3) {
      setCurrentHint(currentHint + 1);
      recordInteraction({
        type: 'hint_request',
        data: { equation, hintLevel: currentHint + 1 }
      });
    }
  };

  const resetHints = () => {
    setCurrentHint(0);
  };

  const solveQuadratic = (eq: QuadraticEquation): Solution => {
    const { a, b, c } = eq;
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
  };

  const formatEquation = (eq: QuadraticEquation) => {
    const { a, b, c } = eq;
    let equation = `${a}x²`;
    
    if (b > 0) equation += ` + ${b}x`;
    else if (b < 0) equation += ` - ${Math.abs(b)}x`;
    
    if (c > 0) equation += ` + ${c}`;
    else if (c < 0) equation += ` - ${Math.abs(c)}`;
    
    return equation + ' = 0';
  };

  const checkAnswer = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    const timeSpent = (Date.now() - startTime) / 1000; // em segundos
    const validation = expertModel.validateAnswer(equation, userAnswer);
    
    // Processar resposta no controlador
    tutorController.processStudentAnswer(equation, userAnswer, validation.isCorrect, timeSpent);
    
    // Registrar interação
    recordInteraction({
      type: 'answer_submission',
      data: { equation, userAnswer, attempts: newAttempts, timeSpent },
      success: validation.isCorrect
    });
    
    // Obter feedback personalizado
    const studentProfile = tutorController.getStudentProgress();
    const personalizedFeedback = pedagogicalModel.generatePersonalizedFeedback(
      validation.isCorrect, 
      studentProfile, 
      newAttempts
    );
    
    toast({
      title: validation.isCorrect ? "Correto! 🎉" : "Resposta incorreta 😔",
      description: personalizedFeedback,
      variant: validation.isCorrect ? "default" : "destructive",
    });
    
    // Mostrar dicas automaticamente se necessário
    if (!validation.isCorrect && pedagogicalModel.shouldShowHint(studentProfile, newAttempts)) {
      setShowHints(true);
    }
  };

  const solution = solveQuadratic(equation);
  const solutionSteps = expertModel.solveStepByStep(equation);
  const studentProgress = tutorController.getStudentProgress();

  // Efeito para mostrar solução automaticamente se necessário
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

        {/* Custom Equation Input */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-xl text-center">Criar Equação Personalizada</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 justify-center flex-wrap">
              <div className="flex items-center gap-2">
                <label className="font-semibold">a:</label>
                <Input
                  value={customA}
                  onChange={(e) => setCustomA(e.target.value)}
                  placeholder="2"
                  className="w-20"
                />
              </div>
              <span className="text-2xl font-bold">x² +</span>
              <div className="flex items-center gap-2">
                <label className="font-semibold">b:</label>
                <Input
                  value={customB}
                  onChange={(e) => setCustomB(e.target.value)}
                  placeholder="3"
                  className="w-20"
                />
              </div>
              <span className="text-2xl font-bold">x +</span>
              <div className="flex items-center gap-2">
                <label className="font-semibold">c:</label>
                <Input
                  value={customC}
                  onChange={(e) => setCustomC(e.target.value)}
                  placeholder="-5"
                  className="w-20"
                />
              </div>
              <span className="text-2xl font-bold">= 0</span>
              <Button onClick={applyCustomEquation} variant="secondary">
                Aplicar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Equation */}
        <Card className="shadow-elegant">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="bg-muted p-6 rounded-lg">
                <h3 className="text-3xl font-bold text-foreground">
                  {formatEquation(equation)}
                </h3>
              </div>
              
              <div className="flex items-center gap-4 justify-center">
                <label className="text-xl font-semibold">Sua resposta:</label>
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Ex: 1, -2.5 ou 'sem soluções'"
                  className="max-w-md"
                />
                <Button onClick={checkAnswer} className="bg-secondary hover:bg-secondary/90">
                  Submit
                </Button>
              </div>
              
              <div className="flex gap-4 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowHints(!showHints);
                    if (!showHints) resetHints();
                  }}
                >
                  {showHints ? 'Ocultar Dicas' : 'Mostrar Dicas'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowSolution(!showSolution);
                    if (!showSolution) {
                      recordInteraction({
                        type: 'solution_view',
                        data: { equation, attempts }
                      });
                    }
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
            </div>
          </CardContent>
        </Card>

        {/* Hints Section */}
        {showHints && (
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-2xl">Dicas para Solução - Passo {currentHint + 1}</CardTitle>
              <p className="text-muted-foreground">
                Progresso: {studentProgress.correctAnswers}/{studentProgress.totalAttempts} corretas 
                ({((studentProgress.correctAnswers / Math.max(1, studentProgress.totalAttempts)) * 100).toFixed(1)}% de acerto)
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {currentHint >= 0 && (
                  <Card className="bg-muted">
                    <CardContent className="p-4">
                      <h4 className="font-semibold">Passo 1: Identifique a, b e c.</h4>
                      <p>Na equação {formatEquation(equation)}:</p>
                      <div className="flex gap-4 mt-2">
                        <Badge variant="secondary">a = {equation.a}</Badge>
                        <Badge variant="secondary">b = {equation.b}</Badge>
                        <Badge variant="secondary">c = {equation.c}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {currentHint >= 1 && (
                  <Card className="bg-muted">
                    <CardContent className="p-4">
                      <h4 className="font-semibold">Passo 2: Calcule o delta (Δ).</h4>
                      <p>Δ = b² - 4ac = {equation.b}² - 4({equation.a})({equation.c}) = {solution.delta}</p>
                    </CardContent>
                  </Card>
                )}
                
                {currentHint >= 2 && (
                  <Card className="bg-muted">
                    <CardContent className="p-4">
                      <h4 className="font-semibold">Passo 3: Resolva para as raízes.</h4>
                      <p>Use a fórmula de Bhaskara: x = (-b ± √Δ) / (2a)</p>
                    </CardContent>
                  </Card>
                )}
                
                {currentHint >= 3 && (
                  <Card className="bg-muted">
                    <CardContent className="p-4">
                      <h4 className="font-semibold">Passo 4: Verifique as soluções.</h4>
                      <p>Substitua os valores encontrados na equação original.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <div className="flex gap-4 justify-center mt-4">
                {currentHint < 3 && (
                  <Button onClick={nextHint} variant="secondary">
                    Próxima Dica
                  </Button>
                )}
                {currentHint > 0 && (
                  <Button onClick={resetHints} variant="outline">
                    Resetar Dicas
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Solution Section */}
        {showSolution && (
          <Card className="shadow-elegant border-secondary">
            <CardHeader>
              <CardTitle className="text-2xl text-secondary">Solução Passo a Passo</CardTitle>
              <p className="text-muted-foreground">
                Modelo do Especialista - Resolução completa
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {solutionSteps.map((step, index) => (
                <div key={index} className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">
                    Passo {step.step}: {step.description}
                  </h4>
                  {step.formula && (
                    <p className="text-sm text-muted-foreground mb-1">
                      <strong>Fórmula:</strong> {step.formula}
                    </p>
                  )}
                  {step.calculation && (
                    <p className="text-sm mb-1">
                      <strong>Cálculo:</strong> {step.calculation}
                    </p>
                  )}
                  {step.result && (
                    <p className="font-semibold text-secondary">
                      <strong>Resultado:</strong> {step.result}
                    </p>
                  )}
                </div>
              ))}
              
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-primary mb-2">Resumo da Solução</h4>
                <p><strong>Equação:</strong> {formatEquation(equation)}</p>
                <p><strong>Discriminante:</strong> Δ = {solution.delta}</p>
                {!solution.hasRealSolutions ? (
                  <p className="text-destructive font-semibold">
                    ❌ Sem soluções reais (Δ &lt; 0)
                  </p>
                ) : solution.x1 === solution.x2 ? (
                  <p className="text-secondary font-semibold">
                    ✅ Solução única: x = {solution.x1?.toFixed(2)}
                  </p>
                ) : (
                  <div className="text-secondary font-semibold">
                    <p>✅ Duas soluções reais:</p>
                    <p>x₁ = {solution.x1?.toFixed(2)} e x₂ = {solution.x2?.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QuadraticTutor;