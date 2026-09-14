import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewWillEnter } from '@ionic/angular';
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
  IonBadge
} from '@ionic/angular/standalone';

import { DocumentService } from '../../../core/services/document.service';
import { ResidentDocument } from '../../../core/model/document.model';

@Component({
  selector: 'app-user-documents',
  templateUrl: './documents.page.html',
  styleUrls: ['./documents.page.scss'],
  imports: [
    CommonModule,
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
    IonBadge
  ]
})
export class UserDocumentsPage implements OnInit, ViewWillEnter {

  documents: ResidentDocument[] = [];
  loading = true;
  loadError = false;
  downloadingId: string | null = null;
  downloadError: string | null = null;

  constructor(
    private readonly documentService: DocumentService
  ) {}

  async ngOnInit() {
    await this.loadDocuments();
  }

  async ionViewWillEnter() {
    await this.loadDocuments();
  }

  async loadDocuments() {
    this.loading = true;
    this.loadError = false;

    try {
      this.documents = await this.documentService.getMyDocuments();
    } catch (err) {
      console.error('Failed to load documents:', err);
      this.loadError = true;
    } finally {
      this.loading = false;
    }
  }

  async download(document: ResidentDocument) {
    if (!document.file_path) {
      return;
    }

    this.downloadingId = document.id;
    this.downloadError = null;

    const url = await this.documentService.getDocumentDownloadUrl(document.file_path);

    this.downloadingId = null;

    if (!url) {
      this.downloadError = 'Could not open this document. Please try again.';
      return;
    }

    window.open(url, '_blank');
  }
}