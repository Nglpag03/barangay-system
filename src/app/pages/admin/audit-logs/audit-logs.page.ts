import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonLabel,
  IonBackButton,
  IonButtons
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
    IonButtons
  ]
})
export class AdminAuditLogsPage implements OnInit {

  logs: AuditLog[] = [];
  loading = true;

  constructor(
    private readonly auditLogService: AuditLogService
  ) {}

  async ngOnInit() {
    this.logs = await this.auditLogService.getAllLogs();
    this.loading = false;
  }
}