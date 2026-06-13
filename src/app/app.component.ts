import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {

  isAdmin = false;

  constructor(
    private menuCtrl: MenuController,
    private router: Router
  ) {

    this.ucitajUlogu();

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.menuCtrl.close();

    
        this.ucitajUlogu();
      }
    });
  }

  ucitajUlogu() {
    const userString = localStorage.getItem('user');

    if (userString) {
      const user = JSON.parse(userString);
      this.isAdmin = user.role === 'admin';
    } else {
      this.isAdmin = false;
    }
  }
}