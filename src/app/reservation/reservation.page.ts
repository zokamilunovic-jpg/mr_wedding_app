import { Component } from '@angular/core';
import { ReservationService } from '../services/reservation';
import { AlertController } from '@ionic/angular';
//import { map } from 'rxjs/operators';

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

  isCalendarModalOpen = false;
  temporaryDate = ''; 
  minDate = ''; 
  takenDates: string[] = [];

  servicesPrices: { [key: string]: number } = {
    'decor': 200,
    'music': 300,
    'photo': 150
  };

  selectedServices: string[] = [];

  constructor(
    private reservationService: ReservationService,
    private alertController: AlertController
  ) {}

  ionViewWillEnter() {
    this.calculateMinDate();
    this.loadTakenDates();
  }

  calculateMinDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.minDate = `${yyyy}-${mm}-${dd}`;
  }

  loadTakenDates() {
    this.reservationService.getAllReservations().subscribe({
      next: (data: any) => {
        const dates: string[] = [];
        if (data) {
          for (const userId in data) {
            if (data.hasOwnProperty(userId) && data[userId] && typeof data[userId] === 'object') {
              for (const resId in data[userId]) {
                if (data[userId].hasOwnProperty(resId)) {
                  const res = data[userId][resId];
                  

                  if (res && (res.date || res.datum) && res.status !== 'rejected') {
                    const dateValue = res.date || res.datum;
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

  isDateAllowed = (dateString: string) => {
    const dateToCheck = dateString.split('T')[0];
    
    return !this.takenDates.includes(dateToCheck);
  };


  openCalendarModal(isOpen: boolean) {
    this.isCalendarModalOpen = isOpen;
    if (isOpen) {
      this.temporaryDate = this.reservationDate ? this.reservationDate : new Date().toISOString();
    }
  }

  confirmDate() {
    if (this.temporaryDate) {
      this.reservationDate = this.temporaryDate.split('T')[0];
    }
    this.openCalendarModal(false);
  }

  
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

  calculatePrice() {
    const basePrice = (this.guestsCount || 0) * 40;
    
    let servicesSum = 0;
    this.selectedServices.forEach(serviceKey => {
      servicesSum += this.servicesPrices[serviceKey] || 0;
    });

    this.totalPrice = basePrice + servicesSum;
  }

  
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


    if (!this.guestsCount || this.guestsCount <= 0) {
  alert('Molimo unesite broj gostiju.');
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
          
          
          this.loadTakenDates();
        },
        error: (err) => {
          console.error('Greška pri slanju:', err);
          alert('Greška prilikom kreiranja rezervacije.');
        }
      });
  }
}