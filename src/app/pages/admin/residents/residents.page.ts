import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  IonSearchbar,
  IonButton
} from '@ionic/angular/standalone';

import { ResidentService } from '../../../core/services/resident.service';
import { Resident } from '../../../core/model/resident.model';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-admin-residents',
  templateUrl: './residents.page.html',
  styleUrls: ['./residents.page.scss'],
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonLabel,
    IonBackButton,
    IonButtons,
    IonSearchbar,
    IonButton
  ]
})
export class ResidentsPage implements OnInit, ViewWillEnter {

  residents: Resident[] = [];
  filteredResidents: Resident[] = [];
  loading = true;
  loadError = false;
  searchTerm = '';

  constructor(
    private readonly residentService: ResidentService
  ) {}

  async ngOnInit() {
    await this.loadResidents();
  }

  async ionViewWillEnter() {
    await this.loadResidents();
  }

  async loadResidents() {
    this.loading = true;
    this.loadError = false;

    try {
      this.residents = await this.residentService.getAllResidents();
      this.filteredResidents = this.residents;
    } catch (err) {
      console.error('Failed to load residents:', err);
      this.loadError = true;
    } finally {
      this.loading = false;
    }
  }

  onSearchChange(event: any) {
    const term = (event.detail.value ?? '').trim().toLowerCase();

    if (!term) {
      this.filteredResidents = this.residents;
      return;
    }

    this.filteredResidents = this.residents.filter((resident) => {
      const fullName = `${resident.first_name} ${resident.middle_name ?? ''} ${resident.last_name}`.toLowerCase();
      return (
        fullName.includes(term) ||
        resident.resident_number.toLowerCase().includes(term)
      );
    });
  }
}