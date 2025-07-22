export type CombatantType = 'PC' | 'NPC' | 'Monster' | 'Lair';

export interface Combatant {
  id: string;
  name: string;
  type: 'PC' | 'NPC' | 'Monster' | 'Lair';
  initiative: number;
  currentHP: number;
  maxHP: number;
  ac: number;
  notes?: string;
  isActive: boolean;
  statuses?: string[]; // ✅ New field
}
