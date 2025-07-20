export type CombatantType = 'PC' | 'NPC' | 'Monster';

export interface Combatant {
  id: string;
  name: string;
  type: CombatantType;
  initiative: number;
  currentHP: number;
  maxHP: number;
  ac: number;
  notes?: string;
  isActive: boolean; // For highlighting current turn
}
