import { Component, OnInit, OnDestroy} from '@angular/core';
import { RouterLink, Router} from '@angular/router';
import { CommonModule, TitleCasePipe,} from '@angular/common';
import {
  IonContent,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  documentOutline,
  personAddOutline, refreshOutline, flashOutline, arrowForwardOutline
} from 'ionicons/icons';

import { ResidentService } from '../../../core/services/resident.service';
import { RequestService } from '../../../core/services/request.service';
import { DocumentService } from '../../../core/services/document.service';
import { HouseholdService } from '../../../core/services/household.service';
import { AuditLogService } from '../../../core/services/audit-log.service';

import { Resident } from '../../../core/model/resident.model';
import { ResidentRequest, RequestStatus, RequestType } from '../../../core/model/request.model';
import { ResidentDocument } from '../../../core/model/document.model';
import { Household } from '../../../core/model/household.model';

interface DashboardStats {
  totalResidents: number;
  totalHouseholds: number;
  pendingRequests: number;
  processingRequests: number;
  urgentRequests: number;
  documentsIssued: number;
  documentsGrowth: number;
  residentsGrowth: number;
  householdsGrowth: number;
}

interface RecentRequest {
  id: string;
  residentName: string;
  residentId: string;
  type: string;
  date: string;
  status: RequestStatus;
  requestType: RequestType;
  purpose?: string | null;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterLink, TitleCasePipe, 
    IonContent, IonIcon, IonRefresher, IonRefresherContent, IonSpinner, 
  ]
})
export class AdminDashboardPage implements OnInit, OnDestroy {
  private refreshInterval: any;
  // UI State
  isLoading = true;
  isRefreshing = false;

  todayDate: string = '';
 


  // Data
  recentRequests: RecentRequest[] = [];
  stats: Array<{ label: string; value: string; delta: string; color: string }> = [];
  healthIndex: number = 0;



  quickActions = [
    { label: 'Issue Certificate', path: '/admin/documents', icon: 'document-outline', color: 'gold' },
    { label: 'Register Resident', path: '/admin/residents', icon: 'person-add-outline', color: 'green' },
    { label: 'Process Request', path: '/admin/requests', icon: 'clipboard-outline', color: 'blue' }
  ];

  constructor(
    private readonly residentService: ResidentService,
    private readonly requestService: RequestService,
    private readonly documentService: DocumentService,
    private readonly householdService: HouseholdService,
    private readonly auditLogService: AuditLogService,
    private readonly router: Router
  ) {
    addIcons({
      'document-outline': documentOutline, 'person-add-outline': personAddOutline,
      'flash-outline': flashOutline, 'refresh-outline': refreshOutline,
      'arrow-forward-outline': arrowForwardOutline,
    });
  }

  async ngOnInit() {
    this.setTodayDate();
    await this.loadDashboardData();
  }

