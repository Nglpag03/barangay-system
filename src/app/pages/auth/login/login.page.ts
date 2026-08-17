import { Component } from '@angular/core';
import {
  IonContent,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonSpinner
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    FormsModule,
    IonContent,
    IonInput,
    IonButton,
    IonItem,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonText,
    IonSpinner
  ]
})
export class LoginPage {

  email = '';
  password = '';

  loading = false;
  errorMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  async login() {

    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }

    this.loading = true;

    const { data, error } =
      await this.authService.signIn(
        this.email,
        this.password
      );

    this.loading = false;

  if (error) {
  console.error('Login error:', error);

  this.errorMessage = 'Invalid email or password.';
  return;
}

console.log('Successfully logged in:', data.user);
const profile = await this.authService.getCurrentProfile();

console.log('Current profile:', profile);

if (!profile) {
  this.errorMessage = 'Unable to load your user profile.';
  return;
}

if (!profile.is_active) {
  await this.authService.signOut();
  this.errorMessage = 'Your account is inactive.';
  return;
}

if (profile.role === 'admin') {
  await this.router.navigate(['/admin/dashboard']);
  return;
}

if (profile.role === 'resident') {
  await this.router.navigate(['/user/dashboard']);
  return;
}

await this.authService.signOut();

this.errorMessage = 'Your account has an invalid role.';
  }
}