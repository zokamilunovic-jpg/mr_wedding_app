import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth'; 

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private dbUrl =
    'https://wedding-app-98beb-default-rtdb.europe-west1.firebasedatabase.app/';

  constructor(
    private http: HttpClient,
    private authService: AuthService 
  ) {}

  createReservation(reservation: any, userId: string): Observable<any> {
    return this.http.post(
      `${this.dbUrl}/reservations/${userId}.json?auth=${this.authService.getToken()}`,
      reservation
    );
  }

  getReservations(userId: string): Observable<any> {
    return this.http.get(
      `${this.dbUrl}/reservations/${userId}.json?auth=${this.authService.getToken()}`
    );
  }

  deleteReservation(id: string, userId: string): Observable<any> {
    return this.http.delete(
      `${this.dbUrl}/reservations/${userId}/${id}.json?auth=${this.authService.getToken()}`
    );
  }

  updateReservation(id: string, data: any, userId: string): Observable<any> {
    return this.http.patch(
      `${this.dbUrl}/reservations/${userId}/${id}.json?auth=${this.authService.getToken()}`,
      data
    );
  }

  getServices(): Observable<any> {
    return this.http.get(
      `${this.dbUrl}/services.json?auth=${this.authService.getToken()}`
    );
  }

  getAllReservations(): Observable<any> {
    return this.http.get<any>(
      `${this.dbUrl}/reservations.json?auth=${this.authService.getToken()}`
    );
  }
}