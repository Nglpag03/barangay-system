import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewWillEnter } from '@ionic/angular';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline, personAddOutline } from 'ionicons/icons';

import { ResidentService } from '../../../core/services/resident.service';
import { Resident } from '../../../core/model/resident.model';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-admin-residents',
  templateUrl: './residents.page.html',
  styleUrls: ['./residents.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    IonContent,
    IonIcon,
    IonSpinner
  ]
})
export class ResidentsPage implements OnInit, ViewWillEnter {

  residents: Resident[] = [];
  filteredResidents: Resident[] = [];
  loading = true;
  loadError = false;
  searchTerm = '';
  activeFilter: 'all' | 'active' | 'inactive' = 'all';
  todayDate: string = '';
  constructor(
    private readonly residentService: ResidentService,
    private readonly router: Router 
  ) {
    addIcons({
      'search-outline': searchOutline,
      'person-add-outline': personAddOutline
    });
  }

  async ngOnInit() {
    await this.loadResidents();
    this.setTodayDate();
  }

  async ionViewWillEnter() {
    await this.loadResidents();
  }
    setTodayDate() {
    this.todayDate = new Date().toLocaleDateString('en-PH', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }).toUpperCase();
  }
  async loadResidents() {
    this.loading = true;
    this.loadError = false;

    try {
      this.residents = await this.residentService.getAllResidents();
      this.applyFilters();
    } catch (err) {
      console.error('Failed to load residents:', err);
      this.loadError = true;
    } finally {
      this.loading = false;
    }
  }
  onRowClick(resident: Resident) {
  this.router.navigate(['/admin/residents', resident.id]);
}
  onSearchChange(event: any) {
    this.searchTerm = (event.target.value ?? '').trim().toLowerCase();
    this.applyFilters();
  }

  setFilter(filter: 'all' | 'active' | 'inactive') {
    this.activeFilter = filter;
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.residents];

    if (this.activeFilter === 'active') {
      result = result.filter(r => r.is_active === true);
    } else if (this.activeFilter === 'inactive') {
      result = result.filter(r => r.is_active === false);
    }

    if (this.searchTerm) {
      result = result.filter((resident) => {
        const fullName = `${resident.first_name} ${resident.middle_name ?? ''} ${resident.last_name}`.toLowerCase();
        return (
          fullName.includes(this.searchTerm) ||
          resident.resident_number?.toLowerCase().includes(this.searchTerm)
        );
      });
    }

    this.filteredResidents = result;
  }

  getInitials(firstName: string, lastName: string): string {
    const f = firstName ? firstName.charAt(0) : '';
    const l = lastName ? lastName.charAt(0) : '';
    return `${f}${l}`.toUpperCase();
  }

  getAge(birthDate: string): number {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  getStatus(resident: Resident): string {
    return resident.is_active ? 'Active' : 'Inactive';
  }
}