import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CaseService } from '../../services/case.service';
import { AuthService } from '../../services/auth.service';
import { Case, User } from '../../models/models';

@Component({
  selector: 'app-cases',
  templateUrl: './cases.component.html',
  styleUrls: ['./cases.component.css']
})
export class CasesComponent implements OnInit {
  cases: Case[] = [];
  filteredCases: Case[] = [];
  loading = true;
  showModal = false;
  caseForm!: FormGroup;
  currentUser: User | null = null;

  // Filters
  searchTerm = '';
  selectedStatus = '';
  selectedType = '';
  selectedPriority = '';

  caseTypes = ['Civil', 'Criminal', 'Family', 'Corporate', 'Tax', 'Property', 'Labour', 'Constitutional'];
  caseStatuses = ['Filed', 'Under Review', 'Hearing Scheduled', 'In Progress', 'Adjourned', 'Verdict Delivered', 'Closed', 'Archived'];
  priorities = ['Low', 'Medium', 'High', 'Urgent'];

  constructor(
    private caseService: CaseService,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.initializeForm();
    this.loadCases();
  }

  initializeForm(): void {
    this.caseForm = this.formBuilder.group({
      caseType: ['', Validators.required],
      caseTitle: ['', Validators.required],
      priority: ['Medium', Validators.required],
      plaintiffName: ['', Validators.required],
      plaintiffContact: [''],
      plaintiffEmail: ['', Validators.email],
      defendantName: ['', Validators.required],
      defendantContact: [''],
      defendantEmail: ['', Validators.email],
      courtroom: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  loadCases(): void {
    this.loading = true;
    this.caseService.getAllCases().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.cases = response.data;
          this.filteredCases = [...this.cases];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cases:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredCases = this.cases.filter(c => {
      const matchesSearch = !this.searchTerm ||
        c.caseNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        c.caseTitle.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.selectedStatus || c.status === this.selectedStatus;
      const matchesType = !this.selectedType || c.caseType === this.selectedType;
      const matchesPriority = !this.selectedPriority || c.priority === this.selectedPriority;

      return matchesSearch && matchesStatus && matchesType && matchesPriority;
    });
  }

  openModal(): void {
    this.showModal = true;
    this.caseForm.reset({ priority: 'Medium' });
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSubmit(): void {
    if (this.caseForm.invalid) {
      return;
    }

    const formValue = this.caseForm.value;
    const caseData = {
      caseType: formValue.caseType,
      caseTitle: formValue.caseTitle,
      priority: formValue.priority,
      plaintiff: {
        name: formValue.plaintiffName,
        contactNumber: formValue.plaintiffContact,
        email: formValue.plaintiffEmail
      },
      defendant: {
        name: formValue.defendantName,
        contactNumber: formValue.defendantContact,
        email: formValue.defendantEmail
      },
      assignedJudge: this.currentUser?.role === 'Admin' ? this.currentUser._id : null,
      courtroom: formValue.courtroom,
      description: formValue.description
    };

    this.caseService.createCase(caseData).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Case created successfully!');
          this.closeModal();
          this.loadCases();
        }
      },
      error: (error) => {
        console.error('Error creating case:', error);
        alert('Failed to create case: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }

  viewCase(caseId: string): void {
    // Navigate to case detail
    alert('View case details: ' + caseId);
  }

  getStatusClass(status: string): string {
    const classMap: any = {
      'Filed': 'badge-filed',
      'Under Review': 'badge-review',
      'Hearing Scheduled': 'badge-scheduled',
      'In Progress': 'badge-progress',
      'Completed': 'badge-completed',
      'Closed': 'badge-closed'
    };
    return classMap[status] || 'badge-filed';
  }

  getPriorityClass(priority: string): string {
    const classMap: any = {
      'High': 'badge-high',
      'Urgent': 'badge-high',
      'Medium': 'badge-medium',
      'Low': 'badge-low'
    };
    return classMap[priority] || 'badge-medium';
  }

  formatDate(date: any): string {
    if (!date) return 'Not scheduled';
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

  canCreateCase(): boolean {
    return this.currentUser?.role === 'Admin' ||
      this.currentUser?.role === 'Court Staff';
  }
}
