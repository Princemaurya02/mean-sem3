import { Component, OnInit } from '@angular/core';
import { CaseService } from '../../services/case.service';
import { HearingService } from '../../services/hearing.service';
import { CaseStats } from '../../models/models';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  stats: CaseStats | null = null;
  loading = true;

  constructor(
    private caseService: CaseService,
    private hearingService: HearingService
  ) { }

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.loading = true;
    this.caseService.getCaseStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.loading = false;
      }
    });
  }

  getCaseTypeData(): Array<{type: string, count: number, percentage: number}> {
    if (!this.stats || !this.stats.casesByType) return [];
    
    const total = this.stats.casesByType.reduce((sum, item) => sum + item.count, 0);
    return this.stats.casesByType.map(item => ({
      type: item._id,
      count: item.count,
      percentage: total > 0 ? Math.round((item.count / total) * 100) : 0
    }));
  }

  getCaseStatusData(): Array<{status: string, count: number, percentage: number}> {
    if (!this.stats || !this.stats.casesByStatus) return [];
    
    const total = this.stats.casesByStatus.reduce((sum, item) => sum + item.count, 0);
    return this.stats.casesByStatus.map(item => ({
      status: item._id,
      count: item.count,
      percentage: total > 0 ? Math.round((item.count / total) * 100) : 0
    }));
  }

  getCompletionRate(): number {
    if (!this.stats) return 0;
    const total = this.stats.totalCases;
    const closed = this.stats.closedCases;
    return total > 0 ? Math.round((closed / total) * 100) : 0;
  }

  getActiveRate(): number {
    if (!this.stats) return 0;
    const total = this.stats.totalCases;
    const active = this.stats.activeCases;
    return total > 0 ? Math.round((active / total) * 100) : 0;
  }

  exportReport(format: string): void {
    alert(`Exporting report as ${format}... (To be implemented)`);
  }
}
