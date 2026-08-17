import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { Resident } from '../model/resident.model';

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
}