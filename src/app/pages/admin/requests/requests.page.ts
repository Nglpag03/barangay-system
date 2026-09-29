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
  searchOutline, ellipsisVerticalOutline, closeOutline,
  createOutline, alertCircleOutline, documentTextOutline
} from 'ionicons/icons';

import { RequestService } from '../../../core/services/request.service';
import { ResidentService } from '../../../core/services/resident.service';
import { ResidentRequest, RequestStatus } from '../../../core/model/request.model';
import { Resident } from '../../../core/model/resident.model';
import { AuditLogService } from '../../../core/services/audit-log.service';

@Component({
  selector: 'app-admin-requests',
  templateUrl: './requests.page.html',
  styleUrls: ['./requests.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
    IonSpinner
  ]
})
export class AdminRequestsPage implements OnInit, ViewWillEnter {

  // ─── Data ───
  requests: ResidentRequest[] = [];
  residentsById: Map<string, Resident> = new Map();
  private allRequests: ResidentRequest[] = [];

  // ─── UI State ───
  loading = true;
  loadError = false;
  savingId: string | null = null;
  todayDate = '';
  activeFilter = 'all';
  searchQuery = '';
  openMenuId: string | null = null;
  editingRequest: ResidentRequest | null = null;

  // ─── Drafts ───
  statusDrafts: Record<string, RequestStatus> = {};
  remarksDrafts: Record<string, string> = {};

  constructor(
    private readonly requestService: RequestService,
    private readonly residentService: ResidentService,
    private readonly auditLogService: AuditLogService
  ) {
    addIcons({
      searchOutline,
      ellipsisVerticalOutline,
      closeOutline,
      createOutline,
      alertCircleOutline,
      documentTextOutline
    });
  }

  async ngOnInit() {
    this.todayDate = new Date().toLocaleDateString('en-PH', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }).toUpperCase();
    await this.loadData();
  }

  async ionViewWillEnter() {
    await this.loadData();
  }

  async loadData() {
    this.loading = true;
    this.loadError = false;

    try {
      const [requests, residents] = await Promise.all([
        this.requestService.getAllRequests(),
        this.residentService.getAllResidents()
      ]);

      this.allRequests = requests;
      this.residentsById = new Map(residents.map((r) => [r.id, r]));

      // Initialize drafts
      for (const request of requests) {
        this.statusDrafts[request.id] = request.status;
        this.remarksDrafts[request.id] = request.remarks ?? '';
      }

      this.applyFilters();
    } catch (err) {
      console.error('Failed to load requests:', err);
      this.loadError = true;
    } finally {
      this.loading = false;
    }
  }

  // ─── Display helpers ───
  getResidentName(residentId: string): string {
    const resident = this.residentsById.get(residentId);
    return resident
      ? `${resident.first_name} ${resident.last_name}`
      : 'Unknown Resident';
  }

  getInitials(residentId: string): string {
    const r = this.residentsById.get(residentId);
    if (!r) return '??';
    return `${r.first_name?.[0] ?? ''}${r.last_name?.[0] ?? ''}`.toUpperCase();
  }

  formatRequestType(type: string): string {
    const map: Record<string, string> = {
      'barangay_clearance': 'Barangay Clearance',
      'certificate_of_residency': 'Certificate of Residency',
      'certificate_of_indigency': 'Certificate of Indigency',
      'business_clearance': 'Business Clearance',
      'other': 'Other'
    };
    return map[type] ?? type;
  }

  getStatusClass(status: string): string {
    return status?.toLowerCase() ?? 'pending';
  }

  // ─── Filters ───
  onSearchChange(event: any) {
    this.searchQuery = event.target.value.toLowerCase();
    this.applyFilters();
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
    this.applyFilters();
  }

  applyFilters() {
    const q = this.searchQuery;
    let list = this.allRequests;

    if (this.activeFilter !== 'all') {
      list = list.filter(r => r.status === this.activeFilter);
    }

    if (q) {
      list = list.filter(r => {
        const name = this.getResidentName(r.resident_id).toLowerCase();
        const type = this.formatRequestType(r.request_type).toLowerCase();
        return name.includes(q) || type.includes(q);
      });
    }

    this.requests = list;
  }

  // ─── Action menu ───
  toggleMenu(id: string) {
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  openEdit(request: ResidentRequest) {
    this.editingRequest = request;
    this.openMenuId = null;
  }

  closeEdit() {
    this.editingRequest = null;
  }

  // ─── Update status ───
  async updateStatus(request: ResidentRequest) {
    this.savingId = request.id;

    const newStatus = this.statusDrafts[request.id];
    const newRemarks = this.remarksDrafts[request.id] || null;

    const updated = await this.requestService.updateRequestStatus(
      request.id,
      newStatus,
      newRemarks
    );

    this.savingId = null;

    if (updated) {
      const index = this.allRequests.findIndex((r) => r.id === request.id);
      if (index !== -1) {
        this.allRequests[index] = updated;
      }

      await this.auditLogService.logAction('status_changed', 'request', updated.id, {
        request_type: updated.request_type,
        new_status: updated.status
      });

      this.applyFilters();
      this.editingRequest = null;
    }
  }
}