import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, homeOutline, mapOutline, locationOutline, businessOutline,
  searchOutline, funnelOutline, swapVerticalOutline, ellipsisVerticalOutline,
  eyeOutline, pencilOutline, trashOutline, closeOutline,
  chevronBackOutline, chevronForwardOutline, alertCircleOutline
} from 'ionicons/icons';

import { HouseholdService } from '../../../core/services/household.service';
import { Household } from '../../../core/model/household.model';

@Component({
  selector: 'app-admin-households',
  templateUrl: './households.page.html',
  styleUrls: ['./households.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonIcon,
    IonSpinner
  ]
})
export class HouseholdsPage implements OnInit, ViewWillEnter {

  households: Household[] = [];
  loading = true;
  loadError = false;

  filtered: Household[] = [];
  paginated: Household[] = [];
  searchQuery = '';
  statusFilter: 'All' | 'Active' | 'Inactive' = 'All';
  currentPage = 1;
  perPage = 8;
  totalPages = 1;
  openMenuId: string | null = null;
  sortField = 'household_number';
  sortDir: 'asc' | 'desc' = 'asc';
  todayDate: string = '';

  constructor(
    private readonly householdService: HouseholdService,
    private readonly router: Router
  ) {
    addIcons({
      addOutline, homeOutline, mapOutline, locationOutline, businessOutline,
      searchOutline, funnelOutline, swapVerticalOutline, ellipsisVerticalOutline,
      eyeOutline, pencilOutline, trashOutline, closeOutline,
      chevronBackOutline, chevronForwardOutline, alertCircleOutline
    });
  }

  async ngOnInit() {
    await this.loadHouseholds();
    this.todayDate = new Date().toLocaleDateString('en-PH', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
}).toUpperCase();
  }

  async ionViewWillEnter() {
    await this.loadHouseholds();
  }

  async loadHouseholds() {
    this.loading = true;
    this.loadError = false;
    try {
      this.households = await this.householdService.getAllHouseholds();
      this.applyFilters();
    } catch (err) {
      console.error('Failed to load households:', err);
      this.loadError = true;
    } finally {
      this.loading = false;
    }
  }

  // ── Getters (using only fields that exist on Household) ──
  get totalCount()  { return this.households.length; }
  get purokCount()  { return new Set(this.households.map(h => h.purok)).size; }
  get streetCount() { return new Set(this.households.map(h => h.street).filter(Boolean)).size; }
  get pageEnd()     { return Math.min(this.currentPage * this.perPage, this.filtered.length); }
  get pageNumbers() { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }

  formatAddress(h: Household): string {
    return [h.house_number, h.street, h.purok].filter(Boolean).join(', ');
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  onSearch() {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearSearch() {
    this.searchQuery = '';
    this.onSearch();
  }

  setFilter(value: string) {
    this.statusFilter = value as 'All' | 'Active' | 'Inactive';
    this.currentPage = 1;
    this.applyFilters();
  }

  goToPage(n: number) { this.currentPage = n; this.paginate(); }

  toggleMenu(id: string) {
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  view(hh: Household) {
    this.router.navigate(['/admin/households', hh.id]);
  }

  edit(hh: Household) {
    this.router.navigate(['/admin/households', hh.id, 'edit']);
  }

  async delete(hh: Household) {
    if (confirm(`Delete ${hh.household_number}?`)) {
      // await this.householdService.delete(hh.id);
      // await this.loadHouseholds();
      console.log('Deleted', hh.id);
    }
    this.openMenuId = null;
  }

  sortBy(field: string) {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = 'asc';
    }
    this.applyFilters();
  }

  applyFilters() {
    const q = this.searchQuery.toLowerCase();
    this.filtered = this.households.filter(h => {
      if (this.statusFilter !== 'All') {
        // If your Household model doesn't have a 'status' field, remove this block.
        // For now it will keep all rows when 'Active'/'Inactive' is selected.
        const status = (h as any).status;
        if (status && status !== this.statusFilter) return false;
      }
      if (!q) return true;
      return (
        h.household_number.toLowerCase().includes(q) ||
        h.purok.toLowerCase().includes(q) ||
        (h.street?.toLowerCase().includes(q) ?? false) ||
        (h.house_number?.toLowerCase().includes(q) ?? false) ||
        h.barangay.toLowerCase().includes(q)
      );
    });

    this.filtered.sort((a, b) => {
      const av = (a as any)[this.sortField] ?? '';
      const bv = (b as any)[this.sortField] ?? '';
      return this.sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

    this.totalPages = Math.max(1, Math.ceil(this.filtered.length / this.perPage));
    this.paginate();
  }

  paginate() {
    const start = (this.currentPage - 1) * this.perPage;
    this.paginated = this.filtered.slice(start, start + this.perPage);
  }
}