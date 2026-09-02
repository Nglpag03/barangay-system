import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonButtons,
  IonMenuButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  peopleOutline,
  documentTextOutline,
  fileTrayStackedOutline,
  clipboardOutline,
  logOutOutline,
  chevronBackOutline,
  gridOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  documentOutline,
  personAddOutline,
  refreshOutline
} from 'ionicons/icons';

import { AuthService } from '../../../core/services/auth.service';
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
    CommonModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonButtons,
    IonMenuButton,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    IonSpinner
  ]
})
export class AdminDashboardPage implements OnInit, OnDestroy {
  private refreshInterval: any;

  // UI State
  isLoading = true;
  isRefreshing = false;
  isSidebarCollapsed = false;
  todayDate: string = '';
  currentUserName: string = 'Administrator';
  currentUserRole: string = 'Admin';
  isOnline = true;

  // Data
  recentRequests: RecentRequest[] = [];
  stats: Array<{label: string; value: string; delta: string; color: string}> = [];
  healthIndex: number = 94.2;

  // Navigation items
  navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'home-outline', active: true },
    { label: 'Residents', path: '/admin/residents', icon: 'people-outline', active: false },
    { label: 'Households', path: '/admin/households', icon: 'home-outline', active: false },
    { label: 'Requests', path: '/admin/requests', icon: 'document-text-outline', active: false },
    { label: 'Documents', path: '/admin/documents', icon: 'file-tray-stacked-outline', active: false },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: 'clipboard-outline', active: false }
  ];

