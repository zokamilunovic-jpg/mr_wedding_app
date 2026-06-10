import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage {
  ime: string = '';
  prezime: string = '';
  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  registrujSe() {

    if (!this.email || !this.password) {
      alert('Popunite sva polja.');
      return;
    }

    this.authService.registracija(
      this.email,
      this.password
    ).subscribe({

      next: () => {
        alert('Uspešna registracija!');
        this.router.navigate(['/login']);
      },

      error: (err) => {
        console.log(err);
        alert('Greška prilikom registracije.');
      }
    });
  }
}