import { useState, useCallback } from 'react';

export interface StudentInteraction {
  type: 'equation_input' | 'answer_submission' | 'hint_request' | 'solution_view' | 'custom_equation';
  timestamp: number;
  data: any;
  success?: boolean;
}

export const useStudentInteractions = () => {
  const [interactions, setInteractions] = useState<StudentInteraction[]>([]);

  const recordInteraction = useCallback((interaction: Omit<StudentInteraction, 'timestamp'>) => {
    const newInteraction: StudentInteraction = {
      ...interaction,
      timestamp: Date.now()
    };
    setInteractions(prev => [...prev, newInteraction]);
    return newInteraction;
  }, []);

  const getInteractionHistory = useCallback(() => interactions, [interactions]);

  const getInteractionsByType = useCallback((type: StudentInteraction['type']) => {
    return interactions.filter(interaction => interaction.type === type);
  }, [interactions]);

  const getSuccessRate = useCallback(() => {
    const submissions = interactions.filter(i => i.type === 'answer_submission');
    if (submissions.length === 0) return 0;
    const successful = submissions.filter(i => i.success).length;
    return (successful / submissions.length) * 100;
  }, [interactions]);

  return {
    recordInteraction,
    getInteractionHistory,
    getInteractionsByType,
    getSuccessRate,
    totalInteractions: interactions.length
  };
};