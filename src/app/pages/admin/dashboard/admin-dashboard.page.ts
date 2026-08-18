import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton
} from '@ionic/angular/standalone';

import { AuthService } from '../../../core/services/auth.service';
import {Router} from '@angular/router';
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  imports: [
    RouterLink,
    Router,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton
  ]
})
export class AdminDashboardPage {

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  async logout() {
     await this.authService.signOut();
    await this.router.navigate(['/login']);
  }
}