  ngOnDestroy() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  setTodayDate() {
    this.todayDate = new Date().toLocaleDateString('en-PH', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }).toUpperCase();
  }


  async loadDashboardData() {
    this.isLoading = true;
    try {
      // Fetch all data in parallel
      const [residents, requests, documents, households] = await Promise.all([
        this.residentService.getAllResidents(),
        this.requestService.getAllRequests(),
        this.documentService.getAllDocuments(),
        this.householdService.getAllHouseholds()
      ]);

      // 1. Update Stats
      const calculatedStats = this.calculateStats(residents, requests, documents, households);
      this.updateStatsFromData(calculatedStats);

      // 2. Update Recent Requests (Top 5)
      this.recentRequests = this.getRecentRequestsWithNames(requests, residents, 5);

      // 3. Update Health Index
      this.healthIndex = this.calculateHealthIndex(requests, documents);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to empty state (do not use mock data in production)
      this.resetToEmptyState();
    } finally {
      this.isLoading = false;
    }
  }

  calculateStats(
    residents: Resident[],
    requests: ResidentRequest[],
    documents: ResidentDocument[],
    households: Household[]
  ): DashboardStats {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Count requests
    const pendingRequests = requests.filter(r => r.status === 'pending').length;
    const processingRequests = requests.filter(r => r.status === 'processing').length;
    
    // Count urgent requests (pending/processing + marked urgent)
    const urgentRequests = requests.filter(r => 
      (r.status === 'pending' || r.status === 'processing') && 
      r.remarks?.toLowerCase().includes('urgent')
    ).length;

    // Calculate month-to-date growth
    const newResidentsThisMonth = residents.filter(r => new Date(r.created_at) >= startOfMonth).length;
    const newHouseholdsThisMonth = households.filter(h => new Date(h.created_at) >= startOfMonth).length;
    
    const docsIssuedThisMonth = documents.filter(d => new Date(d.issued_at) >= startOfMonth).length;

    return {
      totalResidents: residents.length,
      totalHouseholds: households.length,
      pendingRequests: pendingRequests,
      processingRequests: processingRequests,
      urgentRequests: urgentRequests,
      documentsIssued: docsIssuedThisMonth,
      documentsGrowth: 18, // Placeholder for actual % growth calculation
      residentsGrowth: newResidentsThisMonth,
      householdsGrowth: newHouseholdsThisMonth
    };
  }

  getRecentRequestsWithNames(
    requests: ResidentRequest[],
    residents: Resident[],
    limit: number
  ): RecentRequest[] {
    const residentMap = new Map<string, string>();
    residents.forEach(r => {
      const fullName = `${r.first_name} ${r.middle_name || ''} ${r.last_name}`.trim().replace(/\s+/g, ' ');
      residentMap.set(r.id, fullName);
    });

    return [...requests]
      .sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime())
      .slice(0, limit)
      .map(req => ({
        id: req.id,
        residentName: residentMap.get(req.resident_id) || 'Unknown Resident',
        residentId: req.resident_id,
        type: this.formatRequestType(req.request_type),
        date: req.requested_at,
        status: req.status,
        requestType: req.request_type,
        purpose: req.purpose
      }));
  }

  formatRequestType(type: RequestType): string {
    const typeMap: Record<RequestType, string> = {
      'barangay_clearance': 'Barangay Clearance',
      'certificate_of_residency': 'Certificate of Residency',
      'certificate_of_indigency': 'Certificate of Indigency',
      'business_clearance': 'Business Clearance',
      'other': 'Other Request'
    };
    return typeMap[type] || type;
  }

  calculateHealthIndex(requests: ResidentRequest[], documents: ResidentDocument[]): number {
    if (requests.length === 0 && documents.length === 0) return 0;

    const completedRequests = requests.filter(r => 
      r.status === 'approved' || r.status === 'completed'
    ).length;
    
    const requestCompletionRate = requests.length > 0 ? 
      (completedRequests / requests.length) * 100 : 100;

    const documentRate = Math.min((documents.length / (requests.length || 1)) * 100, 100);
    const healthIndex = (requestCompletionRate * 0.6) + (documentRate * 0.4);
    
    return Math.min(Math.round(healthIndex * 10) / 10, 100);
  }

  updateStatsFromData(stats: DashboardStats) {
    this.stats = [
      { 
        label: 'TOTAL RESIDENTS', 
        value: this.formatNumber(stats.totalResidents), 
        delta: `+${stats.residentsGrowth} this month`, 
        color: 'gold' 
      },
      { 
        label: 'HOUSEHOLDS', 
        value: this.formatNumber(stats.totalHouseholds), 
        delta: `+${stats.householdsGrowth} this month`, 
        color: 'green' 
      },
      { 
        label: 'PENDING REQUESTS', 
        value: this.formatNumber(stats.pendingRequests + stats.processingRequests), 
        delta: `${stats.urgentRequests} urgent`, 
        color: 'red' 
      },
      { 
        label: 'DOCS ISSUED (MTD)', 
        value: this.formatNumber(stats.documentsIssued), 
        delta: `+${stats.documentsGrowth}% vs last month`, 
        color: 'gold' 
      }
    ];
  }

  resetToEmptyState() {
    this.stats = [
      { label: 'TOTAL RESIDENTS', value: '0', delta: '+0 this month', color: 'gold' },
      { label: 'HOUSEHOLDS', value: '0', delta: '+0 this month', color: 'green' },
      { label: 'PENDING REQUESTS', value: '0', delta: '0 urgent', color: 'red' },
      { label: 'DOCS ISSUED (MTD)', value: '0', delta: '+0% vs last month', color: 'gold' }
    ];
    this.recentRequests = [];
    this.healthIndex = 0;
  }

  async refreshData(event: any) {
    this.isRefreshing = true;
   
    await this.loadDashboardData();
    this.isRefreshing = false;
    if (event?.target) event.target.complete();
  }

  onRequestClick(request: RecentRequest) {
    this.router.navigate(['/admin/requests', request.id]);
  }


  formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-PH', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });
  }

}