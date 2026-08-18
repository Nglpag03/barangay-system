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

  /**
   * Creates a new request on behalf of the currently logged-in resident.
   * Relies on RLS policy: resident_id in (select id from residents where profile_id = auth.uid())
   */
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

  /**
   * Fetches all requests belonging to the currently logged-in resident.
   * Relies on RLS policy: "Residents can view their own requests"
   */
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
      return [];
    }

    return data as ResidentRequest[];
  }

  /**
   * Admin-only: fetches every request across all residents.
   * Relies on RLS policy: "Admins can manage requests"
   */
  async getAllRequests(): Promise<ResidentRequest[]> {
    const { data, error } = await this.supabaseService.client
      .from('requests')
      .select('*')
      .order('requested_at', { ascending: false });

    if (error) {
      console.error('Error fetching all requests:', error);
      return [];
    }

    return data as ResidentRequest[];
  }

  /**
   * Admin-only: updates a request's status, remarks, and marks who processed it.
   */
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