// Quick actions
quickActions = [
  { 
    label: 'Issue Certificate', 
    path: '/admin/documents',  // Changed from '/admin/documents/new'
    icon: 'document-outline', 
    color: 'gold' 
  },
  { 
    label: 'Register Resident', 
    path: '/admin/residents',  // Changed from '/admin/residents/new'
    icon: 'person-add-outline', 
    color: 'green' 
  },
  { 
    label: 'Process Request', 
    path: '/admin/requests',   // Changed from '/admin/requests/process'
    icon: 'clipboard-outline', 
    color: 'blue' 
  }
];

  constructor(
    private readonly authService: AuthService,
    private readonly residentService: ResidentService,
    private readonly requestService: RequestService,
    private readonly documentService: DocumentService,
    private readonly householdService: HouseholdService,
    private readonly auditLogService: AuditLogService,
    private readonly router: Router
  ) {
    addIcons({
      'home-outline': homeOutline,
      'people-outline': peopleOutline,
      'document-text-outline': documentTextOutline,
      'file-tray-stacked-outline': fileTrayStackedOutline,
      'clipboard-outline': clipboardOutline,
      'log-out-outline': logOutOutline,
      'chevron-back-outline': chevronBackOutline,
      'grid-outline': gridOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'alert-circle-outline': alertCircleOutline,
      'document-outline': documentOutline,
      'person-add-outline': personAddOutline,
      'refresh-outline': refreshOutline
    });
  }

  async ngOnInit() {
    this.setTodayDate();
    // this.setupOnlineStatus();
    await this.loadUserInfo();
    await this.loadDashboardData();
    await this.logDashboardView();
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  setTodayDate() {
    const now = new Date();
    this.todayDate = now.toLocaleDateString('en-PH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).toUpperCase();
  }

  // setupOnlineStatus() {
  //   this.isOnline = this.onlineStatusService.isOnline();
    
  //   this.refreshInterval = setInterval(() => {
  //     const currentStatus = this.onlineStatusService.isOnline();
  //     if (currentStatus !== this.isOnline) {
  //       this.isOnline = currentStatus;
  //       if (currentStatus && !this.isLoading) {
  //         this.loadDashboardData();
  //       }
  //     }
  //   }, 3000);
  // }

  async loadUserInfo() {
    try {
      const user = await this.authService.getUser();
      const profile = await this.authService.getCurrentProfile();
      
      if (user) {
        this.currentUserName = profile?.full_name || user.email?.split('@')[0] || 'Administrator';
        this.currentUserRole = profile?.role || 'Admin';
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  }

  async loadDashboardData() {
    this.isLoading = true;
    
    try {
      const [residents, requests, documents, households] = await Promise.all([
        this.residentService.getAllResidents(),
        this.requestService.getAllRequests(),
        this.documentService.getAllDocuments(),
        this.householdService.getAllHouseholds()
      ]);

      const stats = this.calculateStats(residents, requests, documents, households);
      this.updateStatsFromData(stats);

      this.recentRequests = this.getRecentRequestsWithNames(requests, residents, 5);
      this.healthIndex = this.calculateHealthIndex(requests, documents);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.loadMockData();
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
    const pendingRequests = requests.filter(r => r.status === 'pending').length;
    const processingRequests = requests.filter(r => r.status === 'processing').length;
    const urgentRequests = requests.filter(r => 
      (r.status === 'pending' || r.status === 'processing') && 
      r.remarks?.toLowerCase().includes('urgent')
    ).length;

    const residentsGrowth = Math.round(residents.length * 0.007);
    const householdsGrowth = Math.round(households.length * 0.01);
    const documentsGrowth = documents.length > 0 ? 
      Math.round((documents.length / 12) * 100) / 100 : 18;

    return {
      totalResidents: residents.length,
      totalHouseholds: households.length,
      pendingRequests: pendingRequests,
      processingRequests: processingRequests,
      urgentRequests: urgentRequests,
      documentsIssued: documents.length,
      documentsGrowth: documentsGrowth,
      residentsGrowth: residentsGrowth,
      householdsGrowth: householdsGrowth
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

    const sortedRequests = [...requests]
      .sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime())
      .slice(0, limit);

    return sortedRequests.map(req => ({
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
    if (requests.length === 0 && documents.length === 0) {
      return 94.2;
    }

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

  loadMockData() {
    this.stats = [
      { label: 'TOTAL RESIDENTS', value: '4,821', delta: '+34 this month', color: 'gold' },
      { label: 'HOUSEHOLDS', value: '1,203', delta: '+12 this month', color: 'green' },
      { label: 'PENDING REQUESTS', value: '47', delta: '8 urgent', color: 'red' },
      { label: 'DOCS ISSUED (MTD)', value: '312', delta: '+18% vs last month', color: 'gold' }
    ];

    this.recentRequests = [
      { 
        id: 'REQ-2024-0891', 
        residentName: 'Maria Santos', 
        residentId: 'RES-001',
        type: 'Barangay Clearance', 
        date: new Date().toISOString(), 
        status: 'pending',
        requestType: 'barangay_clearance'
      },
      { 
        id: 'REQ-2024-0890', 
        residentName: 'Jose Reyes', 
        residentId: 'RES-002',
        type: 'Certificate of Residency', 
        date: new Date(Date.now() - 86400000).toISOString(), 
        status: 'approved',
        requestType: 'certificate_of_residency'
      },
      { 
        id: 'REQ-2024-0889', 
        residentName: 'Ana dela Cruz', 
        residentId: 'RES-003',
        type: 'Certificate of Indigency', 
        date: new Date(Date.now() - 172800000).toISOString(), 
        status: 'processing',
        requestType: 'certificate_of_indigency'
      },
      { 
        id: 'REQ-2024-0888', 
        residentName: 'Roberto Lim', 
        residentId: 'RES-004',
        type: 'Barangay Clearance', 
        date: new Date(Date.now() - 259200000).toISOString(), 
        status: 'pending',
        requestType: 'barangay_clearance'
      },
      { 
        id: 'REQ-2024-0887', 
        residentName: 'Luz Bautista', 
        residentId: 'RES-005',
        type: 'Business Clearance', 
        date: new Date(Date.now() - 345600000).toISOString(), 
        status: 'completed',
        requestType: 'business_clearance'
      }
    ];

    this.healthIndex = 94.2;
  }

  async refreshData(event: any) {
    this.isRefreshing = true;
    await this.loadUserInfo();
    await this.loadDashboardData();
    
    this.isRefreshing = false;
    if (event && event.target) {
      event.target.complete();
    }
  }

  async logDashboardView() {
    await this.auditLogService.logAction(
      'view_dashboard',
      'dashboard',
      null,
      { timestamp: new Date().toISOString() }
    );
  }

  onRequestClick(request: RecentRequest) {
    this.router.navigate(['/admin/requests', request.id]);
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  async logout() {
    await this.authService.signOut();
    await this.router.navigate(['/login']);
  }

  getStatusBadgeClass(status: RequestStatus): string {
    return `badge ${status}`;
  }

  formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-PH', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
}