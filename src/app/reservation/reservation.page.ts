import { Component } from '@angular/core';
import { ReservationService } from '../services/reservation';
import { map } from 'rxjs/operators'; // <-- Važan import za Firebase podatke

@Component({
  selector: 'app-reservation',
  templateUrl: 'reservation.page.html',
  styleUrls: ['./reservation.page.scss'],
  standalone: false,
})
export class ReservationPage {

  reservationDate = '';
  guestsCount = 0;
  currentStatus = ''; // Ovde čuvamo status: 'pending', 'approved', 'rejected'

  constructor(
    private reservationService: ReservationService
  ) {}

  // Pokreće se svaki put kada korisnik uđe na ekran
  ionViewWillEnter() {
    this.checkCurrentReservation();
  }

  checkCurrentReservation() {
    const uid = localStorage.getItem('uid');
    if (!uid) return;

    this.reservationService.getReservations()
      .pipe(
        map((response: any) => {
          // Transformišemo Firebase objekat objekata u niz koji možemo da filtriramo
          const reservationsArray = [];
          for (const key in response) {
            if (response.hasOwnProperty(key)) {
              reservationsArray.push({ id: key, ...response[key] });
            }
          }
          return reservationsArray;
        })
      )
      .subscribe({
        next: (reservations: any[]) => {
          // Pronalazimo rezervaciju koja pripada trenutno ulogovanom korisniku
          const userReservation = reservations.find(res => res.userId === uid);
          
          if (userReservation) {
            this.currentStatus = userReservation.status;
          } else {
            this.currentStatus = ''; // Ako nema rezervacije za ovog korisnika
          }
        },
        error: (err) => {
          console.error('Greška pri dohvatanju rezervacije:', err);
        }
      });
  }

  sendReservation() {
    const uid = localStorage.getItem('uid');
    if (!uid) {
      alert('Korisnik nije ulogovan.');
      return;
    }

    const reservation = {
      userId: uid,
      date: this.reservationDate,
      guestsCount: this.guestsCount,
      status: 'pending' // Početni status
    };

    this.reservationService
      .createReservation(reservation)
      .subscribe({
        next: () => {
          alert('Rezervacija poslata');
          this.currentStatus = 'pending'; // Odmah osvežavamo status na ekranu
          this.reservationDate = '';
          this.guestsCount = 0;
        },
        error: (err) => {
          console.error('Greška pri slanju:', err);
          alert('Greška');
        }
      });
  }
}