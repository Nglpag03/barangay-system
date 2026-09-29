import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewWillEnter } from '@ionic/angular';
import {
  IonContent,
  IonIcon,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  alertCircleOutline,
  documentTextOutline
} from 'ionicons/icons';

import { AuditLogService } from '../../../core/services/audit-log.service';
import { AuditLog } from '../../../core/model/audit-log.model';

@Component({
  selector: 'app-admin-audit-logs',
  templateUrl: './audit-logs.page.html',
  styleUrls: ['./audit-logs.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,          // 👈 needed for [(ngModel)]
    IonContent,
    IonIcon,
    IonSpinner
  ]
})
export class AdminAuditLogsPage implements OnInit, ViewWillEnter {

  logs: AuditLog[] = [];
  loading = true;
  loadError = false;

  todayDate = '';
  activeFilter = 'all';
  searchQuery = '';

  constructor(
    private readonly auditLogService: AuditLogService
  ) {
    addIcons({ searchOutline, alertCircleOutline, documentTextOutline });
  }

  async ngOnInit() {
    this.todayDate = new Date().toLocaleDateString('en-PH', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }).toUpperCase();
    await this.loadLogs();
  }

  async ionViewWillEnter() {
    await this.loadLogs();
  }

  async loadLogs() {
    this.loading = true;
    this.loadError = false;

    try {
      this.logs = await this.auditLogService.getAllLogs();
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      this.loadError = true;
    } finally {
      this.loading = false;
    }
  }

  // ─── Filters + search ───
  get filteredLogs(): AuditLog[] {
    const q = this.searchQuery.toLowerCase().trim();
    let list = this.logs;

    if (this.activeFilter !== 'all') {
      list = list.filter(l => l.action === this.activeFilter);
    }

    if (q) {
      list = list.filter(l => {
        const action = (l.action ?? '').toLowerCase();
        const entity = (l.entity_type ?? '').toLowerCase();
        const actor  = (l.user_id ?? '').toLowerCase();
        const meta   = this.formatMetadata(l.metadata).toLowerCase();
        return (
          action.includes(q) ||
          entity.includes(q) ||
          actor.includes(q) ||
          meta.includes(q)
        );
      });
    }

    return list;
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
  }

  // ─── Display helpers ───
  formatAction(action: string | null): string {
    if (!action) return '—';
    const map: Record<string, string> = {
      'created': 'Created',
      'updated': 'Updated',
      'deleted': 'Deleted',
      'uploaded': 'Uploaded',
      'status_changed': 'Status changed'
    };
    return map[action] ?? action;
  }

  getActionClass(action: string | null): string {
    if (!action) return 'default';
    const valid = ['created', 'updated', 'deleted', 'uploaded', 'status_changed'];
    return valid.includes(action) ? action : 'default';
  }

  formatEntity(entity: string | null): string {
    if (!entity) return '—';
    const map: Record<string, string> = {
      'resident': 'Resident',
      'household': 'Household',
      'request': 'Request',
      'document': 'Document'
    };
    return map[entity] ?? entity;
  }

  formatMetadata(metadata: any): string {
    if (!metadata) return '—';
    try {
      const obj = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
      return Object.entries(obj)
        .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
        .join(' · ');
    } catch {
      return String(metadata);
    }
  }

  shortenId(id: string | null): string {
    if (!id) return '—';
    return id.slice(0, 8) + '…';
  }

  getActorInitials(userId: string | null): string {
    if (!userId) return '??';
    return userId.slice(0, 2).toUpperCase();
  }
}