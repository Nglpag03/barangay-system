import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
import { Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  imports: [
    CommonModule,
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
    IonSpinner,
    RouterLink
  ]
})
export class ResetPasswordPage implements OnInit {

  newPassword = '';
  confirmPassword = '';

  loading = false;
  errorMessage = '';
  successMessage = '';

  hasValidSession = false;
  checkingSession = true;

  showNewPassword = false;
showConfirmPassword = false;

toggleNewPassword() {
  this.showNewPassword = !this.showNewPassword;
}

toggleConfirmPassword() {
  this.showConfirmPassword = !this.showConfirmPassword;
}

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  async ngOnInit() {
    // When the resident clicks the reset link in their email, Supabase
    // automatically exchanges it for a temporary "recovery" session behind
    // the scenes. We check that a session actually exists before letting
    // them set a new password — if they land here without a valid link
    // (e.g. an expired or already-used link), we show an error instead.
    const session = await this.authService.getSession();
    this.hasValidSession = !!session;
    this.checkingSession = false;
  }

  get isFormValid(): boolean {
    return (
      this.newPassword.length >= 6 &&
      this.newPassword === this.confirmPassword
    );
  }

  async submit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.newPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loading = true;

    const { error } = await this.authService.updatePassword(this.newPassword);

    this.loading = false;

    if (error) {
      console.error('Password update error:', error);
      this.errorMessage = 'Something went wrong. Please request a new reset link and try again.';
      return;
    }

    this.successMessage = 'Your password has been updated. Redirecting to login...';

    // Sign out afterward so they log in fresh with their new password,
    // rather than staying in this temporary recovery session.
    await this.authService.signOut();

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2000);
  }
}