import { Component, OnInit } from '@angular/core';
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
  IonInput,
  IonBackButton,
  IonButtons
} from '@ionic/angular/standalone';

import { ResidentService } from '../../../core/services/resident.service';
import { Resident } from '../../../core/model/resident.model';
import { Household } from '../../../core/model/household.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
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
    IonInput,
    IonBackButton,
    IonButtons
  ]
})
export class ProfilePage implements OnInit {

  resident: Resident | null = null;
  household: Household | null = null;
  loading = true;
  saving = false;

  contactNumber = '';
  occupation = '';

  saveError: string | null = null;
  saveSuccess = false;

  constructor(
    private readonly residentService: ResidentService,
    private readonly router: Router
  ) {}

  async ngOnInit() {
    this.resident = await this.residentService.getMyResidentRecord();

    if (this.resident) {
      this.contactNumber = this.resident.contact_number ?? '';
      this.occupation = this.resident.occupation ?? '';
      this.household = await this.residentService.getMyHousehold();
    }

    this.loading = false;
  }

  async save() {
    this.saving = true;
    this.saveError = null;
    this.saveSuccess = false;

    const updated = await this.residentService.updateMyResidentRecord({
      contact_number: this.contactNumber || null,
      occupation: this.occupation || null
    });

    this.saving = false;

    if (!updated) {
      this.saveError = 'Something went wrong while saving. Please try again.';
      return;
    }

    this.resident = updated;
    this.saveSuccess = true;
  }
}