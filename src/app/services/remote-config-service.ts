import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireRemoteConfig } from '@angular/fire/compat/remote-config';
import { getRemoteConfig, getValue } from '@angular/fire/remote-config';
import * as CryptoJS from 'crypto-js';
import { AppConstants } from '../modules/shared/constants';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from './storage.service';


@Injectable({
  providedIn: 'root'
})
export class RemoteConfigService {
  encryptionKey = '@$H!$h_#UlW@n_Te@M-@nGuL@R';
  constructor(
    private remoteConfig: AngularFireRemoteConfig,
    private httpClient: HttpClient,
    private localStorageService: LocalStorageService
  ) { }

  configExists(configName) {
    return this.localStorageService.getItem(configName, true) != null
  }

  async getRemoteConfigData(configName) {
    console.log(configName);
    console.log(this.localStorageService.getItem(configName, true));
    if (this.configExists(configName)) {
      return this.localStorageService.getItem(configName, true);
    } else {
      await this.fetchRemoteConfigData(configName);
      return this.localStorageService.getItem(configName, true);
    }
  }

  async fetchRemoteConfigData(configName) {
    try {
      await AngularFireModule.initializeApp(environment.firebaseConfig),
        await this.remoteConfig.fetchAndActivate().then(() => {
          console.log("Ashwini");
        });
      const remoteConfig = await getRemoteConfig();
      remoteConfig.settings.minimumFetchIntervalMillis = 6 * 3600 * 1000;//6 hours in msec

      switch (configName) {
        case AppConstants.ADMIN_GLOBAL_CONFIG:
          let tempValue = getValue(remoteConfig, 'adminGlobalConfig');
          let tempObject = JSON.parse(JSON.stringify(tempValue));
          let tempValueParse = JSON.parse(tempObject._value);
          // this.setLocalStorageItem(AppConstants.ADMIN_GLOBAL_CONFIG, JSON.stringify(tempValueParse));
          return tempValueParse;
        case AppConstants.SCHEDULE_CALL_REMOTE_CONFIG:
          let scheduleCallJson = getValue(remoteConfig, 'scheduleCallJson');
          let scheduleCallJsonObject = JSON.parse(JSON.stringify(scheduleCallJson));
          let RemoteConfigScheduleCallJson = JSON.parse(scheduleCallJsonObject._value);
          this.setLocalStorageItem(AppConstants.SCHEDULE_CALL_REMOTE_CONFIG, JSON.stringify(RemoteConfigScheduleCallJson));
          return RemoteConfigScheduleCallJson;
      }

    } catch (e) {
      switch (configName) {
        case AppConstants.ADMIN_GLOBAL_CONFIG:
          this.httpClient.get('./assets/jsons/adminGlobalConfig.json')
            .subscribe((result: any) => {
              let tempObject = JSON.parse(JSON.stringify(result));
              this.setLocalStorageItem(AppConstants.ADMIN_GLOBAL_CONFIG, JSON.stringify(tempObject));

            }, error => {
            });
          break;
        case AppConstants.SCHEDULE_CALL_REMOTE_CONFIG:
          this.httpClient.get('./assets/jsons/remote_config_schedule_call.json')
            .subscribe((result: any) => {
              let RemoteConfigScheduleCallJson = JSON.parse(JSON.stringify(result));
              this.setLocalStorageItem(AppConstants.SCHEDULE_CALL_REMOTE_CONFIG, JSON.stringify(RemoteConfigScheduleCallJson));
            }, error => {
            });
          break;
      }
    }

  }
  // The get method is use for decrypt the value.
  get(keys) {
    const abc = sessionStorage.getItem(keys);
    if (environment.production && abc !== null && abc !== undefined && abc !== '') {
      return abc;
    } else {
      return abc;
    }
  }

  setLocalStorageItem(key, value) {
    let enc: any;
    if (environment.production) {
      enc = CryptoJS.AES.encrypt(value, this.encryptionKey).toString();
      localStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, value);
    }
  }

  getLocalStorageItem(keys) {
    const abc = localStorage.getItem(keys);
    if (environment.production && abc !== null && abc !== undefined && abc !== '') {
      return abc;
    } else {
      return abc;
    }
  }

}
