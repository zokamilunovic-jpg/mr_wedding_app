import { Component } from '@angular/core';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  prijaviSe() {
    if (this.email && this.password) {
      this.authService.login(this.email, this.password).subscribe({
        next: (odgovor) => {
          console.log('Uspešan login:', odgovor);
          alert('Dobrodošli!');
          this.router.navigate(['/home']);
        },
        error: (greška) => {
          console.error('Greška pri loginu:', greška);
          alert('Neuspešna prijava. Proverite podatke.');
        }
      });
    } else {
      alert('Molimo popunite oba polja.');
    }
  }

  registrujSe() {
    if (this.email && this.password) {
      this.authService.registracija(this.email, this.password).subscribe({
        next: (odgovor) => {
          console.log('Uspešna registracija:', odgovor);
          alert('Nalog je kreiran! Sada se možete prijaviti.');
        },
        error: (greška) => {
          console.error('Greška pri registraciji:', greška);
          alert('Greška prilikom registracije.');
        }
      });
    } else {
      alert('Unesite email i lozinku za registraciju.');
    }
  }
}