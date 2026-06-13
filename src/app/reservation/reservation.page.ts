import { Component } from '@angular/core';
import { ReservationService } from '../services/reservation';
import { AlertController } from '@ionic/angular';
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
  totalPrice = 0;

  // Logika za modal kalendara
  isCalendarModalOpen = false;
  temporaryDate = ''; 
  minDate = ''; // Blokira prošlost u kalendaru
  takenDates: string[] = []; // Ovde čuvamo datume pokupljene iz Firebase-a

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
    private alertController: AlertController
  ) {}

  // Koristimo Ionic životni ciklus da učitamo bazu čim korisnik otvori ekran
  ionViewWillEnter() {
    this.calculateMinDate();
    this.loadTakenDates();
  }

  // Računamo današnji datum u ISO formatu (YYYY-MM-DD) kako bismo zaključali prošlost
  calculateMinDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.minDate = `${yyyy}-${mm}-${dd}`;
  }

  // Povlačimo sve postojeće rezervacije preko HttpClient servisa i čuvamo zauzete datume
  loadTakenDates() {
    this.reservationService.getAllReservations().subscribe({
      next: (data: any) => {
        const dates: string[] = [];
        if (data) {
          // Prolazimo kroz sve korisnike i njihove rezervacije (isto kao na adminu)
          for (const userId in data) {
            if (data.hasOwnProperty(userId) && data[userId] && typeof data[userId] === 'object') {
              for (const resId in data[userId]) {
                if (data[userId].hasOwnProperty(resId)) {
                  const res = data[userId][resId];
                  
                  // Uzimamo datume svih odobrenih i na čekanju rezervacija (isključujemo samo odbijene ako želiš)
                  if (res && (res.date || res.datum) && res.status !== 'rejected') {
                    const dateValue = res.date || res.datum;
                    // Standardizujemo format na YYYY-MM-DD (odsecamo vreme ako postoji)
                    const formattedDate = dateValue.split('T')[0];
                    dates.push(formattedDate);
                  }
                }
              }
            }
          }
        }
        this.takenDates = dates;
      },
      error: (err) => {
        console.error('Greška pri dohvatanju zauzetih datuma:', err);
      }
    });
  }

  // FUNKCIJA KOJU KORISTI <ion-datetime> ZA SVAKI DAN NA KALENDARU
  isDateAllowed = (dateString: string) => {
    // Odsecamo vreme iz ISO stringa koji Ionic generiše (npr. '2026-06-13T00:00:00...' postaje '2026-06-13')
    const dateToCheck = dateString.split('T')[0];
    
    // Ako se datum nalazi u nizu zauzetih datuma, vraća false i onemogućava ga
    return !this.takenDates.includes(dateToCheck);
  };

  // Upravljanje otvaranjem i zatvaranjem modala sa kalendarom
  openCalendarModal(isOpen: boolean) {
    this.isCalendarModalOpen = isOpen;
    if (isOpen) {
      // Kada se otvara, postavljamo kalendar na trenutno izabrani datum ili na današnji dan
      this.temporaryDate = this.reservationDate ? this.reservationDate : new Date().toISOString();
    }
  }

  // Potvrda odabranog datuma unutar modala
  confirmDate() {
    if (this.temporaryDate) {
      // Čuvamo čist YYYY-MM-DD string u našu glavnu promenljivu
      this.reservationDate = this.temporaryDate.split('T')[0];
    }
    this.openCalendarModal(false);
  }

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
            this.calculatePrice();
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
          
          // Nakon uspešnog slanja, odmah osvežavamo listu zauzetih termina
          this.loadTakenDates();
        },
        error: (err) => {
          console.error('Greška pri slanju:', err);
          alert('Greška prilikom kreiranja rezervacije.');
        }
      });
  }
}