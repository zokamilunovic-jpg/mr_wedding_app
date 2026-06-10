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

  /**
   * 1. REGISTRACIJA NOVOG KORISNIKA
   */
  registracija(email: string, lozinka: string): Observable<any> {
    // URL za registraciju (signUp) sa tvojim API ključem
    const url = `${this.authUrl}signUp?key=${environment.firebaseApiKey}`;
    
    const teloZahteva = {
      email: email,
      password: lozinka,
      returnSecureToken: true
    };

    return this.http.post(url, teloZahteva);
  }

  //cuvanje korisnika u bazi
  sacuvajKorisnika(uid: string, korisnik: any) {
  return this.http.put(
    `${environment.databaseUrl}/users/${uid}.json`,
    korisnik
  );
}



  /**
   * 2. LOGIN POSTOJEĆEG KORISNIKA
   */
  login(email: string, lozinka: string): Observable<any> {
    // URL za login (signInWithPassword) sa tvojim API ključem
    const url = `${this.authUrl}signInWithPassword?key=${environment.firebaseApiKey}`;
    
    const teloZahteva = {
      email: email,
      password: lozinka,
      returnSecureToken: true
    };

    return this.http.post(url, teloZahteva).pipe(
      tap((odgovor: any) => {
        // Kada je login uspešan, Firebase nam vraća lokalni ID korisnika (UID) i Token.
        // Sačuvaćemo ih u memoriju telefona/browsera (LocalStorage) da aplikacija zna ko je ulogovan.
        localStorage.setItem('userId', odgovor.localId);
        localStorage.setItem('token', odgovor.idToken);
      })
    );
  }

  getUser(uid: string) {
  return this.http.get(
    `${environment.databaseUrl}/users/${uid}.json`
  );
}  

  /**
   * 3. ODJAVA KORISNIKA (LOGOUT)
   */
  logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
  }
}