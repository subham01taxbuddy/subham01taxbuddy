import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ThirdPartyService {

  constructor(private httpClient: HttpClient, private http: HttpClient) { }

  getBankDetailByIFSCCode(...param) {
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers.set('Access-Control-Allow-Origin', '*');
    console.log('update Param', param);
    return this.http.get(environment.ifsc_url + param[0], {});
  }
}
