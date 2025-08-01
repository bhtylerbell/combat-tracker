import { supabase, createServerClient } from './supabase';
import { SavedCombat, CreateCombatRequest, UpdateCombatRequest } from '@/types/database';

// Supabase-based database for saved combats
export class SupabaseCombatDatabase {
  async getUserCombats(userId: string): Promise<SavedCombat[]> {
    try {
      const { data, error } = await supabase
        .from('saved_combats')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching combats:', error);
      return [];
    }
  }

  async getCombat(id: string, userId: string): Promise<SavedCombat | null> {
    try {
      const { data, error } = await supabase
        .from('saved_combats')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Supabase error:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching combat:', error);
      return null;
    }
  }

  async createCombat(userId: string, data: CreateCombatRequest): Promise<SavedCombat> {
    try {
      const { data: combat, error } = await supabase
        .from('saved_combats')
        .insert({
          user_id: userId,
          name: data.name,
          description: data.description,
          combat_data: data.combat_data,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      return combat;
    } catch (error) {
      console.error('Error creating combat:', error);
      throw error;
    }
  }

  async updateCombat(data: UpdateCombatRequest, userId: string): Promise<SavedCombat | null> {
    try {
      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.combat_data) updateData.combat_data = data.combat_data;

      const { data: combat, error } = await supabase
        .from('saved_combats')
        .update(updateData)
        .eq('id', data.id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Supabase error:', error);
        throw error;
      }
      
      return combat;
    } catch (error) {
      console.error('Error updating combat:', error);
      return null;
    }
  }

  async deleteCombat(id: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('saved_combats')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting combat:', error);
      return false;
    }
  }

  // Server-side version for API routes
  async createCombatServer(userId: string, data: CreateCombatRequest): Promise<SavedCombat> {
    try {
      const serverClient = createServerClient();
      const { data: combat, error } = await serverClient
        .from('saved_combats')
        .insert({
          user_id: userId,
          name: data.name,
          description: data.description,
          combat_data: data.combat_data,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase server error:', error);
        throw error;
      }
      
      return combat;
    } catch (error) {
      console.error('Error creating combat on server:', error);
      throw error;
    }
  }

  async getUserCombatsServer(userId: string): Promise<SavedCombat[]> {
    try {
      const serverClient = createServerClient();
      const { data, error } = await serverClient
        .from('saved_combats')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Supabase server error:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching combats on server:', error);
      return [];
    }
  }

  async updateCombatServer(data: UpdateCombatRequest, userId: string): Promise<SavedCombat | null> {
    try {
      const serverClient = createServerClient();
      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.combat_data) updateData.combat_data = data.combat_data;

      const { data: combat, error } = await serverClient
        .from('saved_combats')
        .update(updateData)
        .eq('id', data.id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Supabase server error:', error);
        throw error;
      }
      
      return combat;
    } catch (error) {
      console.error('Error updating combat on server:', error);
      return null;
    }
  }

  async deleteCombatServer(id: string, userId: string): Promise<boolean> {
    try {
      const serverClient = createServerClient();
      const { error } = await serverClient
        .from('saved_combats')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Supabase server error:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting combat on server:', error);
      return false;
    }
  }
}

export const combatDB = new SupabaseCombatDatabase();
