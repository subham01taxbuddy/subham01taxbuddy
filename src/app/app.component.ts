
import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { MatomoService } from './services/matomo.service';
declare function matomo(title: any, url: any, event: any, scripdId: any);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'app works!';

  constructor(
    private router: Router,
    private matomoService:MatomoService
    ) {
    // router.events.subscribe((val) => {
    //   if (val instanceof NavigationEnd) {
    //     if (val.urlAfterRedirects != '/login') {
    //       this.matomoService.trackMatomoEvents(val.urlAfterRedirects,'HEARTBEAT');         
    //     }
    //   }
    // });
  }
}
