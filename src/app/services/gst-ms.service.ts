import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GstMsService {
  headers: any;
  userObj: any;
  microService: string = '/gst/api';
  constructor(private httpClient: HttpClient,) { }

  getMethod<T>(...param): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.get<T>(environment.url + this.microService + param[0], { headers: this.headers });
  }

}
