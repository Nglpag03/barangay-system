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
  IonButton
} from '@ionic/angular/standalone';

import { HouseholdService } from '../../../core/services/household.service';
import { Household } from '../../../core/model/household.model';

@Component({
  selector: 'app-admin-households',
  templateUrl: './households.page.html',
  styleUrls: ['./households.page.scss'],
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
    IonButton
  ]
})
export class HouseholdsPage implements OnInit, ViewWillEnter {

  households: Household[] = [];
  loading = true;
  loadError = false;

  constructor(
    private readonly householdService: HouseholdService
  ) {}

  async ngOnInit() {
    await this.loadHouseholds();
  }

  async ionViewWillEnter() {
    await this.loadHouseholds();
  }

  async loadHouseholds() {
    this.loading = true;
    this.loadError = false;

    try {
      this.households = await this.householdService.getAllHouseholds();
    } catch (err) {
      console.error('Failed to load households:', err);
      this.loadError = true;
    } finally {
      this.loading = false;
    }
  }
}