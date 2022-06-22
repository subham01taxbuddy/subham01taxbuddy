import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

const matomoScript = document.createElement('script');
matomoScript.innerHTML = environment.externalScripts['matomo'];
matomoScript.id = '_matomo_script_tag';
matomoScript.type = 'text/javascript';
document.head.appendChild(matomoScript);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
