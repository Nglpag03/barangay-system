import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonBackButton,
  IonButtons
} from '@ionic/angular/standalone';

import { RequestService } from '../../../../core/services/request.service';
import { RequestType } from '../../../../core/model/request.model';

@Component({
  selector: 'app-new-request',
  templateUrl: './new-request.page.html',
  styleUrls: ['./new-request.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonBackButton,
    IonButtons
  ]
})
export class NewRequestPage {

  requestType: RequestType | null = null;
  purpose = '';
  saving = false;
  saveError: string | null = null;

  constructor(
    private readonly requestService: RequestService,
    private readonly router: Router
  ) {}

  async submit() {
    if (!this.requestType) {
      this.saveError = 'Please select a request type.';
      return;
    }

    this.saving = true;
    this.saveError = null;

    const created = await this.requestService.createRequest(
      this.requestType,
      this.purpose || null
    );

    this.saving = false;

    if (!created) {
      this.saveError = 'Something went wrong while submitting your request. Please try again.';
      return;
    }

    this.router.navigate(['/user/requests']);
  }
}