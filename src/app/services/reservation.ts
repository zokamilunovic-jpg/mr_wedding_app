import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private dbUrl =
    'https://wedding-app-98beb-default-rtdb.europe-west1.firebasedatabase.app/';

  constructor(private http: HttpClient) {}

  // 1. Kreiranje rezervacije za specifičnog korisnika
  createReservation(reservation: any, userId: string) {
    return this.http.post(
      `${this.dbUrl}/reservations/${userId}.json`,
      reservation
    );
  }

  // 2. Uzimanje rezervacija SAMO za tog korisnika
  getReservations(userId: string): Observable<any> {
    return this.http.get(
      `${this.dbUrl}/reservations/${userId}.json`
    );
  }

  // 3. Brisanje tačne rezervacije unutar korisnikovog čvora
  deleteReservation(id: string, userId: string) {
    return this.http.delete(
      `${this.dbUrl}/reservations/${userId}/${id}.json`
    );
  }

  // 4. Izmena tačne rezervacije unutar korisnikovog čvora
  updateReservation(id: string, data: any, userId: string) {
    return this.http.patch(
      `${this.dbUrl}/reservations/${userId}/${id}.json`,
      data
    );
  }
}