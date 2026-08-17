import { Component, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton
} from '@ionic/angular/standalone';

import { AuthService } from '../../../core/services/auth.service';
import { ResidentService } from '../../../core/services/resident.service';
import { Resident } from '../../../core/model/resident.model';
import { SupabaseService } from '../../../core/services/supabase.service';
@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.page.html',
  styleUrls: ['./user-dashboard.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton
  ]
})
export class UserDashboardPage implements OnInit {

  resident: Resident | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly residentService: ResidentService,
    private readonly supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    this.resident = await this.residentService.getMyResidentRecord();
    console.log('MY RESIDENT RECORD:', this.resident);
  }
}