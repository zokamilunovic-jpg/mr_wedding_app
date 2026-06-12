import { Component } from '@angular/core';
import { ReservationService } from '../services/reservation';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: false,
})
export class AdminPage {

  allRequests: any[] = [];

  constructor(private reservationService: ReservationService) { }

  // Koristimo Ionic životni ciklus umesto ngOnInit kako bi se podaci osvežili pri svakom ulasku na ekran
  ionViewWillEnter() {
    this.loadAllRequests();
  }

  loadAllRequests() {
    this.reservationService.getAllReservations().subscribe({
      next: (data: any) => {
        const flattenedRequests: any[] = [];

        // 1. Prolazimo kroz sve korisnike (prvi nivo Firebase objekta)
        for (const userId in data) {
          if (data.hasOwnProperty(userId)) {
            
            // 2. Prolazimo kroz sve rezervacije tog specifičnog korisnika (drugi nivo)
            for (const resId in data[userId]) {
              if (data[userId].hasOwnProperty(resId)) {
                
                flattenedRequests.push({
                  id: resId,             // Firebase ID rezervacije (npr. -OurHbkNW...)
                  userId: userId,         // ID korisnika kojem rezervacija pripada
                  ...data[userId][resId]  // date, guestsCount, price, status...
                });

              }
            }

          }
        }

        // 3. Sortiramo listu tako da svi novi zahtevi (koji su 'pending') budu na samom vrhu
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

  // Funkcija koja menja status u Firebase bazi na osnovu kliknutog dugmeta (Prihvati / Odbij)
  updateStatus(reservationId: string, userId: string, newStatus: string) {
    const updateData = { status: newStatus };

    // Šaljemo izmenu kroz servis (servis koristi PATCH metodu)
    this.reservationService.updateReservation(reservationId, updateData, userId).subscribe({
      next: () => {
        alert(`Rezervacija je uspešno ${newStatus === 'approved' ? 'odobrena' : 'odbijena'}.`);
        this.loadAllRequests(); // Ponovo punimo listu kako bi se promena odmah videla na ekranu
      },
      error: (err) => {
        console.error('Greška pri ažuriranju statusa:', err);
        alert('Došlo je do greške prilikom promene statusa.');
      }
    });
  }
}
