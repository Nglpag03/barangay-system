import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
export class UserRequestsPage implements OnInit {

  requests: ResidentRequest[] = [];
  loading = true;

  constructor(
    private readonly requestService: RequestService
  ) {}

  async ngOnInit() {
    this.requests = await this.requestService.getMyRequests();
    this.loading = false;
  }
}