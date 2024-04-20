import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  headers: any;
  userObj: any;
  TOKEN: any;
  baseUrl: string = 'https://uat-api.taxbuddy.com/report'
  microService: string = '/report';
  constructor(private httpClient: HttpClient, private http: HttpClient, private utilService: UtilsService,) { }

  getMethod<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.get<T>(environment.url + this.microService + param[0], { headers: this.headers });
  }
  
  query<T>(query:any): Observable<T> {
    const iv = this.utilService.generateRandomAlphaNumeric(16);
    query = this.utilService.encrypt(JSON.stringify(query), iv);
    this.headers = new HttpHeaders();
    this.headers.append('iv', iv);
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.get<T>(environment.url + this.microService + "/bo/query?query="+query, { headers: this.headers });
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
