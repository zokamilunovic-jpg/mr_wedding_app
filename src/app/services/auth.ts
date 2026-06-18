import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Glavni URL za Firebase Authentication API
  private authUrl = 'https://identitytoolkit.googleapis.com/v1/accounts:';

  constructor(private http: HttpClient) { }

  
  registracija(email: string, lozinka: string): Observable<any> {
    const url = `${this.authUrl}signUp?key=${environment.firebaseApiKey}`;
    
    const teloZahteva = {
      email: email,
      password: lozinka,
      returnSecureToken: true
    };

    return this.http.post(url, teloZahteva);
  }

  
  sacuvajKorisnika(uid: string, korisnik: any) {
    return this.http.put(
      `${environment.databaseUrl}/users/${uid}.json?auth=${this.getToken()}`,
      korisnik
    );
  }

 
  login(email: string, lozinka: string): Observable<any> {
    const url = `${this.authUrl}signInWithPassword?key=${environment.firebaseApiKey}`;
    
    const teloZahteva = {
      email: email,
      password: lozinka,
      returnSecureToken: true
    };

    return this.http.post(url, teloZahteva).pipe(
      tap((odgovor: any) => {
        localStorage.setItem('userId', odgovor.localId);
        localStorage.setItem('token', odgovor.idToken);
      })
    );
  }

  
  getToken(): string | null {
    return localStorage.getItem('token');
  }

 
  getUser(uid: string) {
    return this.http.get(
      `${environment.databaseUrl}/users/${uid}.json?auth=${this.getToken()}`
    );
  }

  logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
  }
}