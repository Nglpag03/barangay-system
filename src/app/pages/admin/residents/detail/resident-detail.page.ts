import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';

import {
  arrowBackOutline,
  personOutline,
  personAddOutline,
  calendarOutline,
  callOutline,
  saveOutline,
  keyOutline,                    
  checkmarkCircleOutline,        
  refreshOutline,
} from 'ionicons/icons';

import { ResidentService } from '../../../../core/services/resident.service';
import { HouseholdService } from '../../../../core/services/household.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AuditLogService } from '../../../../core/services/audit-log.service';
import { AccountModalService } from '../../../../core/services/account-modal.service';

import { Resident, Sex, CivilStatus } from '../../../../core/model/resident.model';
import { Household } from '../../../../core/model/household.model';

@Component({
  selector: 'app-resident-detail',
  templateUrl: './resident-detail.page.html',
  styleUrls: ['./resident-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonIcon
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

    // Portal account state (edit mode)
  accountEmail = '';
  accountPassword = '';
  creatingAccount = false;
  accountError: string | null = null;

  touchedFields: Set<string> = new Set();

  private pendingResidentId: string | null = null;
  private residentId: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly residentService: ResidentService,
    private readonly householdService: HouseholdService,
    private readonly authService: AuthService,
    private readonly auditLogService: AuditLogService,
    private readonly accountModal: AccountModalService
  ) {
    addIcons({
      'arrow-back-outline': arrowBackOutline,
      'person-outline': personOutline,
      'person-add-outline': personAddOutline,
      'calendar-outline': calendarOutline,
      'call-outline': callOutline,
      'save-outline': saveOutline,
      'key-outline': keyOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'refresh-outline': refreshOutline,
    });
  }

  async ngOnInit() {
    this.households = await this.householdService.getAllHouseholds();

    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam || idParam === 'new' || idParam === 'register') {
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

  markTouched(fieldName: string) {
  this.touchedFields.add(fieldName);
}
hasError(fieldName: string, value: string | null | undefined): boolean {
  return this.touchedFields.has(fieldName) && !value?.trim();
}
get missingRequiredFields(): string[] {
  const missing: string[] = [];

  if (!this.residentNumber?.trim()) missing.push('Resident Number');
  if (!this.firstName?.trim())      missing.push('First Name');
  if (!this.lastName?.trim())       missing.push('Last Name');
  if (!this.birthDate)              missing.push('Birth Date');
  if (!this.sex)                    missing.push('Sex');
  if (!this.civilStatus)            missing.push('Civil Status');

  return missing;
}

async save() {
  this.saveError = null;
  this.saveSuccess = false;

  // ─── Validate required fields ───
  if (this.isNew) {
    const missing = this.missingRequiredFields;

    if (missing.length > 0) {
      // Mark all required fields as touched so they visually highlight
      this.markTouched('residentNumber');
      this.markTouched('firstName');
      this.markTouched('lastName');
      this.markTouched('birthDate');
      this.markTouched('sex');
      this.markTouched('civilStatus');

      this.saveError = `Please fill out the required fields: ${missing.join(', ')}.`;
      return;
    }

    this.accountModal.open();
    this.accountModal.onCreateAccount = async () => {
      await this.createAccountAndResident();
    };
    return;
  }

  // EDIT MODE
  if (!this.residentId) return;

  // Also validate for edit
  const missing = this.missingRequiredFields;
  if (missing.length > 0) {
    this.markTouched('residentNumber');
    this.markTouched('firstName');
    this.markTouched('lastName');
    this.markTouched('birthDate');
    this.markTouched('sex');
    this.markTouched('civilStatus');

    this.saveError = `Please fill out the required fields: ${missing.join(', ')}.`;
    return;
  }

  this.saving = true;
}
  get isAccountFormValid(): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(this.accountEmail.trim())
      && this.accountPassword.length >= 6;
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
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  this.accountPassword = result;
}
async createAccountForExistingResident() {
  if (!this.residentId || !this.resident) return;

  if (!this.isAccountFormValid) {
    this.accountError = 'Please provide a valid email and password (min 6 chars).';
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
    this.accountError = result.error ?? 'Failed to create account.';
    return;
  }

  await this.auditLogService.logAction('created_account', 'resident', this.residentId, {
    email: this.accountEmail.trim(),
  });

  // Refresh resident so profile_id is set — the card flips to "Account linked"
  this.resident = await this.residentService.getResidentById(this.residentId);
  this.accountEmail = '';
  this.accountPassword = '';
}
  /**
   * Called from the modal's "Create Account" button.
   * Order of operations:
   *   1. Create auth user + profile (auth.service)
   *   2. Save resident with profile_id = new auth userId
   */
  async createAccountAndResident() {
    // ─── Validate ───
    if (!this.isFormValid) {
      this.accountModal.error.set('Please fill out all required resident fields.');
      return;
    }
    if (!this.accountModal.isFormValid) {              // ← FIX: use service getter
      this.accountModal.error.set('Please provide a valid email and password (min 6 chars).');
      return;
    }

    this.accountModal.creating.set(true);
    this.accountModal.error.set(null);

    // ─── STEP 1: Create the auth user ───
    const fullName = `${this.firstName.trim()} ${this.lastName.trim()}`;
    const email = this.accountModal.email().trim();
    const password = this.accountModal.password();

    const authResult = await this.authService.createAuthAccount(email, password, fullName);

    if (!authResult.success || !authResult.userId) {
      this.accountModal.creating.set(false);
      this.accountModal.error.set(authResult.error ?? 'Failed to create login account.');
      return;
    }

    const newUserId = authResult.userId;

    // ─── STEP 2: Save the resident with profile_id ───
    const basePayload = {
      resident_number: this.residentNumber.trim(),
      first_name: this.firstName.trim(),
      middle_name: this.middleName?.trim() || null,
      last_name: this.lastName.trim(),
      suffix: this.suffix?.trim() || null,
      birth_date: this.birthDate,
      birth_place: this.birthPlace?.trim() || null,
      sex: this.sex,
      civil_status: this.civilStatus,
      contact_number: this.normalizePhoneNumber(this.contactNumber) || null,
      occupation: this.occupation?.trim() || null,
      is_active: this.isActive,
      household_id: this.householdId || null,
      profile_id: newUserId,
    };

    const created = await this.residentService.createResident(basePayload);

    // ─── STEP 3: Handle failure ───
    if (!created) {
      this.accountModal.creating.set(false);
      this.accountModal.error.set(
        'Login was created but the resident record failed to save. The account is orphaned — please contact support to resolve.'
      );
      return;
    }

    // ─── SUCCESS ───
    this.resident = created;
    this.pendingResidentId = created.id;

    await this.auditLogService.logAction('created', 'resident', created.id, {
      resident_number: created.resident_number,
      name: `${created.first_name} ${created.last_name}`,
      with_account: true,
    });

    this.accountModal.credentials.set({ email, password });
    this.accountModal.creating.set(false);
  }

  /**
 * Validates any international phone number.
 * Accepts: digits, spaces, dashes, parentheses, dots, and a leading +.
 * Requires: 7–15 digits total.
 */
isPhoneValid(input: string | null | undefined): boolean {
  if (!input || !input.trim()) return true; // optional

  // Only allow these characters
  const allowedPattern = /^[\d\s\-()+.]*$/;
  if (!allowedPattern.test(input.trim())) return false;

  // Must have between 7 and 15 digits
  const digits = input.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) return false;

  return true;
}

/**
 * Public getter for the template.
 */
get phoneHasError(): boolean {
  if (!this.touchedFields.has('contactNumber')) return false;
  if (!this.contactNumber?.trim()) return false;
  return !this.isPhoneValid(this.contactNumber);
}

/**
 * Marks the phone field as touched on blur.
 */
onPhoneBlur() {
  this.markTouched('contactNumber');
}

/**
 * Filters invalid characters as the user types.
 * Keeps: digits, spaces, +, -, (, ), .
 */
onPhoneInput(event: any) {
  let value = event.target.value ?? '';
  value = value.replace(/[^\d\s+\-().]/g, '');
  event.target.value = value;
  this.contactNumber = value;
}

/**
 * Trims the phone number before saving.
 */
normalizePhoneNumber(input: string | null | undefined): string | null {
  if (!input || !input.trim()) return null;
  return input.trim();
}
}