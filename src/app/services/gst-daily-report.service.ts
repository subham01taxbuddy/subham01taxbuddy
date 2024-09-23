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
  constructor(private httpClient: HttpClient) { }

  putMethod<T>(...param): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.put<T>(
      environment.url + this.microService + param[0],
      param[1],
      { headers: this.headers }
    );
  }
}
