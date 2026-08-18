import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
export class UserDocumentsPage implements OnInit {

  documents: ResidentDocument[] = [];
  loading = true;
  downloadingId: string | null = null;

  constructor(
    private readonly documentService: DocumentService
  ) {}

  async ngOnInit() {
    this.documents = await this.documentService.getMyDocuments();
    this.loading = false;
  }

  async download(document: ResidentDocument) {
    if (!document.file_path) {
      return;
    }

    this.downloadingId = document.id;

    const url = await this.documentService.getDocumentDownloadUrl(document.file_path);

    this.downloadingId = null;

    if (url) {
      window.open(url, '_blank');
    }
  }
}