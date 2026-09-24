import {
  Component, OnInit, AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, RouterOutlet } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline, peopleOutline, documentTextOutline,
  fileTrayStackedOutline, clipboardOutline, logOutOutline,
  chevronBackOutline,keyOutline, checkmarkCircleOutline, checkmarkOutline,
  copyOutline, refreshOutline 
} from 'ionicons/icons';

import { AuthService } from '../../../core/services/auth.service';
import { AccountModalService } from 'src/app/core/services/account-modal.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-admin-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterLink, RouterLinkActive, RouterOutlet,
    IonContent, IonIcon,FormsModule,
  ]
})
export class AdminLayoutComponent implements OnInit, AfterViewChecked {

  currentUserName = 'Administrator';
  currentUserRole = 'Admin';

  private lastActivePath = '';
  private indicatorRetries = 0;
  private indicatorTimeout: any = null;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    public readonly accountModal: AccountModalService
  ) {
    addIcons({
      'home-outline': homeOutline,
      'people-outline': peopleOutline,
      'document-text-outline': documentTextOutline,
      'file-tray-stacked-outline': fileTrayStackedOutline,
      'clipboard-outline': clipboardOutline,
      'log-out-outline': logOutOutline,
      'chevron-back-outline': chevronBackOutline,
      'key-outline': keyOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'checkmark-outline': checkmarkOutline,
      'copy-outline': copyOutline,
      'refresh-outline': refreshOutline,
    });
  }

  async ngOnInit() {
    const user = await this.authService.getUser();
    const profile = await this.authService.getCurrentProfile();
    if (user) {
      this.currentUserName = profile?.full_name || user.email?.split('@')[0] || 'Administrator';
      this.currentUserRole = profile?.role || 'Admin';
    }
    setTimeout(() => this.updateIndicatorPosition(), 100);
  }

  ngAfterViewChecked() {
    const active = document.querySelector('.sidebar-nav .nav-item.active') as HTMLAnchorElement | null;
    const path = active?.getAttribute('href') || '';

    if (path && path !== this.lastActivePath) {
      this.lastActivePath = path;
      this.indicatorRetries = 0;

      if (this.indicatorTimeout) clearTimeout(this.indicatorTimeout);
      this.indicatorTimeout = setTimeout(() => {
        this.updateIndicatorPosition();
        this.indicatorTimeout = null;
      }, 20);
    }

    if (!active && this.indicatorRetries < 10) {
      this.indicatorRetries++;
      if (this.indicatorTimeout) clearTimeout(this.indicatorTimeout);
      this.indicatorTimeout = setTimeout(() => {
        this.updateIndicatorPosition();
        this.indicatorTimeout = null;
      }, 50);
    }
  }

  private updateIndicatorPosition() {
    const nav = document.querySelector('.sidebar-nav') as HTMLElement | null;
    const active = nav?.querySelector('.nav-item.active') as HTMLElement | null;
    if (!nav || !active) return;

    const navRect = nav.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();

    nav.style.setProperty('--indicator-top', `${activeRect.top - navRect.top}px`);
    nav.style.setProperty('--indicator-height', `${activeRect.height}px`);
  }

  async logout() {
    await this.authService.signOut();
    await this.router.navigate(['/login']);
  }

  closeModalAndNavigate() {
  const wasNewResident = this.router.url.includes('/admin/residents/new');
  this.accountModal.close();
  if (wasNewResident) {
    this.router.navigate(['/admin/residents']);
  }
}
}