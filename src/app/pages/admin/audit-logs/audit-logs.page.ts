import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewWillEnter } from '@ionic/angular';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonLabel,
  IonBackButton,
  IonButtons,
  IonButton
} from '@ionic/angular/standalone';

import { AuditLogService } from '../../../core/services/audit-log.service';
import { AuditLog } from '../../../core/model/audit-log.model';

@Component({
  selector: 'app-admin-audit-logs',
  templateUrl: './audit-logs.page.html',
  styleUrls: ['./audit-logs.page.scss'],
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
    IonButtons,
    IonButton
  ]
})
export class AdminAuditLogsPage implements OnInit, ViewWillEnter {

  logs: AuditLog[] = [];
  loading = true;
  loadError = false;

  constructor(
    private readonly auditLogService: AuditLogService
  ) {}

  async ngOnInit() {
    await this.loadLogs();
  }

  async ionViewWillEnter() {
    await this.loadLogs();
  }

  async loadLogs() {
    this.loading = true;
    this.loadError = false;

    try {
      this.logs = await this.auditLogService.getAllLogs();
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      this.loadError = true;
    } finally {
      this.loading = false;
    }
  }
}