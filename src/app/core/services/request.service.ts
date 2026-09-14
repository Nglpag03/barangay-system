import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { ResidentService } from './resident.service';
import { ResidentRequest, RequestStatus } from '../model/request.model';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly authService: AuthService,
    private readonly residentService: ResidentService
  ) {}

  async createRequest(requestType: string, purpose: string | null): Promise<ResidentRequest | null> {
    const resident = await this.residentService.getMyResidentRecord();

    if (!resident) {
      console.error('Cannot create request: no resident record linked to this account.');
      return null;
    }

    const { data, error } = await this.supabaseService.client
      .from('requests')
      .insert({
        resident_id: resident.id,
        request_type: requestType,
        purpose: purpose
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error creating request:', error);
      return null;
    }

    return data as ResidentRequest | null;
  }

  async getMyRequests(): Promise<ResidentRequest[]> {
    const resident = await this.residentService.getMyResidentRecord();

    if (!resident) {
      return [];
    }

    const { data, error } = await this.supabaseService.client
      .from('requests')
      .select('*')
      .eq('resident_id', resident.id)
      .order('requested_at', { ascending: false });

    if (error) {
      console.error('Error fetching my requests:', error);
      throw error;
    }

    return data as ResidentRequest[];
  }

  async getAllRequests(): Promise<ResidentRequest[]> {
    const { data, error } = await this.supabaseService.client
      .from('requests')
      .select('*')
      .order('requested_at', { ascending: false });

    if (error) {
      console.error('Error fetching all requests:', error);
      throw error;
    }

    return data as ResidentRequest[];
  }

  async updateRequestStatus(
    id: string,
    status: RequestStatus,
    remarks: string | null
  ): Promise<ResidentRequest | null> {
    const user = await this.authService.getUser();

    const { data, error } = await this.supabaseService.client
      .from('requests')
      .update({
        status,
        remarks,
        processed_by: user?.id ?? null,
        processed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating request status:', error);
      return null;
    }

    return data as ResidentRequest | null;
  }
}