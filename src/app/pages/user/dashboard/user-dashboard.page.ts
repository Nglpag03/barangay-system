import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton
} from '@ionic/angular/standalone';

import { AuthService } from '../../../core/services/auth.service';
import { ResidentService } from '../../../core/services/resident.service';
import { RequestService } from '../../../core/services/request.service';
import { Resident } from '../../../core/model/resident.model';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.page.html',
  styleUrls: ['./user-dashboard.page.scss'],
  imports: [
    CommonModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton
  ]
})
export class UserDashboardPage implements OnInit {

  resident: Resident | null = null;
  loading = true;

  constructor(
    private readonly authService: AuthService,
    private readonly residentService: ResidentService,
    private readonly router: Router
  ) {}

  async ngOnInit() {
    this.resident = await this.residentService.getMyResidentRecord();
    this.loading = false;
  }

  async logout() {
    await this.authService.signOut();
    await this.router.navigate(['/login']);
  }
}