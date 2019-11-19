import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserMsService {
  headers: any;
  userObj: any;
  TOKEN: any;
  microService: string = '/txbdy_ms_user';
  constructor(private httpClient: HttpClient, ) {
    this.userObj = JSON.parse(localStorage.getItem('UMD'));
   }

  getMethod<T>(...param): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    // this.headers.append('Authorization', 'Bearer ' + this.TOKEN);
    console.log('update Param', param);
    return this.httpClient.get<T>(environment.url + this.microService + param[0], { headers: this.headers });
    // .map(response => response.json())
  }

  patchMethod<T>(...param): Observable<T> {
    this.userObj = JSON.parse(localStorage.getItem('UMD'));
    this.TOKEN = (this.userObj) ? this.userObj.id_token : null;
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    this.headers.append('Authorization', 'Bearer ' + this.TOKEN);
    console.log('update Param', param);
    return this.httpClient.patch<T>(environment.url + this.microService + param[0], param[1], { headers: this.headers });
    // .map(response => response.json())
  }

  putMethod<T>(...param): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    console.log('update Param', param);
    return this.httpClient.put<T>(environment.url + this.microService + param[0], param[1], { headers: this.headers });
    // .map(response => response.json())
  }
}
