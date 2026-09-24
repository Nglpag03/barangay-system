import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AccountModalService {

  show = signal(false);
  email = signal('');
  password = signal('');
  creating = signal(false);
  error = signal<string | null>(null);
  credentials = signal<{ email: string; password: string } | null>(null);
  copied = signal(false);

  /** The page sets this callback so the modal can trigger account creation */
  onCreateAccount: (() => Promise<void>) | null = null;

  open() {
    this.email.set('');
    this.password.set('');
    this.error.set(null);
    this.credentials.set(null);
    this.copied.set(false);
    this.creating.set(false);
    this.show.set(true);
  }

  close() {
    this.show.set(false);
    this.email.set('');
    this.password.set('');
    this.error.set(null);
    this.credentials.set(null);
    this.copied.set(false);
    this.creating.set(false);
    this.onCreateAccount = null;
  }

  generatePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.password.set(result);
  }

  get isFormValid(): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(this.email().trim()) && this.password().length >= 6;
  }

  async submit() {
    if (this.onCreateAccount) {
      await this.onCreateAccount();
    }
  }

  copyCredentials() {
    const creds = this.credentials();
    if (!creds) return;
    const text = `Email: ${creds.email}\nPassword: ${creds.password}`;
    navigator.clipboard.writeText(text).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}