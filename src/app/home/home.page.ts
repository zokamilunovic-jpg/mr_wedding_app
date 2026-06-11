import { Component } from '@angular/core';
import { ReservationService } from '../services/reservation';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
   styleUrls: ['./home.page.scss'],
  standalone:false,
})
export class HomePage {

  reservationDate = '';

  constructor(
    private reservationService: ReservationService
  ) {}

  sendReservation() {

    const reservation = {

      userId: localStorage.getItem('uid'),

      date: this.reservationDate,

      status: 'pending'

    };

    this.reservationService
      .createReservation(reservation)
      .subscribe({

        next: () => {

          alert('Rezervacija poslata');

          this.reservationDate = '';

        },

        error: (err) => {

          console.log(err);

          alert('Greška');

        }

      });

  }

}