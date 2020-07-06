import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, } from '@angular/common/http';
import { ResponseContentType, Http, Headers } from '@angular/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ItrMsService {
    headers: any;
    userObj: any;
    microService: string = '/itr';
    constructor(private httpClient: HttpClient, private http: Http,) { }

    getMethod<T>(...param): Observable<T> {
        this.headers = new HttpHeaders();
        this.headers.append('Content-Type', 'application/json');
        // this.headers.append('Authorization', 'Bearer ' + this.TOKEN);
        console.log('update Param', param);
        return this.httpClient.get<T>(environment.url + this.microService + param[0], { headers: this.headers });
        // .map(response => response.json())
    }

    postMethod<T>(...param): Observable<T> {
        this.headers = new HttpHeaders();
        this.headers.append('Content-Type', 'application/json');
        // this.headers.append('Authorization', 'Bearer ' + this.TOKEN);
        console.log('POst Param', param);
        return this.httpClient.patch<T>(environment.url + this.microService + param[0], param[1], { headers: this.headers });
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

}
