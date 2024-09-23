import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { RemoteConfigService } from './remote-config-service';
import { AppConstants } from '../modules/shared/constants';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MobileEncryptDecryptService {
  remoteConfig: any;
  secretKey: any;

  constructor(private remoteConfigService: RemoteConfigService,private router: Router) {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      if (!this.secretKey) {
        console.log('true');
        this.getRemoteConfigData().then(() => {
          this.secretKey = this.remoteConfig?.decryptKeyForMobileNo;
        });
      }
    })
  }

  async getRemoteConfigData() {
    this.remoteConfig = await this.remoteConfigService.fetchRemoteConfigData(
      AppConstants.ADMIN_GLOBAL_CONFIG
    );
  }

  encrypt(value: string): string {
    return CryptoJS.AES.encrypt(value, this.secretKey.trim()).toString();
  }

  decrypt(textToDecrypt: string): string {
    return CryptoJS.AES.decrypt(textToDecrypt, this.secretKey.trim()).toString(
      CryptoJS.enc.Utf8
    );
  }

  decryptData(encryptedData: string): string | null {
    let ciphertext = CryptoJS.enc.Base64.parse(encryptedData);
    const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });
    const key = CryptoJS.SHA1(this.secretKey)
      .toString(CryptoJS.enc.Hex)
      .slice(0, 32);
    const secretKey = CryptoJS.enc.Hex.parse(key);
    const decrypted = CryptoJS.AES.decrypt(cipherParams, secretKey, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
    return plaintext;
  }
}
