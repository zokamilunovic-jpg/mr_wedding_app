import { Component } from '@angular/core';
import { ReservationService } from '../services/reservation';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-reservation',
  templateUrl: 'reservation.page.html',
  styleUrls: ['./reservation.page.scss'],
  standalone: false,
})
export class ReservationPage {

  reservationDate = '';
  guestsCount = 0;
  currentStatus = ''; // 'pending', 'approved', 'rejected'
  services: any = [];
  selectedServiceIds: string[] = [];
  servicesTotal = 0;
  userReservations: any[] = [];

  constructor(
    private reservationService: ReservationService
  ) { }

  ionViewWillEnter() {
    this.checkCurrentReservation();
    this.loadServices();
  }

  checkCurrentReservation() {
    
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.reservationService.getReservations(userId)
      .pipe(
        map((response: any) => {
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
          this.userReservations = reservations;

          if (reservations.length > 0) {
            const lastReservation = reservations[reservations.length - 1];
            this.currentStatus = lastReservation.status;
          } else {
            this.currentStatus = '';
          }
        },
        error: (err) => {
          console.error('Greška pri dohvatanju rezervacije:', err);
        }
      });
  }

loadServices() {
  this.reservationService.getServices().subscribe((res: any) => {
    this.services = [];
    if (res) {
      Object.keys(res).forEach((id) => {
        
        if (res[id]) { 
          this.services.push({
            id: id,                                    
            name: res[id].name || 'Bez naziva', 
            price: res[id].price || 0 
          });
        }
      });
      console.log('Učitane usluge:', this.services); 
    }
  });
}
sendReservation() {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    alert('Korisnik nije ulogovan.');
    return;
  }

  const reservation = {
    userId: userId,
    date: this.reservationDate,
    guestsCount: this.guestsCount,
    serviceIds: this.selectedServiceIds,
    status: 'pending'
  };

  this.reservationService
    .createReservation(reservation, userId)
    .subscribe({
      next: () => {
        alert('Rezervacija uspešno poslata');
        
       
        this.reservationDate = '';          
        this.guestsCount = 0;             
        this.selectedServiceIds = [];      
        
        this.checkCurrentReservation();   
      },
      error: (err) => {
        console.error('Greška pri slanju:', err);
        alert('Greška prilikom kreiranja rezervacije.');
      }
    });
}
}