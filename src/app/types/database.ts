import { Combatant } from './combatant';

export interface CombatState {
  combatants: Combatant[];
  turnIndex: number;
  round: number;
  timer: number;
}

export interface SavedCombat {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  combat_data: CombatState;
  created_at: string;
  updated_at: string;
}

export interface CreateCombatRequest {
  name: string;
  description?: string;
  combat_data: CombatState;
}

export interface UpdateCombatRequest {
  id: string;
  name?: string;
  description?: string;
  combat_data?: CombatState;
}
