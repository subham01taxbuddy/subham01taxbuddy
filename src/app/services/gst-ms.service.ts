import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, } from '@angular/common/http';
import { ResponseContentType, Http, Headers } from '@angular/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GstMsService {
  headers: any;
  userObj: any;
  microService: string = '/taxbuddygst/api';
  constructor(private httpClient: HttpClient, private http: Http, ) { }

  getMethod<T>(...param): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    // this.headers.append('Authorization', 'Bearer ' + this.TOKEN);
    console.log('update Param', param);
    return this.httpClient.get<T>(environment.url + this.microService + param[0], { headers: this.headers });
    // .map(response => response.json())
  }

  patchMethod<T>(...param): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    // this.headers.append('Authorization', 'Bearer ' + this.TOKEN);
    console.log('update Param', param);
    return this.httpClient.patch<T>(environment.url + this.microService + param[0], param[1], { headers: this.headers });
    // .map(response => response.json())
  }

  downloadFile(param, fileType) {
    console.log('get Param', param);
    this.userObj = JSON.parse(localStorage.getItem('UMD'));
    const TOKEN = (this.userObj) ? this.userObj.id_token : null;
    this.headers = new Headers();
    this.headers.append('Authorization', 'Bearer ' + TOKEN);
    console.log('Headers for get method=', this.headers);
    return this.http.get(environment.url + this.microService + param, { headers: this.headers, responseType: ResponseContentType.Blob })
      .pipe(map((response) => {
        return new Blob([response.blob()], { type: fileType });
      }));
  }
}
