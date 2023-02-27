import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GstDailyReportService {
  headers: any;
  userObj: any;
  microService: string = '/gateway';
  constructor(private httpClient: HttpClient) {}

  getMethod<T>(...param): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    // this.headers.append('Authorization', 'Bearer ' + this.TOKEN);
    return this.httpClient.get<T>(
      environment.eri_url + this.microService + param[0],
      { headers: this.headers }
    );
    // .map(response => response.json())
  }

  patchMethod<T>(...param): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    // this.headers.append('Authorization', 'Bearer ' + this.TOKEN);
    return this.httpClient.patch<T>(
      environment.url + this.microService + param[0],
      param[1],
      { headers: this.headers }
    );
    // .map(response => response.json())
  }

  putMethod<T>(...param): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    // this.headers.append('Authorization', 'Bearer ' + this.TOKEN);
    return this.httpClient.put<T>(
      environment.url + this.microService + param[0],
      param[1],
      { headers: this.headers }
    );
    // .map(response => response.json())
  }
}
