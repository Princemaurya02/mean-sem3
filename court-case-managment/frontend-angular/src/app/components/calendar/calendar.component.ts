import { Component, OnInit } from '@angular/core';
import { HearingService } from '../../services/hearing.service';
import { Hearing } from '../../models/models';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  currentDate: Date = new Date();
  currentMonth: number;
  currentYear: number;
  monthName: string = '';
  calendarDays: any[] = [];
  hearings: Hearing[] = [];
  loading = true;

  monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  constructor(private hearingService: HearingService) {
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
  }

  ngOnInit(): void {
    this.updateMonthName();
    this.loadMonthData();
  }

  loadMonthData(): void {
    this.loading = true;
    this.hearingService.getMonthlyCalendar(this.currentMonth + 1, this.currentYear).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.hearings = response.data;
          this.generateCalendar();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading calendar:', error);
        this.generateCalendar();
        this.loading = false;
      }
    });
  }

  generateCalendar(): void {
    this.calendarDays = [];
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const prevLastDay = new Date(this.currentYear, this.currentMonth, 0);

    const firstDayIndex = firstDay.getDay();
    const lastDayDate = lastDay.getDate();
    const prevLastDayDate = prevLastDay.getDate();

    // Previous month days
    for (let i = firstDayIndex; i > 0; i--) {
      this.calendarDays.push({
        day: prevLastDayDate - i + 1,
        isCurrentMonth: false,
        date: new Date(this.currentYear, this.currentMonth - 1, prevLastDayDate - i + 1),
        hearings: []
      });
    }

    // Current month days
    for (let day = 1; day <= lastDayDate; day++) {
      const date = new Date(this.currentYear, this.currentMonth, day);
      const dayHearings = this.getHearingsForDate(date);
      
      this.calendarDays.push({
        day: day,
        isCurrentMonth: true,
        isToday: this.isToday(date),
        date: date,
        hearings: dayHearings
      });
    }

    // Next month days to fill the grid
    const remainingDays = 42 - this.calendarDays.length;
    for (let day = 1; day <= remainingDays; day++) {
      this.calendarDays.push({
        day: day,
        isCurrentMonth: false,
        date: new Date(this.currentYear, this.currentMonth + 1, day),
        hearings: []
      });
    }
  }

  getHearingsForDate(date: Date): Hearing[] {
    return this.hearings.filter(hearing => {
      const hearingDate = new Date(hearing.hearingDate);
      return hearingDate.toDateString() === date.toDateString();
    });
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  previousMonth(): void {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.updateMonthName();
    this.loadMonthData();
  }

  nextMonth(): void {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.updateMonthName();
    this.loadMonthData();
  }

  today(): void {
    const now = new Date();
    this.currentMonth = now.getMonth();
    this.currentYear = now.getFullYear();
    this.currentDate = now;
    this.updateMonthName();
    this.loadMonthData();
  }

  updateMonthName(): void {
    this.monthName = `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
  }

  getCaseTitle(hearing: Hearing): string {
    if (hearing.case && typeof hearing.case === 'object') {
      return (hearing.case as any).caseNumber || 'Case';
    }
    return 'Case';
  }

  formatTime(time: string): string {
    return time || '';
  }
}
