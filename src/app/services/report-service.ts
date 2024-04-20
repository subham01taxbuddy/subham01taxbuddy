import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  headers: any;
  userObj: any;
  TOKEN: any;
  baseUrl: string = 'https://uat-api.taxbuddy.com/report'
  microService: string = '/report';
  constructor(private httpClient: HttpClient, private http: HttpClient) { }

  getMethod<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.get<T>(environment.url + this.microService + param[0], { headers: this.headers });
  }
  
  query<T>(query:any): Observable<T> {
    const iv = generateRandomAlphaNumeric(16);
    const encryptedQuery = encrypt(JSON.stringify(query), iv);
    const userData = JSON.parse(localStorage.getItem('UMD') || '');
    const TOKEN = userData ? userData.id_token : null;
    const headers = {
      'Authorization': 'Bearer ' + TOKEN,
      'iv':iv
    }
    return this.httpClient.get<T>(environment.url + this.microService + "/bo/query?query="+encodeURIComponent(encryptedQuery), { headers: headers });
  } 

  invoiceDownload(params: any) {
    const userData = JSON.parse(localStorage.getItem('UMD') || '');
    const TOKEN = userData ? userData.id_token : null;
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
    this.headers.append('Authorization', 'Bearer ' + TOKEN);
    return this.http.get(environment.url + this.microService + params, {
      headers: this.headers,
      responseType: 'blob',
    });
  }
}

const secretKey = "cYDffVW+lRRd2BKa0ZTEpJwEmrsLme/t";

function encrypt(text, iv) {
  return CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(secretKey), {
      iv: CryptoJS.enc.Utf8.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
  }).toString();
}

function decrypt(ciphertext, iv) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, CryptoJS.enc.Utf8.parse(secretKey), {
      iv: CryptoJS.enc.Utf8.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
  });
  return bytes.toString(CryptoJS.enc.Utf8);
}

function generateRandomAlphaNumeric(size) {
  const chars = 'ABCDEF23dsdfsdfGHIJKsdfLMNOPQSDFRSTU43fasdVWXYZ3sdf4SDF5abcSDFdefghijklmnopqrsSDFtuvwDDSFxyzsdfsdfhy0123456789';
  let result = '';
  for (let i = 0; i < size; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}