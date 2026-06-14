import { Component } from '@angular/core';
import { ReservationService } from '../services/reservation';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: false,
})
export class AdminPage {

  allRequests: any[] = [];

  constructor(private reservationService: ReservationService,
    private authService: AuthService) { }

  ionViewWillEnter() {
    this.loadAllRequests();
  }

  loadAllRequests() {
    this.reservationService.getAllReservations().subscribe({
      next: (data: any) => {
        const flattenedRequests: any[] = [];


        if (!data) {
          this.allRequests = [];
          return;
        }


        for (const userId in data) {
          if (data.hasOwnProperty(userId)) {

            const userReservations = data[userId];

            if (userReservations && typeof userReservations === 'object') {

              for (const resId in userReservations) {
                if (userReservations.hasOwnProperty(resId)) {

                  const reservation = userReservations[resId];


                  if (reservation && (reservation.date || reservation.datum)) {

                    flattenedRequests.push({
                      id: resId,
                      userId: userId,
                      ...reservation
                    });

                    this.authService.getUser(userId).subscribe(user => {
                      const request = flattenedRequests.find(r => r.id === resId);

                      if (request) {
                        request.ime = (user as any).ime;
                        request.prezime = (user as any).prezime;
                        request.email = (user as any).email;
                      }
                    });

                  }
                }
              }
            }

          }
        }

        this.allRequests = flattenedRequests.sort((a, b) => {
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status !== 'pending' && b.status === 'pending') return 1;
          return 0;
        });
      },
      error: (err) => {
        console.error('Greška pri dohvatanju svih rezervacija za admina:', err);
      }
    });
  }


  updateStatus(reservationId: string, userId: string, newStatus: string) {
    const updateData = { status: newStatus };


    this.reservationService.updateReservation(reservationId, updateData, userId).subscribe({
      next: () => {
        alert(`Rezervacija je uspešno ${newStatus === 'approved' ? 'odobrena' : 'odbijena'}.`);
        this.loadAllRequests();
      },
      error: (err) => {
        console.error('Greška pri ažuriranju statusa:', err);
        alert('Došlo je do greške prilikom promene statusa.');
      }
    });
  }
}
