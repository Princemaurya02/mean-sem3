import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CasesComponent } from './components/cases/cases.component';
import { HearingsComponent } from './components/hearings/hearings.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { ReportsComponent } from './components/reports/reports.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'cases', 
    component: CasesComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'hearings', 
    component: HearingsComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'calendar', 
    component: CalendarComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'reports', 
    component: ReportsComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
