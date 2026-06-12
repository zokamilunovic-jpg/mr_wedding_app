import { Component } from '@angular/core';
import { ReservationService } from '../services/reservation';
import { AlertController } from '@ionic/angular'; // <-- Dodat uvoz za prozor sa uslugama
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
  totalPrice = 0; // Ovde čuvamo ukupnu cenu

  // Definisan cenovnik dodatnih usluga
  servicesPrices: { [key: string]: number } = {
    'decor': 200,
    'music': 300,
    'photo': 150
  };

  // Niz u kojem čuvamo ključeve trenutno odabranih usluga
  selectedServices: string[] = [];

  constructor(
    private reservationService: ReservationService,
    private alertController: AlertController // Injektovan alertController
  ) {}

  // Funkcija koja otvara prozor sa slike za odabir usluga
  async openServicesModal() {
    const alert = await this.alertController.create({
      header: 'Izaberite usluge',
      inputs: [
        {
          type: 'checkbox',
          label: 'decor (200 EUR)',
          value: 'decor',
          checked: this.selectedServices.includes('decor')
        },
        {
          type: 'checkbox',
          label: 'music (300 EUR)',
          value: 'music',
          checked: this.selectedServices.includes('music')
        },
        {
          type: 'checkbox',
          label: 'photo (150 EUR)',
          value: 'photo',
          checked: this.selectedServices.includes('photo')
        }
      ],
      buttons: [
        {
          text: 'OTKAŽI',
          role: 'cancel'
        },
        {
          text: 'POTVRDI',
          handler: (data: string[]) => {
            this.selectedServices = data;
            this.calculatePrice(); // Ponovo računaj cenu nakon odabira usluga
          }
        }
      ]
    });

    await alert.present();
  }

  // Računanje cene: brojGostiju * 40 + suma selektovanih usluga
  calculatePrice() {
    const basePrice = (this.guestsCount || 0) * 40;
    
    let servicesSum = 0;
    this.selectedServices.forEach(serviceKey => {
      servicesSum += this.servicesPrices[serviceKey] || 0;
    });

    this.totalPrice = basePrice + servicesSum;
  }

  // Poziva se automatski kada korisnik menja broj gostiju na ekranu
  onGuestsCountChange() {
    this.calculatePrice();
  }

  sendReservation() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Korisnik nije ulogovan.');
      return;
    }

    if (!this.reservationDate) {
      alert('Molimo izaberite datum.');
      return;
    }

    // U objekat dodajemo cenu (price) i odabrane dodatne usluge (services)
    const reservation = {
      userId: userId,
      date: this.reservationDate,
      guestsCount: this.guestsCount,
      price: this.totalPrice,
      services: this.selectedServices,
      status: 'pending'
    };

    this.reservationService
      .createReservation(reservation, userId)
      .subscribe({
        next: () => {
          alert('Rezervacija uspešno poslata');
          this.reservationDate = '';
          this.guestsCount = 0;
          this.totalPrice = 0;
          this.selectedServices = [];
        },
        error: (err) => {
          console.error('Greška pri slanju:', err);
          alert('Greška prilikom kreiranja rezervacije.');
        }
      });
  }
}