import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, homeOutline, locationOutline,
  alertCircleOutline, checkmarkCircleOutline, checkmarkOutline,
} from 'ionicons/icons';

import { HouseholdService } from '../../../../core/services/household.service';
import { ToastController } from '@ionic/angular/standalone';
import { AuditLogService } from '../../../../core/services/audit-log.service';

@Component({
  selector: 'app-household-detail',
  templateUrl: './household-detail.page.html',
  styleUrls: ['./household-detail.page.scss'],
  standalone: true,   
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
    IonSpinner
  ]
})
export class HouseholdDetailPage implements OnInit {

  isNew = false;
  loading = true;
  saving = false;

  householdNumber = '';
  houseNumber = '';
  street = '';
  purok = '';
  barangay = '';
  municipality = '';
  province = '';

  saveError: string | null = null;
  saveSuccess = false;
  touched: Record<string, boolean> = {};

  private householdNumberTaken = false;
  private householdId: string | null = null;
  private duplicateCheckTimer: any = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly householdService: HouseholdService,
    private readonly auditLogService: AuditLogService,
    private readonly toastCtrl: ToastController
  ) {
    addIcons({
      arrowBackOutline, homeOutline, locationOutline,
      alertCircleOutline, checkmarkCircleOutline, checkmarkOutline
    });
  }

  async ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');

  if (!idParam || idParam === 'new' || idParam === 'add') {
    this.isNew = true;
    this.loading = false;
    return;
  }

  this.householdId = idParam;

  try{
    const household = await this.householdService.getHouseholdById(this.householdId);

    if (household) {
      this.householdNumber = household.household_number;
      this.houseNumber = household.house_number ?? '';
      this.street = household.street ?? '';
      this.purok = household.purok;
      this.barangay = household.barangay;
      this.municipality = household.municipality;
      this.province = household.province;
    }
  } catch (err) {
    console.error('Failed to load household:', err);
    this.saveError = 'Failed to load household data.';
  } finally {
    this.loading = false;
  }
  }

  goBack() {
    this.router.navigate(['/admin/households']);
  }

async save() {
    const fieldsToCheck = [
    'householdNumber', 'purok', 'barangay',
    'municipality', 'province', 'houseNumber', 'street'
  ];

  // Mark everything touched so the errors show
  fieldsToCheck.forEach(f => this.touched[f] = true);

  const firstError = fieldsToCheck
    .map(f => ({ field: f, err: this.validateField(f) }))
    .find(x => x.err);

  if (firstError) {
    this.saveError = firstError.err!;
    this.showToast(firstError.err!, 'danger');
    return;
  }

  this.saving = true;
  this.saveError = null;
  this.saveSuccess = false;

  const payload = {
    household_number: this.householdNumber,
    house_number: this.houseNumber || null,
    street: this.street || null,
    purok: this.purok,
    barangay: this.barangay,
    municipality: this.municipality,
    province: this.province
  };

// ─── CREATE ───
if (this.isNew) {
  const created = await this.householdService.createHousehold(payload);
  this.saving = false;

  if (!created) {
    this.saveError = 'Something went wrong while creating the household.';
    this.showToast('Failed to create household', 'danger');
    return;
  }

  await this.auditLogService.logAction('created', 'household', created.id, {
    household_number: created.household_number
  });

  await this.showToast('Household created successfully', 'success');

  // ✅ Clear the form — stay on the same page
  this.resetForm();
  return;
}

  // ─── UPDATE ───
  if (!this.householdId) {
    this.saving = false;
    return;
  }

  const updated = await this.householdService.updateHousehold(this.householdId, payload);
  this.saving = false;

  if (!updated) {
    this.saveError = 'Something went wrong while saving.';
    this.showToast('Failed to save changes', 'danger');
    return;
  }

  await this.auditLogService.logAction('updated', 'household', updated.id, {
    household_number: updated.household_number
  });

  this.saveSuccess = true;
  this.showToast('Household updated successfully', 'success');
}

// ✅ Helper for toasts
private async showToast(message: string, color: 'success' | 'danger') {
  const toast = await this.toastCtrl.create({
    message,
    duration: 2500,
    color,
    position: 'top',
    icon: color === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline'
  });
  await toast.present();
}


get isFormValid(): boolean {
  return (
    !this.validateField('householdNumber') &&
    !this.validateField('purok') &&
    !this.validateField('barangay') &&
    !this.validateField('municipality') &&
    !this.validateField('province') &&
    !this.validateField('houseNumber') &&
    !this.validateField('street')
  );
}

private resetForm() {
  this.householdNumber = '';
  this.houseNumber = '';
  this.street = '';
  this.purok = '';
  this.barangay = '';
  this.municipality = '';
  this.province = '';

  this.saveError = null;
  this.saveSuccess = false;
  this.touched = {};
  this.householdNumberTaken = false;
}

validateField(field: string): string | null {
  const v = (this as any)[field]?.toString().trim() ?? '';

  switch (field) {
case 'householdNumber': {
  if (!v) return 'Household number is required.';
  if (v.length < 3) return 'Household number must be at least 3 characters.';
  if (v.length > 30) return 'Household number is too long (max 30 characters).';
  if (this.householdNumberTaken)
    return 'This household number is already in use.';
  return null;
}
    case 'purok': {
      if (!v) return 'Purok is required.';
      if (v.length < 2) return 'Purok must be at least 2 characters.';
      if (!/^[A-Za-z0-9\s]+$/.test(v))
        return 'Purok can only contain letters, numbers, and spaces.';
      return null;
    }
    case 'barangay': {
      if (!v) return 'Barangay is required.';
      if (v.length < 2) return 'Barangay must be at least 2 characters.';
      return null;
    }
    case 'municipality': {
      if (!v) return 'Municipality is required.';
      if (v.length < 2) return 'Municipality must be at least 2 characters.';
      return null;
    }
    case 'province': {
      if (!v) return 'Province is required.';
      if (v.length < 2) return 'Province must be at least 2 characters.';
      return null;
    }
    case 'houseNumber': {
      if (!v) return null; // optional
      if (v.length > 10) return 'House number is too long (max 10 characters).';
      if (!/^[A-Za-z0-9\-]+$/.test(v))
        return 'House number can only contain letters, numbers, and dashes.';
      return null;
    }
    case 'street': {
      if (!v) return null; // optional
      if (v.length < 2) return 'Street name must be at least 2 characters.';
      if (v.length > 80) return 'Street name is too long (max 80 characters).';
      return null;
    }
    default:
      return null;
  }
}

markTouched(field: string) {
  this.touched[field] = true;
}

fieldError(field: string): string | null {
  if (!this.touched[field]) return null;
  return this.validateField(field);
}

async checkHouseholdNumberDuplicate() {
  const v = this.householdNumber.trim();

  if (!v) {
    this.householdNumberTaken = false;
    return;
  }

  const dup = await this.householdService.findByHouseholdNumber(
    v,
    this.isNew ? undefined : this.householdId ?? undefined
  );

  this.householdNumberTaken = !!dup;
}
  onHouseholdNumberInput() {
  this.householdNumber = this.householdNumber.toUpperCase();
  clearTimeout(this.duplicateCheckTimer);  
  this.duplicateCheckTimer = setTimeout(() => {
    this.checkHouseholdNumberDuplicate();
  }, 400);
}
}