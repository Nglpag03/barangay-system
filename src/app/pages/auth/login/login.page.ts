import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  IonContent
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    RouterLink
  ]
})
export class LoginPage {

  email = '';
  password = '';

  loading = false;
  errorMessage = '';

  showPassword = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  get isFormValid(): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return (
      emailPattern.test(this.email.trim()) &&
      this.password.length > 0
    );
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async login() {

    this.errorMessage = '';

    if (!this.isFormValid) {
      this.errorMessage =
        'Please enter a valid email and password.';
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

      this.errorMessage =
        'Invalid email or password.';

      return;
    }

    const profile =
      await this.authService.getCurrentProfile();

    if (!profile) {
      this.errorMessage =
        'Unable to load your user profile.';

      return;
    }

    if (!profile.is_active) {

      await this.authService.signOut();

      this.errorMessage =
        'Your account is inactive.';

      return;
    }

    if (profile.role === 'admin') {

      await this.router.navigate([
        '/admin/dashboard'
      ]);

      return;
    }

    if (profile.role === 'resident') {

      await this.router.navigate([
        '/user/dashboard'
      ]);

      return;
    }

    await this.authService.signOut();

    this.errorMessage =
      'Your account has an invalid role.';
  }
}