import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MatomoService {

  constructor(private router: Router) { }

  trackMatomoEvents(url, eventName) {
    //matomo('Priority Calling Board', url, ['trackEvent', 'BOUSERTRACKING', 'CLICK', eventName], environment.matomoScriptId);

  }
}
