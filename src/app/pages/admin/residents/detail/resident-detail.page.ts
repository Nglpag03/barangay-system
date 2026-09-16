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
import { HouseholdService } from '../../../../core/services/household.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Resident, Sex, CivilStatus } from '../../../../core/model/resident.model';
import { Household } from '../../../../core/model/household.model';
import { AuditLogService } from '../../../../core/services/audit-log.service';
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
  households: Household[] = [];
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
  householdId: string | null = null;

  saveError: string | null = null;
  saveSuccess = false;

  // Account creation state
  accountEmail = '';
  accountPassword = '';
  creatingAccount = false;
  accountError: string | null = null;
  createdCredentials: { email: string; password: string } | null = null;

  private residentId: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly residentService: ResidentService,
    private readonly householdService: HouseholdService,
    private readonly authService: AuthService,
    private readonly auditLogService: AuditLogService
  ) {}

  async ngOnInit() {
    this.households = await this.householdService.getAllHouseholds();

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
      this.householdId = this.resident.household_id;
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
      is_active: this.isActive,
      household_id: this.householdId
    };

    if (this.isNew) {
      const created = await this.residentService.createResident({
        ...payload,
        profile_id: null
      });

      this.saving = false;

      if (!created) {
        this.saveError = 'Something went wrong while creating the resident.';
        return;
      }

      await this.auditLogService.logAction('created', 'resident', created.id, {
        resident_number: created.resident_number,
        name: `${created.first_name} ${created.last_name}`
      });

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

    await this.auditLogService.logAction('updated', 'resident', updated.id, {
      resident_number: updated.resident_number,
      name: `${updated.first_name} ${updated.last_name}`
    });

    this.resident = updated;
    this.saveSuccess = true;
  }

  get isFormValid(): boolean {
    return !!(
      this.residentNumber.trim() &&
      this.firstName.trim() &&
      this.lastName.trim() &&
      this.birthDate &&
      this.sex &&
      this.civilStatus
    );
  }

  generatePassword() {
    // A simple, readable-enough random password — staff can also just
    // type their own if they prefer.
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.accountPassword = result;
  }

  get isAccountFormValid(): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(this.accountEmail.trim()) && this.accountPassword.length >= 6;
  }

  async createAccount() {
    if (!this.resident || !this.residentId) {
      return;
    }

    this.creatingAccount = true;
    this.accountError = null;

    const fullName = `${this.resident.first_name} ${this.resident.last_name}`;

    const result = await this.authService.createResidentAccount(
      this.accountEmail.trim(),
      this.accountPassword,
      this.residentId,
      fullName
    );

    this.creatingAccount = false;

    if (!result.success) {
      this.accountError = result.error ?? 'Something went wrong creating the account.';
      return;
    }

    this.createdCredentials = {
      email: this.accountEmail.trim(),
      password: this.accountPassword
    };

    await this.auditLogService.logAction('created_account', 'resident', this.residentId, {
      email: this.accountEmail.trim()
    });

    // Refresh the resident record so profile_id now shows as linked
    this.resident = await this.residentService.getResidentById(this.residentId);
  }
}