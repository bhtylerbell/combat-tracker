import { useState, useEffect, useCallback } from 'react';
import { Combatant } from '@/types/combatant';

interface CombatState {
  combatants: Combatant[];
  turnIndex: number;
  round: number;
  timer: number;
}

export function useCombatSync() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const saveCombatState = useCallback(async (state: CombatState) => {
    try {
      localStorage.setItem('combatState', JSON.stringify(state));
    } catch (err) {
      console.error('Failed to save combat state:', err);
      setError(err as Error);
    }
  }, []);

  const loadCombatState = useCallback(async () => {
    try {
      const savedState = localStorage.getItem('combatState');
      if (!savedState) return null;
      return JSON.parse(savedState);
    } catch (err) {
      console.error('Failed to load combat state:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  // Set loading to false after initial load
  useEffect(() => {
    setIsLoading(false);
  }, []);

  return { 
    saveCombatState, 
    loadCombatState, 
    isLoading, 
    error 
  };
}
