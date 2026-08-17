import { Component } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton
} from '@ionic/angular/standalone';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton
  ]
})
export class AdminDashboardPage {

  constructor(
    private readonly authService: AuthService
  ) {}

  async logout() {
    const { error } = await this.authService.signOut();

    if (error) {
      console.error('Logout error:', error);
      return;
    }

    console.log('Logged out');
  }
}