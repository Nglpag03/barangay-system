import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonBackButton,
  IonButtons,
  IonCheckbox
} from '@ionic/angular/standalone';

import { ResidentService } from '../../../../core/services/resident.service';
import { Resident, Sex, CivilStatus } from '../../../../core/model/resident.model';

@Component({
  selector: 'app-resident-detail',
  templateUrl: './resident-detail.page.html',
  styleUrls: ['./resident-detail.page.scss'],
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
    IonSelect,
    IonSelectOption,
    IonBackButton,
    IonButtons,
    IonCheckbox
  ]
})
export class ResidentDetailPage implements OnInit {

  resident: Resident | null = null;
  loading = true;
  saving = false;

  // Editable form fields (mirrors the resident record, admin can edit all of these)
  firstName = '';
  middleName = '';
  lastName = '';
  suffix = '';
  birthDate = '';
  birthPlace = '';
  sex: Sex = 'male';
  civilStatus: CivilStatus = 'single';
  contactNumber = '';
  occupation = '';
  isActive = true;

  saveError: string | null = null;
  saveSuccess = false;

  private residentId: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly residentService: ResidentService
  ) {}

  async ngOnInit() {
    this.residentId = this.route.snapshot.paramMap.get('id');

    if (!this.residentId) {
      this.loading = false;
      return;
    }

    this.resident = await this.residentService.getResidentById(this.residentId);

    if (this.resident) {
      this.firstName = this.resident.first_name;
      this.middleName = this.resident.middle_name ?? '';
      this.lastName = this.resident.last_name;
      this.suffix = this.resident.suffix ?? '';
      this.birthDate = this.resident.birth_date;
      this.birthPlace = this.resident.birth_place ?? '';
      this.sex = this.resident.sex;
      this.civilStatus = this.resident.civil_status;
      this.contactNumber = this.resident.contact_number ?? '';
      this.occupation = this.resident.occupation ?? '';
      this.isActive = this.resident.is_active;
    }

    this.loading = false;
  }

  async save() {
    if (!this.residentId) {
      return;
    }

    this.saving = true;
    this.saveError = null;
    this.saveSuccess = false;

    const updated = await this.residentService.updateResidentAsAdmin(this.residentId, {
      first_name: this.firstName,
      middle_name: this.middleName || null,
      last_name: this.lastName,
      suffix: this.suffix || null,
      birth_date: this.birthDate,
      birth_place: this.birthPlace || null,
      sex: this.sex,
      civil_status: this.civilStatus,
      contact_number: this.contactNumber || null,
      occupation: this.occupation || null,
      is_active: this.isActive
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