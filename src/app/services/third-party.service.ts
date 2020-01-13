import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'environments/environment';
import { Http } from '@angular/http';

@Injectable({
  providedIn: 'root'
})
export class ThirdPartyService {

  constructor(private httpClient: HttpClient, private http: Http) { }

  getBankDetailByIFSCCode(...param) {
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers.set('Access-Control-Allow-Origin', '*');
    console.log('update Param', param);
    return this.http.get(environment.ifsc_url + param[0], {});
  }
}
