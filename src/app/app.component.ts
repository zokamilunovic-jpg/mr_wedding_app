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
 constructor(
    private menuCtrl: MenuController,
    private router: Router
  ) {

   
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.menuCtrl.close();
      }
    });
}
}
