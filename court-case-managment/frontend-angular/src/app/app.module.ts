import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CasesComponent } from './components/cases/cases.component';
import { HearingsComponent } from './components/hearings/hearings.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { ReportsComponent } from './components/reports/reports.component';

// Services
import { AuthService } from './services/auth.service';
import { CaseService } from './services/case.service';
import { HearingService } from './services/hearing.service';
import { NotificationService } from './services/notification.service';

// Guards
import { AuthGuard } from './guards/auth.guard';

// Interceptors
import { JwtInterceptor } from './interceptors/jwt.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    CasesComponent,
    HearingsComponent,
    CalendarComponent,
    ReportsComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    AuthService,
    CaseService,
    HearingService,
    NotificationService,
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
