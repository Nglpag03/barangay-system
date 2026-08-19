import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { AuditLog } from '../model/audit-log.model';

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly authService: AuthService
  ) {}

  /**
   * Records an admin action. Fails silently (logs to console only) rather than
   * blocking the actual operation — an audit log failure shouldn't prevent
   * an admin from completing their real task.
   */
  async logAction(
    action: string,
    entityType: string,
    entityId: string | null,
    metadata: Record<string, any> | null = null
  ): Promise<void> {
    const user = await this.authService.getUser();

    const { error } = await this.supabaseService.client
      .from('audit_logs')
      .insert({
        user_id: user?.id ?? null,
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata
      });

    if (error) {
      console.error('Error recording audit log:', error);
    }
  }

  async getAllLogs(): Promise<AuditLog[]> {
    const { data, error } = await this.supabaseService.client
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }

    return data as AuditLog[];
  }
}