import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CaseService } from '../../services/case.service';
import { HearingService } from '../../services/hearing.service';
import { PermissionService } from '../../services/permission.service';
import { User, Case, Hearing, CaseStats } from '../../models/models';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  stats: CaseStats | null = null;
  recentCases: Case[] = [];
  upcomingHearings: Hearing[] = [];
  loading = true;
  refreshSubscription?: Subscription;
  lastUpdated: Date = new Date();

  // Edit case modal
  showEditModal = false;
  editingCase: Case | null = null;
  caseStatuses = ['Filed', 'Under Review', 'Hearing Scheduled', 'In Progress', 'Adjourned', 'Verdict Delivered', 'Completed', 'Closed', 'Archived'];
  casePriorities = ['Low', 'Medium', 'High', 'Urgent'];

  constructor(
    private authService: AuthService,
    private caseService: CaseService,
    private hearingService: HearingService,
    public permissionService: PermissionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadDashboardData();
    
    // Auto-refresh every 30 seconds for real-time updates
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.loadDashboardData(true); // Silent refresh
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  loadDashboardData(silent: boolean = false): void {
    if (!silent) {
      this.loading = true;
    }
    
    // Load statistics
    this.caseService.getCaseStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats = response.data;
          this.lastUpdated = new Date();
        }
      },
      error: (error) => console.error('Error loading stats:', error)
    });

    // Load recent cases (last 5, sorted by creation date)
    this.caseService.getAllCases().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.recentCases = response.data
            .sort((a, b) => {
              const dateA = new Date(a.createdAt || a.filingDate).getTime();
              const dateB = new Date(b.createdAt || b.filingDate).getTime();
              return dateB - dateA;
            })
            .slice(0, 5);
        }
        if (!silent) {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading cases:', error);
        if (!silent) {
          this.loading = false;
        }
      }
    });

    // Load upcoming hearings
    this.hearingService.getUpcomingHearings().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.upcomingHearings = response.data.slice(0, 5);
        }
      },
      error: (error) => console.error('Error loading hearings:', error)
    });
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  viewCase(caseId: string): void {
    this.router.navigate(['/cases']);
  }

  editCase(caseData: Case): void {
    if (!this.permissionService.canWrite()) {
      alert('❌ Access Denied: Admin privileges required to edit cases.');
      return;
    }
    this.editingCase = { ...caseData };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingCase = null;
  }

  saveCase(): void {
    if (!this.editingCase || !this.editingCase._id) return;

    this.caseService.updateCase(this.editingCase._id, this.editingCase).subscribe({
      next: (response) => {
        if (response.success) {
          alert('✅ Case updated successfully!');
          this.closeEditModal();
          this.loadDashboardData();
        }
      },
      error: (error) => {
        alert('❌ Failed to update case: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }

  viewAllCases(): void {
    this.router.navigate(['/cases']);
  }

  viewAllHearings(): void {
    this.router.navigate(['/hearings']);
  }

  createNewCase(): void {
    if (!this.permissionService.canWrite()) {
      alert('❌ Access Denied: Admin privileges required.');
      return;
    }
    this.router.navigate(['/cases']);
  }

  getStatusClass(status: string): string {
    const classMap: any = {
      'Filed': 'badge-filed',
      'Under Review': 'badge-review',
      'Hearing Scheduled': 'badge-scheduled',
      'In Progress': 'badge-progress',
      'Adjourned': 'badge-review',
      'Verdict Delivered': 'badge-completed',
      'Completed': 'badge-completed',
      'Closed': 'badge-closed',
      'Archived': 'badge-closed'
    };
    return classMap[status] || 'badge-filed';
  }

  getPriorityClass(priority: string): string {
    const classMap: any = {
      'High': 'badge-high',
      'Urgent': 'badge-urgent',
      'Medium': 'badge-medium',
      'Low': 'badge-low'
    };
    return classMap[priority] || 'badge-medium';
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  formatTime(time: string): string {
    return time || 'N/A';
  }

  formatDateTime(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getCaseTitle(hearing: Hearing): string {
    if (hearing.case && typeof hearing.case === 'object') {
      return (hearing.case as any).caseTitle || (hearing.case as any).caseNumber || 'Unknown';
    }
    return 'Unknown';
  }

  getCaseNumber(hearing: Hearing): string {
    if (hearing.case && typeof hearing.case === 'object') {
      return (hearing.case as any).caseNumber || 'N/A';
    }
    return 'N/A';
  }

  getWelcomeMessage(): string {
    const hour = new Date().getHours();
    let greeting = 'Good Evening';
    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 18) greeting = 'Good Afternoon';
    
    return `${greeting}, ${this.currentUser?.firstName}!`;
  }

  getRoleMessage(): string {
    if (this.permissionService.isAdmin()) {
      return 'You have full administrative access to the system.';
    } else {
      return 'You have view-only access to the system.';
    }
  }

  getCompletionRate(): number {
    if (!this.stats || this.stats.totalCases === 0) return 0;
    return Math.round((this.stats.closedCases / this.stats.totalCases) * 100);
  }
}
