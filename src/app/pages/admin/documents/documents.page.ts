import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewWillEnter } from '@ionic/angular';
import {
  IonContent,
    IonIcon,
    IonSpinner
} from '@ionic/angular/standalone';

import { DocumentService } from '../../../core/services/document.service';
import { ResidentService } from '../../../core/services/resident.service';
import { ResidentDocument } from '../../../core/model/document.model';
import { Resident } from '../../../core/model/resident.model';
import { AuditLogService } from '../../../core/services/audit-log.service';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  cloudUploadOutline,
  closeOutline,
  alertCircleOutline,
  documentTextOutline
} from 'ionicons/icons';
@Component({
  selector: 'app-admin-documents',
  templateUrl: './documents.page.html',
  styleUrls: ['./documents.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
      IonIcon,
    IonSpinner
  ]
})
export class AdminDocumentsPage implements OnInit, ViewWillEnter {

  documents: ResidentDocument[] = [];
  residents: Resident[] = [];
  residentsById: Map<string, Resident> = new Map();
  loading = true;
  loadError = false;
  uploading = false;
  uploadError: string | null = null;

  selectedResidentId: string | null = null;
  documentType = '';
  documentNumber = '';
  selectedFile: File | null = null;

  todayDate = '';
activeFilter = 'all';
searchQuery = '';
uploadOpen = false;

  constructor(
    private readonly documentService: DocumentService,
    private readonly residentService: ResidentService,
    private readonly auditLogService: AuditLogService
  ) {
    addIcons({
  searchOutline,
  cloudUploadOutline,
  closeOutline,
  alertCircleOutline,
  documentTextOutline
});}

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
      const [documents, residents] = await Promise.all([
        this.documentService.getAllDocuments(),
        this.residentService.getAllResidents()
      ]);

      this.documents = documents;
      this.residents = residents;
      this.residentsById = new Map(residents.map((r) => [r.id, r]));
    } catch (err) {
      console.error('Failed to load documents:', err);
      this.loadError = true;
    } finally {
      this.loading = false;
    }
  }

  getResidentName(residentId: string): string {
    const resident = this.residentsById.get(residentId);
    return resident ? `${resident.first_name} ${resident.last_name}` : 'Unknown Resident';
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0] ?? null;
    this.selectedFile = file;
  }

  async upload() {
    if (!this.selectedResidentId || !this.documentType || !this.selectedFile) {
      this.uploadError = 'Please select a resident, document type, and file.';
      return;
    }

    this.uploading = true;
    this.uploadError = null;

    const created = await this.documentService.uploadDocumentForResident(
      this.selectedResidentId,
      this.selectedFile,
      this.documentType,
      this.documentNumber || null,
      null
    );

    this.uploading = false;

    if (!created) {
      this.uploadError = 'Something went wrong while uploading. Please try again.';
      return;
    }

    await this.auditLogService.logAction('uploaded', 'document', created.id, {
      document_type: created.document_type,
      resident_id: created.resident_id
    });

    this.documents = [created, ...this.documents];
    this.selectedResidentId = null;
    this.documentType = '';
    this.documentNumber = '';
    this.selectedFile = null;
  }

  // ─── Search / filter ───
get filteredDocuments(): ResidentDocument[] {
  const q = this.searchQuery.toLowerCase().trim();
  let list = this.documents;

  if (this.activeFilter !== 'all') {
    list = list.filter(d => d.status === this.activeFilter);
  }

  if (q) {
    list = list.filter(d => {
      const name = this.getResidentName(d.resident_id).toLowerCase();
      const type = d.document_type?.toLowerCase() ?? '';
      const num  = d.document_number?.toLowerCase() ?? '';
      return name.includes(q) || type.includes(q) || num.includes(q);
    });
  }

  return list;
}

applyFilters() { /* no-op — getter handles it, but called for ngModelChange */ }

setFilter(filter: string) {
  this.activeFilter = filter;
}

// ─── Initials for avatar ───
getInitials(residentId: string): string {
  const r = this.residentsById.get(residentId);
  if (!r) return '??';
  return `${r.first_name?.[0] ?? ''}${r.last_name?.[0] ?? ''}`.toUpperCase();
}

// ─── Upload modal ───
openUpload() {
  this.uploadOpen = true;
  this.uploadError = null;
}

closeUpload() {
  this.uploadOpen = false;
  this.uploadError = null;
}
}