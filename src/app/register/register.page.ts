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

  this.authService
    .registracija(this.email, this.password)
    .subscribe({

      next: (res) => {

        const uid = res.localId;

        const korisnik = {
          ime: this.ime,
          prezime: this.prezime,
          email: this.email
        };

        this.authService
          .sacuvajKorisnika(uid, korisnik)
          .subscribe({

            next: () => {
              alert('Uspešna registracija!');
              this.router.navigate(['/login']);
            },

            error: (err) => {
              console.log(err);
            }
          });
      },
error: (err) => {
  console.log(err);
  alert('Greška pri registraciji');
}
    });
}

}