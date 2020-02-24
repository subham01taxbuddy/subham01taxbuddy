import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { InterceptorSkipHeader } from './token-interceptor';

@Injectable({
  providedIn: 'root'
})
export class UserMsService {
  headers: any;
  userObj: any;
  TOKEN: any;
  microService: string = '/user';
  constructor(private httpClient: HttpClient, ) { }

  getMethod<T>(...param): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    // this.headers.append('Authorization', 'Bearer ' + this.TOKEN);
    console.log('update Param', param);
    return this.httpClient.get<T>(environment.url + this.microService + param[0], { headers: this.headers });
    // .map(response => response.json())
  }

  getMethodInfo<T>(...param): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    //  this.headers.append('Authorization', 'Bearer ' + this.TOKEN);
    console.log('update Param', param);
    return this.httpClient.get<T>(environment.url + param[0], { headers: this.headers });
    // .map(response => response.json())
  }

  getUserDetail(...param) {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json'); 
    return this.httpClient.get(environment.url +'/user'+param[0], { headers: this.headers });
  }

  sentChatMessage(...param) {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json'); 
    let body={
      "textMessage" : param[0],
      "whatsAppNumber" : param[1]
    }
    return this.httpClient.post(environment.url +'/user/send-text-message', body, { headers: this.headers });
  }

  patchMethod<T>(...param): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    // this.headers.append('Authorization', 'Bearer ' + this.TOKEN);
    console.log('update Param', param);
    return this.httpClient.patch<T>(environment.url + this.microService + param[0], param[1], { headers: this.headers });
    // .map(response => response.json())
  }

  userPutMethod<T>(...param): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    this.headers = this.headers.set(InterceptorSkipHeader, '');
    console.log('put Param', param);
    return this.httpClient.put<T>(`${environment.url}${this.microService}${param[0]}`, {}, { headers: this.headers });
  }

  putMethod<T>(...param): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    console.log('put Param', param);
    return this.httpClient.put<T>(`${environment.url}${this.microService}${param[0]}`, param[1], { headers: this.headers });
  }
}
