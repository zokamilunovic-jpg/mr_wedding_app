import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    
    const userString = localStorage.getItem('user');

    if (userString) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}