import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonLabel,
  IonBackButton,
  IonButtons,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonBadge
} from '@ionic/angular/standalone';

import { DocumentService } from '../../../core/services/document.service';
import { ResidentService } from '../../../core/services/resident.service';
import { ResidentDocument } from '../../../core/model/document.model';
import { Resident } from '../../../core/model/resident.model';

@Component({
  selector: 'app-admin-documents',
  templateUrl: './documents.page.html',
  styleUrls: ['./documents.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonLabel,
    IonBackButton,
    IonButtons,
    IonButton,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonBadge
  ]
})
export class AdminDocumentsPage implements OnInit {

  documents: ResidentDocument[] = [];
  residents: Resident[] = [];
  residentsById: Map<string, Resident> = new Map();
  loading = true;
  uploading = false;
  uploadError: string | null = null;

  // Upload form state
  selectedResidentId: string | null = null;
  documentType = '';
  documentNumber = '';
  selectedFile: File | null = null;

  constructor(
    private readonly documentService: DocumentService,
    private readonly residentService: ResidentService
  ) {}

  async ngOnInit() {
    const [documents, residents] = await Promise.all([
      this.documentService.getAllDocuments(),
      this.residentService.getAllResidents()
    ]);

    this.documents = documents;
    this.residents = residents;
    this.residentsById = new Map(residents.map((r) => [r.id, r]));
    this.loading = false;
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

    this.documents = [created, ...this.documents];
    this.selectedResidentId = null;
    this.documentType = '';
    this.documentNumber = '';
    this.selectedFile = null;
  }
}