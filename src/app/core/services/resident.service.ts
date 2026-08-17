import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { Resident } from '../model/resident.model';
import { Household } from '../model/household.model';

@Injectable({
  providedIn: 'root'
})
export class ResidentService {

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly authService: AuthService
  ) {}

  /**
   * Fetches the resident record linked to the currently logged-in user.
   * Relies on RLS policy: residents.profile_id = auth.uid()
   * so this will only ever return the caller's own row, even if
   * someone tampers with the query client-side.
   */
  async getMyResidentRecord(): Promise<Resident | null> {
    const user = await this.authService.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await this.supabaseService.client
      .from('residents')
      .select('*')
      .eq('profile_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching resident record:', error);
      return null;
    }

    return data as Resident | null;
  }
  async updateMyResidentRecord(updates: Partial<Pick<Resident, 'contact_number' | 'occupation'>>): Promise<Resident | null> {
  const user = await this.authService.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await this.supabaseService.client
    .from('residents')
    .update(updates)
    .eq('profile_id', user.id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating resident record:', error);
    return null;
  }

  return data as Resident | null;
}
  async getMyHousehold(): Promise<Household | null> {
  const resident = await this.getMyResidentRecord();

  if (!resident || !resident.household_id) {
    return null;
  }

  const { data, error } = await this.supabaseService.client
    .from('households')
    .select('*')
    .eq('id', resident.household_id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching household:', error);
    return null;
  }

  return data as Household | null;
}

  async getAllResidents(): Promise<Resident[]> {
  const { data, error } = await this.supabaseService.client
    .from('residents')
    .select('*')
    .order('last_name', { ascending: true });

  if (error) {
    console.error('Error fetching all residents:', error);
    return [];
  }

  return data as Resident[];
}

}