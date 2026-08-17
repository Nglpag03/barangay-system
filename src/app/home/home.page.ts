import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/angular/standalone';
import { SupabaseService } from '../core/services/supabase.service';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton],
})
export class HomePage {
  constructor(
    private readonly supabaseService: SupabaseService
  ) {}
  async testSupabase() {

  const { data, error } = await this.supabaseService.client
    .from('profiles')
    .select('id, role, full_name');

  console.log('Supabase data:', data);
  console.log('Supabase error:', error);
}
}
