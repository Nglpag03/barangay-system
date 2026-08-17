import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonLabel,
  IonBackButton,
  IonButtons
} from '@ionic/angular/standalone';

import { ResidentService } from '../../../core/services/resident.service';
import { Resident } from '../../../core/model/resident.model';

@Component({
  selector: 'app-admin-residents',
  templateUrl: './residents.page.html',
  styleUrls: ['./residents.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonLabel,
    IonBackButton,
    IonButtons
  ]
})
export class ResidentsPage implements OnInit {

  residents: Resident[] = [];
  loading = true;

  constructor(
    private readonly residentService: ResidentService
  ) {}

  async ngOnInit() {
    this.residents = await this.residentService.getAllResidents();
    this.loading = false;
  }
}