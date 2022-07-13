import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InterceptorSkipHeader } from 'src/app/services/token-interceptor';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  headers: any;
  constructor(
    private httpClient:HttpClient
  ) { }
 
  postMethod<T>(...param: any): Observable<any> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    this.headers = this.headers.set(InterceptorSkipHeader, '');
    return this.httpClient.post<T>(`${environment.reviewUrl}${param[0]}`, param[1], { headers: this.headers });
  }

  getMethod<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    this.headers = this.headers.set(InterceptorSkipHeader, '');
    return this.httpClient.get<T>(environment.reviewUrl + param[0], { headers: this.headers });
}

}
