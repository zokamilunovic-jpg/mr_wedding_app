import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../services/reservation';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  reservations: any[] = [];
  allServices: any[] = []; 

  constructor(
    private reservationService: ReservationService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadReservations();
    this.loadAvailableServices(); 
  }

  loadReservations() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.warn('Korisnik nije ulogovan.');
      return;
    }

    this.reservationService.getReservations(userId).subscribe((data: any) => {
      this.reservations = Object.keys(data || {}).map(key => ({ 
        id: key, 
        ...data[key] 
      }));
    });
  }

  loadAvailableServices() {
    this.reservationService.getServices().subscribe((res: any) => {
      this.allServices = [];
      if (res) {
        const keys = Object.keys(res);
        for (let id of keys) {
          if (res[id] && res[id].name) { 
            this.allServices.push({
              id: id,
              name: res[id].name,
              price: res[id].price || 0
            });
          }
        }
        console.log('Učitane usluge za izmenu:', this.allServices);
      }
    });
  }

  // Korak 1: Izmena datuma i broja gostiju
  async openUpdateModal(reservation: any) {
    if (this.allServices.length === 0) {
      this.loadAvailableServices();
    }

    const alert = await this.alertCtrl.create({
      header: '1. Osnovni podaci',
      cssClass: 'roze-alert',
      inputs: [
        { 
          name: 'date', 
          type: 'date', 
          value: reservation.date 
        },
        { 
          name: 'guestsCount', 
          type: 'number', 
          value: reservation.guestsCount, 
          min: 1 
        }
      ],
      buttons: [
        { text: 'Otkaži', role: 'cancel' },
        { 
          text: 'Dalje ➔', 
          handler: (data) => {
            setTimeout(() => {
              this.openServicesModal(reservation, data.date, parseInt(data.guestsCount, 10));
            }, 100);
          }
        }
      ]
    });
    await alert.present();
  }

  // Korak 2: Izmena dodatnih usluga, računanje cene i reset statusa
  async openServicesModal(reservation: any, newDate: string, newGuests: number) {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const alert = await this.alertCtrl.create({
      header: '2. Izaberi usluge',
      cssClass: 'roze-alert',
      inputs: this.allServices.map(s => ({
        type: 'checkbox',
        label: `${s.name} (${s.price} EUR)`,
        value: s.id,
        checked: reservation.serviceIds && reservation.serviceIds.includes(s.id)
      })),
      buttons: [
        { 
          text: 'Nazad', 
          handler: () => this.openUpdateModal(reservation) 
        },
        {
          text: 'Sačuvaj',
          handler: (selectedServiceIds: string[]) => {
            
            // Logika za računanje cene
            const basePrice = (newGuests || 0) * 40;
            let servicesSum = 0;

            if (selectedServiceIds && selectedServiceIds.length > 0) {
              selectedServiceIds.forEach(serviceId => {
                const foundService = this.allServices.find(s => s.id === serviceId);
                if (foundService) {
                  servicesSum += foundService.price;
                }
              });
            }

            const calculatedTotalPrice = basePrice + servicesSum;

            // Priprema podataka za Firebase
            const updatedData = {
              date: newDate,
              guestsCount: newGuests,
              serviceIds: selectedServiceIds || [],
              price: calculatedTotalPrice,
              status: 'pending' // <--- OVO PONOVO VRAĆA REZERVACIJU "NA ČEKANJE" ZA ADMINA!
            };

            this.reservationService.updateReservation(reservation.id, updatedData, userId).subscribe({
              next: () => {
                this.prikaziToast('Izmene su poslate adminu na ponovno odobrenje!');
                this.loadReservations(); // Osvežavamo tabelu
              },
              error: (err) => console.error('Greška pri čuvanju:', err)
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async prikaziToast(poruka: string) {
    const toast = await this.toastCtrl.create({ 
      message: poruka, 
      duration: 2000, 
      position: 'bottom', 
      color: 'danger' 
    });
    toast.present();
  }
}