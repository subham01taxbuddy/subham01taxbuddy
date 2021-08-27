import 'hammerjs';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import Auth from '@aws-amplify/auth/lib';

Auth.configure(environment.AMPLIFY_CONFIG);

if (environment.production) {
  enableProdMode();
}

const knowlarityScript = document.createElement('script');
knowlarityScript.innerHTML = `var URL = "https://konnectprodstream3.knowlarity.com:8200/update-stream/560397a2-d875-478b-8003-cc4675e9a0eb/konnect"
                              var knowlarityData = [];
                              var aa = 0;
                              source = new EventSource(URL);
                              source.onmessage = function (event) {
                            	var data = JSON.parse(event.data)
                            	// console.log('Received an event .......');
                            	// console.log(data);
                              
                              if(data.event_type === "ORIGINATE" && data.call_direction === "Inbound"){
                                knowlarityData.push(data);
                                // console.log("knowlarityData: ",knowlarityData)
                                localStorage.setItem('INBOND_KNOWLARITY', JSON.stringify(knowlarityData));
                            }
                         }`
knowlarityScript.id = '_webengage_script_tag';
knowlarityScript.type = 'text/javascript';
document.head.appendChild(knowlarityScript);

platformBrowserDynamic().bootstrapModule(AppModule);
