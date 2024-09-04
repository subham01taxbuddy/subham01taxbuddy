import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { InterceptorSkipHeader } from './token-interceptor';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserMsService {
  headers: any;
  userObj: any;
  TOKEN: any;
  microService: string = '/user';
  newMicroService: string = '/report';

  private alertCreatedSource = new Subject<void>();
  alertCreated$ = this.alertCreatedSource.asObservable();
  private activeAlertCountSource = new BehaviorSubject<number>(0);
  activeAlertCount$ = this.activeAlertCountSource.asObservable();

  constructor(private httpClient: HttpClient, private http: HttpClient) { }



  getMethod<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.get<T>(environment.url + this.microService + param[0], { headers: this.headers });
  }

  getMethodNew<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.get<T>(environment.url + this.newMicroService + param[0], { headers: this.headers });
    // .map(response => response.json())
  }

  getMethodInfo<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.get<T>(environment.url + param[0], { headers: this.headers });
    // .map(response => response.json())
  }

  postMethodInfo<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.post<T>(environment.url + param[0], param[1], { headers: this.headers });
    // .map(response => response.json())
  }

  invoiceDownloadDoc(...params: any) {
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
    return this.http.get(environment.url + params[0], { headers: this.headers, responseType: 'blob' })
    //.map((res) => { return new Blob([res.blob()], { type: 'application/pdf' }) });
  };

  postMethodDownloadDoc(...params: any) {
    const userInfo = JSON.parse(localStorage.getItem('UMD') ?? "")
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
    this.headers.append('Authorization', 'Bearer ' + userInfo.id_token);

    return this.http.post(environment.url + params[0], params[1], { headers: this.headers, responseType: 'blob' })
    //.map((res) => { return new Blob([res.blob()], { type: 'application/pdf' }) });
  };


  getUserDetail(...param: any) {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.get(environment.url + '/gateway' + param[0], { headers: this.headers });
  }

  sentChatMessage(...param: any) {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.post(environment.url + param[0], param[1], { headers: this.headers });
  }

  patchMethod<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.patch<T>(environment.url + this.microService + param[0], param[1], { headers: this.headers });
    // .map(response => response.json())
  }

  userPutMethod<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    this.headers = this.headers.set(InterceptorSkipHeader, '');
    return this.httpClient.put<T>(`${environment.url}${this.microService}${param[0]}`, {}, { headers: this.headers });
  }

  putMethod<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.put<T>(`${environment.url}${this.microService}${param[0]}`, param[1], { headers: this.headers });
  }

  spamPutMethod<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.put<T>(`${environment.url}${param[0]}`, param[1], { headers: this.headers });
  }

  postMethod<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.post<T>(`${environment.url}${this.microService}${param[0]}`, param[1], { headers: this.headers });
  }

  deleteMethod(...param: any) {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    const userData = JSON.parse(localStorage.getItem('UMD') ?? "");
    const TOKEN = (userData) ? userData.id_token : null;
    this.headers.append('Authorization', 'Bearer ' + TOKEN);

    return this.httpClient.delete(environment.url + param[0], this.headers);
    //  .map(response => response.json());
  }

  postMethodAWSURL<T>(...param: any): Observable<any> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.post<T>(`${environment.amazonaws_url}${param[0]}`, param[1], { headers: this.headers });
  }
  putMethodAWSURL<T>(...param: any): Observable<any> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.put<T>(`${environment.amazonaws_url}${param[0]}`, param[1], { headers: this.headers });
  }

  uploadFile(file: File): Observable<any> {
    const data = new FormData();
    data.append('file', file);
    return this.httpClient.post(environment.url + '/itr/cloud/upload/temp', data);
  }

  uploadReport(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    this.headers = new HttpHeaders()
      .append('Accept', 'text/csv, application/json')
      .append('Authorization', 'Bearer ' + this.getAuthToken());

    return this.httpClient.post(environment.url + '/itr/script-add-invoiceNo-in-csv', formData, {
      headers: this.headers,
      responseType: 'blob'
    });
  }

  private getAuthToken(): string {
    return localStorage.getItem('auth_token');
  }

}
