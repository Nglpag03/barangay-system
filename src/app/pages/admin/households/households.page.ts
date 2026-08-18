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
export class HouseholdsPage implements OnInit {

  households: Household[] = [];
  loading = true;

  constructor(
    private readonly householdService: HouseholdService
  ) {}

  async ngOnInit() {
    this.households = await this.householdService.getAllHouseholds();
    this.loading = false;
  }
}