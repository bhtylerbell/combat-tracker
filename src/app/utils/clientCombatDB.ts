import { SavedCombat, CreateCombatRequest, UpdateCombatRequest, CombatState } from '@/types/database';

// Client-side localStorage-based database for saved combats
// This runs in the browser and stores data per user

export class ClientCombatDatabase {
  private generateId(): string {
    return `combat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getStorageKey(userId: string): string {
    return `saved_combats_${userId}`;
  }

  private getAllCombats(userId: string): SavedCombat[] {
    if (typeof window === 'undefined') return [];
    const storageKey = this.getStorageKey(userId);
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  private saveCombats(userId: string, combats: SavedCombat[]): void {
    if (typeof window === 'undefined') return;
    const storageKey = this.getStorageKey(userId);
    localStorage.setItem(storageKey, JSON.stringify(combats));
  }

  async getUserCombats(userId: string): Promise<SavedCombat[]> {
    return this.getAllCombats(userId);
  }

  async getCombat(id: string, userId: string): Promise<SavedCombat | null> {
    const allCombats = this.getAllCombats(userId);
    const combat = allCombats.find(c => c.id === id);
    return combat || null;
  }

  async createCombat(userId: string, data: CreateCombatRequest): Promise<SavedCombat> {
    const allCombats = this.getAllCombats(userId);
    const newCombat: SavedCombat = {
      id: this.generateId(),
      user_id: userId,
      name: data.name,
      description: data.description,
      combat_data: data.combat_data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    allCombats.push(newCombat);
    this.saveCombats(userId, allCombats);
    return newCombat;
  }

  async updateCombat(data: UpdateCombatRequest, userId: string): Promise<SavedCombat | null> {
    const allCombats = this.getAllCombats(userId);
    const index = allCombats.findIndex(c => c.id === data.id);
    
    if (index === -1) return null;

    const updatedCombat: SavedCombat = {
      ...allCombats[index],
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.combat_data && { combat_data: data.combat_data }),
      updated_at: new Date().toISOString(),
    };

    allCombats[index] = updatedCombat;
    this.saveCombats(userId, allCombats);
    return updatedCombat;
  }

  async deleteCombat(id: string, userId: string): Promise<boolean> {
    const allCombats = this.getAllCombats(userId);
    const index = allCombats.findIndex(c => c.id === id);
    
    if (index === -1) return false;

    allCombats.splice(index, 1);
    this.saveCombats(userId, allCombats);
    return true;
  }
}

export const clientCombatDB = new ClientCombatDatabase();
