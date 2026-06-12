import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../services/reservation';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  reservations: any[] = [];

  constructor(private reservationService: ReservationService) {}

  ngOnInit() {
    this.loadReservations();
  }

  loadReservations() {
    // Promenjeno na 'userId'
    const userId = localStorage.getItem('userId');

    if (!userId) {
      console.warn('Korisnik nije ulogovan.');
      return;
    }

    this.reservationService.getReservations(userId)
      .subscribe((data: any) => {

        const result: any[] = [];

        for (let key in data) {
          if (data.hasOwnProperty(key)) {
            result.push({
              id: key,
              ...data[key]
            });
          }
        }

        this.reservations = result;
      });
  }
}