import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { InterceptorSkipHeader } from './token-interceptor';
import { ResponseContentType, Http } from '@angular/http';

@Injectable({
  providedIn: 'root'
})
export class UserMsService {
  headers: any;
  userObj: any;
  TOKEN: any;
  microService: string = '/user';
  constructor(private httpClient: HttpClient, private http: Http) { }

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

    console.log('update Param', param);
    return this.httpClient.get<T>(environment.url + param[0], { headers: this.headers });
    // .map(response => response.json())
  }

  postMethodInfo<T>(...param): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');

    console.log('update Param', param);
    return this.httpClient.post<T>(environment.url + param[0], param[1], { headers: this.headers });
    // .map(response => response.json())
  }

  invoiceDownloadDoc(...params) {
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');

    return this.http.get(environment.url + params[0], { headers: this.headers, responseType: ResponseContentType.Blob })
    //.map((res) => { return new Blob([res.blob()], { type: 'application/pdf' }) });
  };

  postMethodDownloadDoc(...params) {
    const userInfo = JSON.parse(localStorage.getItem('UMD'))
    console.log('TOKEN ', userInfo)
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
    this.headers.append('Authorization', 'Bearer ' + userInfo.id_token);

    return this.http.post(environment.url + params[0], params[1], { headers: this.headers, responseType: ResponseContentType.Blob })
    //.map((res) => { return new Blob([res.blob()], { type: 'application/pdf' }) });
  };


  getUserDetail(...param) {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.get(environment.url + '/gateway' + param[0], { headers: this.headers });
  }

  sentChatMessage(...param) {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');

    return this.httpClient.post(environment.url + param[0], param[1], { headers: this.headers });
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

  postMethod<T>(...param): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    console.log('Post Param', param);
    return this.httpClient.post<T>(`${environment.url}${this.microService}${param[0]}`, param[1], { headers: this.headers });
  }
}
