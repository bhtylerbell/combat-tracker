export type CombatantType = 'PC' | 'NPC' | 'Monster' | 'Lair Action';

export interface Combatant {
  id: string;
  name: string;
  type: 'PC' | 'NPC' | 'Monster' | 'Lair Action';
  initiative: number;
  currentHP: number;
  maxHP: number;
  ac: number;
  notes?: string;
  isActive: boolean;
  statuses?: string[]; // ✅ New field
}
