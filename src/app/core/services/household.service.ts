import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Household } from '../model/household.model';

@Injectable({
  providedIn: 'root'
})
export class HouseholdService {

  constructor(
    private readonly supabaseService: SupabaseService
  ) {}

  async getAllHouseholds(): Promise<Household[]> {
    const { data, error } = await this.supabaseService.client
      .from('households')
      .select('*')
      .order('household_number', { ascending: true });

    if (error) {
      console.error('Error fetching all households:', error);
      return [];
    }

    return data as Household[];
  }

  async getHouseholdById(id: string): Promise<Household | null> {
    const { data, error } = await this.supabaseService.client
      .from('households')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching household by id:', error);
      return null;
    }

    return data as Household | null;
  }

  async createHousehold(household: Omit<Household, 'id' | 'created_at' | 'updated_at'>): Promise<Household | null> {
    const { data, error } = await this.supabaseService.client
      .from('households')
      .insert(household)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error creating household:', error);
      return null;
    }

    return data as Household | null;
  }

  async updateHousehold(id: string, updates: Partial<Household>): Promise<Household | null> {
    const { data, error } = await this.supabaseService.client
      .from('households')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating household:', error);
      return null;
    }

    return data as Household | null;
  }
}