import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { RemoteConfigService } from './remote-config-service';
import { AppConstants } from '../modules/shared/constants';

@Injectable({
  providedIn: 'root',
})
export class MobileEncryptDecryptService {
  // remoteConfig
  // constructor(
  //   private remoteConfigService: RemoteConfigService,
  // ){
  //   this.getRemoteConfigData();
  // }

  // async getRemoteConfigData() {
  //   this.remoteConfig = await this.remoteConfigService.getRemoteConfigData(AppConstants.ADMIN_GLOBAL_CONFIG);
  //   console.log('learn on the go config obj', this.remoteConfig);
  // }

  secretKey = 'TAXBUDDY';

  encrypt(value: string): string {
    return CryptoJS.AES.encrypt(value, this.secretKey.trim()).toString();
  }

  decrypt(textToDecrypt: string): string {
    return CryptoJS.AES.decrypt(textToDecrypt, this.secretKey.trim()).toString(CryptoJS.enc.Utf8);
  }

  decryptData(encryptedData: string): string | null {
    try {
      let ciphertext = CryptoJS.enc.Base64.parse(encryptedData);
      const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });
      const key = CryptoJS.SHA1(this.secretKey).toString(CryptoJS.enc.Hex).slice(0, 32);
      const secretKey = CryptoJS.enc.Hex.parse(key);
      const decrypted = CryptoJS.AES.decrypt( cipherParams , secretKey, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      });
      const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
      console.log(plaintext)
      return plaintext;
    } catch (error) {
      console.error('Error while decrypting:', error);
      return null;
    }
  }

}
