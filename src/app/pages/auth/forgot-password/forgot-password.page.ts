import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
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
export class ForgotPasswordPage {

  email = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly authService: AuthService
  ) {}

  get isEmailValid(): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(this.email.trim());
  }

  async submit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.isEmailValid) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    this.loading = true;

    const { error } = await this.authService.resetPasswordForEmail(this.email.trim());

    this.loading = false;

    // Deliberately show the same success message whether or not the email
    // actually exists in the system — this prevents someone from using this
    // form to check which email addresses have accounts (a real privacy
    // consideration, not just a technicality).
    if (error) {
      console.error('Password reset error:', error);
    }

    this.successMessage = 'If an account exists with that email, a password reset link has been sent.';
  }
}