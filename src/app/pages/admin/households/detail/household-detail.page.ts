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
  IonBackButton,
  IonButtons
} from '@ionic/angular/standalone';

import { HouseholdService } from '../../../../core/services/household.service';
import { Household } from '../../../../core/model/household.model';

@Component({
  selector: 'app-household-detail',
  templateUrl: './household-detail.page.html',
  styleUrls: ['./household-detail.page.scss'],
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

  private householdId: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly householdService: HouseholdService
  ) {}

  async ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam || idParam === 'new') {
      this.isNew = true;
      this.loading = false;
      return;
    }

    this.householdId = idParam;

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

    this.loading = false;
  }

  async save() {
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

    if (this.isNew) {
      const created = await this.householdService.createHousehold(payload);

      this.saving = false;

      if (!created) {
        this.saveError = 'Something went wrong while creating the household.';
        return;
      }

      // Redirect to the new household's own detail page after creation
      this.router.navigate(['/admin/households', created.id]);
      return;
    }

    if (!this.householdId) {
      this.saving = false;
      return;
    }

    const updated = await this.householdService.updateHousehold(this.householdId, payload);

    this.saving = false;

    if (!updated) {
      this.saveError = 'Something went wrong while saving.';
      return;
    }

    this.saveSuccess = true;
  }
}