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
  IonBadge,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonButton
} from '@ionic/angular/standalone';

import { RequestService } from '../../../core/services/request.service';
import { ResidentService } from '../../../core/services/resident.service';
import { ResidentRequest, RequestStatus } from '../../../core/model/request.model';
import { Resident } from '../../../core/model/resident.model';

@Component({
  selector: 'app-admin-requests',
  templateUrl: './requests.page.html',
  styleUrls: ['./requests.page.scss'],
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
    IonBadge,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonButton
  ]
})
export class AdminRequestsPage implements OnInit {

  requests: ResidentRequest[] = [];
  residentsById: Map<string, Resident> = new Map();
  loading = true;
  savingId: string | null = null;

  // Local editable state per request, keyed by request id
  statusDrafts: Record<string, RequestStatus> = {};
  remarksDrafts: Record<string, string> = {};

  constructor(
    private readonly requestService: RequestService,
    private readonly residentService: ResidentService
  ) {}

  async ngOnInit() {
    const [requests, residents] = await Promise.all([
      this.requestService.getAllRequests(),
      this.residentService.getAllResidents()
    ]);

    this.requests = requests;
    this.residentsById = new Map(residents.map((r) => [r.id, r]));

    for (const request of requests) {
      this.statusDrafts[request.id] = request.status;
      this.remarksDrafts[request.id] = request.remarks ?? '';
    }

    this.loading = false;
  }

  getResidentName(residentId: string): string {
    const resident = this.residentsById.get(residentId);
    return resident ? `${resident.first_name} ${resident.last_name}` : 'Unknown Resident';
  }

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
      const index = this.requests.findIndex((r) => r.id === request.id);
      if (index !== -1) {
        this.requests[index] = updated;
      }
    }
  }
}