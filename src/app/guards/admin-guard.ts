import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {

    const userString = localStorage.getItem('user');

    if (!userString) {
      this.router.navigate(['/login']);
      return false;
    }

    const user = JSON.parse(userString);

    if (user.role === 'admin') {
      return true;
    }

    this.router.navigate(['/home']);
    return false;
  }
}