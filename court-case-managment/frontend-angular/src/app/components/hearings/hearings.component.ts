import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HearingService } from '../../services/hearing.service';
import { CaseService } from '../../services/case.service';
import { AuthService } from '../../services/auth.service';
import { Hearing, Case, User } from '../../models/models';

@Component({
  selector: 'app-hearings',
  templateUrl: './hearings.component.html',
  styleUrls: ['./hearings.component.css']
})
export class HearingsComponent implements OnInit {
  hearings: Hearing[] = [];
  filteredHearings: Hearing[] = [];
  cases: Case[] = [];
  loading = true;
  showModal = false;
  hearingForm!: FormGroup;
  currentUser: User | null = null;

  // Filters
  selectedStatus = '';
  selectedDate = '';

  hearingTypes = ['Initial', 'Evidence', 'Arguments', 'Final', 'Interim', 'Bail', 'Other'];
  hearingStatuses = ['Scheduled', 'In Progress', 'Completed', 'Adjourned', 'Cancelled'];

  constructor(
    private hearingService: HearingService,
    private caseService: CaseService,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.initializeForm();
    this.loadHearings();
    this.loadCases();
  }

  initializeForm(): void {
    this.hearingForm = this.formBuilder.group({
      case: ['', Validators.required],
      hearingDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: [''],
      courtroom: ['', Validators.required],
      hearingType: ['', Validators.required]
    });
  }

  loadHearings(): void {
    this.loading = true;
    this.hearingService.getAllHearings().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.hearings = response.data;
          this.filteredHearings = [...this.hearings];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading hearings:', error);
        this.loading = false;
      }
    });
  }

  loadCases(): void {
    this.caseService.getAllCases().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.cases = response.data.filter(c =>
            c.status !== 'Closed' && c.status !== 'Archived'
          );
        }
      },
      error: (error) => console.error('Error loading cases:', error)
    });
  }

  applyFilters(): void {
    this.filteredHearings = this.hearings.filter(h => {
      const matchesStatus = !this.selectedStatus || h.status === this.selectedStatus;

      let matchesDate = true;
      if (this.selectedDate) {
        const hearingDate = new Date(h.hearingDate).toDateString();
        const filterDate = new Date(this.selectedDate).toDateString();
        matchesDate = hearingDate === filterDate;
      }

      return matchesStatus && matchesDate;
    });
  }

  openModal(): void {
    this.showModal = true;
    this.hearingForm.reset();
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSubmit(): void {
    if (this.hearingForm.invalid) {
      return;
    }

    const hearingData = {
      ...this.hearingForm.value,
      judge: this.currentUser?.role === 'Judge' ? this.currentUser._id : null
    };

    this.hearingService.scheduleHearing(hearingData).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Hearing scheduled successfully!');
          this.closeModal();
          this.loadHearings();
        }
      },
      error: (error) => {
        console.error('Error scheduling hearing:', error);
        alert('Failed to schedule hearing: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }

  getStatusClass(status: string): string {
    const classMap: any = {
      'Scheduled': 'badge-scheduled',
      'In Progress': 'badge-progress',
      'Completed': 'badge-completed',
      'Adjourned': 'badge-review',
      'Cancelled': 'badge-closed'
    };
    return classMap[status] || 'badge-scheduled';
  }

  formatDate(date: any): string {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  }

  formatTime(time: any): string {
    return time || 'N/A';
  }

  getCaseTitle(hearing: Hearing): string {
    if (hearing.case && typeof hearing.case === 'object') {
      return (hearing.case as any).caseTitle || (hearing.case as any).caseNumber || 'Unknown';
    }
    return 'Unknown';
  }

  canScheduleHearing(): boolean {
    return this.currentUser?.role === 'Admin' ||
      this.currentUser?.role === 'Court Staff' ||
      this.currentUser?.role === 'Judge';
  }
}
