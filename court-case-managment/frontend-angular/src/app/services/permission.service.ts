import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(private authService: AuthService) { }

  /**
   * Check if user is Admin
   */
  isAdmin(): boolean {
    const user = this.authService.currentUserValue;
    return user?.role === 'Admin';
  }

  /**
   * Check if user is Staff
   */
  isStaff(): boolean {
    const user = this.authService.currentUserValue;
    return user?.role === 'Staff';
  }

  /**
   * Check if user can create/edit/delete (Admin only)
   */
  canWrite(): boolean {
    return this.isAdmin();
  }

  /**
   * Check if user can only view (Staff)
   */
  canOnlyView(): boolean {
    return this.isStaff();
  }

  /**
   * Get user role
   */
  getUserRole(): string {
    const user = this.authService.currentUserValue;
    return user?.role || 'Guest';
  }
}
