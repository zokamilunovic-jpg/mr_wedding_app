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

        // Ako je baza potpuno prazna, resetujemo niz i prekidamo izvršavanje
        if (!data) {
          this.allRequests = [];
          return;
        }

        // 1. Prolazimo kroz sve korisnike (prvi nivo Firebase objekta)
        for (const userId in data) {
          if (data.hasOwnProperty(userId)) {
            
            const userReservations = data[userId];
            
            // Provera da li korisnik uopšte ima objekat sa rezervacijama (da preskočimo prazne čvorove)
            if (userReservations && typeof userReservations === 'object') {
              
              // 2. Prolazimo kroz sve rezervacije tog specifičnog korisnika (drugi nivo)
              for (const resId in userReservations) {
                if (userReservations.hasOwnProperty(resId)) {
                  
                  const reservation = userReservations[resId];

                  // KLJUČNA IZMENA: Ubacujemo u listu SAMO ako rezervacija ima definisan datum
                  // (Proveri da li ti se u bazi polje zove 'date' ili 'datum' i prilagodi ako treba)
                  if (reservation && (reservation.date || reservation.datum)) {
                    
                    flattenedRequests.push({
                      id: resId,                             // Firebase ID rezervacije (npr. -OurHbkNW...)
                      userId: userId,                        // ID korisnika kojem rezervacija pripada
                      ...reservation                         // date, guestsCount, price, status...
                    });

                  }
                }
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
