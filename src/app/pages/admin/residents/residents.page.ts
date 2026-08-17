import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  IonSearchbar
} from '@ionic/angular/standalone';

import { ResidentService } from '../../../core/services/resident.service';
import { Resident } from '../../../core/model/resident.model';

@Component({
  selector: 'app-admin-residents',
  templateUrl: './residents.page.html',
  styleUrls: ['./residents.page.scss'],
  imports: [
    CommonModule,
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
    IonSearchbar
  ]
})
export class ResidentsPage implements OnInit {

  residents: Resident[] = [];
  filteredResidents: Resident[] = [];
  loading = true;
  searchTerm = '';

  constructor(
    private readonly residentService: ResidentService
  ) {}

async ngOnInit() {
  this.residents = await this.residentService.getAllResidents();
  this.filteredResidents = this.residents;
  this.loading = false;
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