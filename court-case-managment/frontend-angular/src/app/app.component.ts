import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { User } from './models/models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Court Case Management System';
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
    }
  }

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }
}
