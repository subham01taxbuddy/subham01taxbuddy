import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// Scripts loaded on all environments
const webengageScript = document.createElement('script');
webengageScript.innerHTML = environment.externalScripts['webengage'];
webengageScript.id = '_webengage_script_tag';
webengageScript.type = 'text/javascript';
document.head.appendChild(webengageScript);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
