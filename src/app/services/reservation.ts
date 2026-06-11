import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  // ⚠️ OVO ZAMENI SA SVOJIM FIREBASE URL-OM
  private dbUrl =
    'https://identitytoolkit.googleapis.com/v1/accounts:';

  constructor(private http: HttpClient) {}

  // ➕ KREIRANJE REZERVACIJE
  createReservation(reservation: any) {
    return this.http.post(
      `${this.dbUrl}/reservations.json`,
      reservation
    );
  }

  // 📥 UČITAVANJE SVIH REZERVACIJA
  getReservations() {
    return this.http.get(
      `${this.dbUrl}/reservations.json`
    );
  }

  // ❌ BRISANJE REZERVACIJE
  deleteReservation(id: string) {
    return this.http.delete(
      `${this.dbUrl}/reservations/${id}.json`
    );
  }

  // ✏️ UPDATE STATUSA (approve/reject)
  updateReservation(id: string, data: any) {
    return this.http.patch(
      `${this.dbUrl}/reservations/${id}.json`,
      data
    );
  }
}