import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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

import { RequestService } from '../../../core/services/request.service';
import { ResidentRequest } from '../../../core/model/request.model';

@Component({
  selector: 'app-user-requests',
  templateUrl: './requests.page.html',
  styleUrls: ['./requests.page.scss'],
  imports: [
    CommonModule,
    RouterLink,
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
export class UserRequestsPage implements OnInit, ViewWillEnter {

  requests: ResidentRequest[] = [];
  loading = true;
  loadError = false;

  constructor(
    private readonly requestService: RequestService
  ) {}

  async ngOnInit() {
    await this.loadRequests();
  }

  async ionViewWillEnter() {
    await this.loadRequests();
  }

  async loadRequests() {
    this.loading = true;
    this.loadError = false;

    try {
      this.requests = await this.requestService.getMyRequests();
    } catch (err) {
      console.error('Failed to load requests:', err);
      this.loadError = true;
    } finally {
      this.loading = false;
    }
  }
}