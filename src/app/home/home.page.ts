import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../services/reservation';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone:false,
})
export class HomePage implements OnInit {

  reservations: any[] = [];

  constructor(private reservationService: ReservationService) {}

  ngOnInit() {
    this.loadReservations();
  }

  loadReservations() {

    this.reservationService.getReservations()
      .subscribe((data: any) => {

        const uid = localStorage.getItem('uid');

        const result: any[] = [];

        for (let key in data) {

          if (data[key].userId === uid) {

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