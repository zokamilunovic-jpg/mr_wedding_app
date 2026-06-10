import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {

    const userString = localStorage.getItem('user');

    // 1. ako nema user-a → login
    if (!userString) {
      this.router.navigate(['/login']);
      return false;
    }

    const user = JSON.parse(userString);

    // 2. ako je admin → dozvoli ulaz
    if (user.role === 'admin') {
      return true;
    }

    // 3. ako nije admin → home
    this.router.navigate(['/home']);
    return false;
  }
}