import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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

  isNew = false;
  resident: Resident | null = null;
  loading = true;
  saving = false;

  residentNumber = '';
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
    private readonly router: Router,
    private readonly residentService: ResidentService
  ) {}

  async ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam || idParam === 'new') {
      this.isNew = true;
      this.loading = false;
      return;
    }

    this.residentId = idParam;
    this.resident = await this.residentService.getResidentById(this.residentId);

    if (this.resident) {
      this.residentNumber = this.resident.resident_number;
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
    this.saving = true;
    this.saveError = null;
    this.saveSuccess = false;

    const payload = {
      resident_number: this.residentNumber,
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
    };

    if (this.isNew) {
      const created = await this.residentService.createResident({
        ...payload,
        profile_id: null,
        household_id: null
      });

      this.saving = false;

      if (!created) {
        this.saveError = 'Something went wrong while creating the resident.';
        return;
      }

      this.router.navigate(['/admin/residents', created.id]);
      return;
    }

    if (!this.residentId) {
      this.saving = false;
      return;
    }

    const updated = await this.residentService.updateResidentAsAdmin(this.residentId, payload);

    this.saving = false;

    if (!updated) {
      this.saveError = 'Something went wrong while saving.';
      return;
    }

    this.resident = updated;
    this.saveSuccess = true;
  }
}