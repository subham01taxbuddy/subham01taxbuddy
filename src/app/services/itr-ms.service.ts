import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, } from '@angular/common/http';
import { ResponseContentType, Http, Headers } from '@angular/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { AppConstants } from 'app/shared/constants';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
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
        return this.httpClient.post<T>(environment.url + this.microService + param[0], param[1], { headers: this.headers });
        // .map(response => response.json())
    }

    putMethod<T>(...param): Observable<T> {
        this.headers = new HttpHeaders();
        this.headers.append('Content-Type', 'application/json');
        // this.headers.append('Authorization', 'Bearer ' + this.TOKEN);
        console.log('Put Param', param);
        return this.httpClient.put<T>(environment.url + this.microService + param[0], param[1], { headers: this.headers });
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

    deleteMethod<T>(param): Observable<T> {
        // this.TOKEN = this.encrDecrService.get(AppConstants.TOKEN);
        this.headers = new HttpHeaders();
        this.headers.append('Content-Type', 'application/json');
        // this.headers.append('Authorization', 'Bearer ' + this.TOKEN);
        console.log('delete Param', param);
        return this.httpClient.delete<T>(environment.url + this.microService + param, { headers: this.headers });
        // .map(response => response.json())
    }

    deleteMethodWithRequest(param, body) {
        this.headers = new HttpHeaders();
        this.headers.append('Content-Type', 'application/json');
        const userData = JSON.parse(localStorage.getItem('UMD'));
        const TOKEN = (userData) ? userData.id_token : null;
        this.headers.append('Authorization', 'Bearer ' + TOKEN);
        let reqBody = {
            headers: this.headers,
            body: body
        }
        return this.httpClient.delete(environment.url + param, reqBody);
          //  .map(response => response.json());
    }

    downloadXML(param) {
        console.log('Download XML Param', param);
        const userData = JSON.parse(localStorage.getItem('UMD'));
        const TOKEN = (userData) ? userData.id_token : null;
        this.headers = new Headers();
        this.headers.append('Authorization', 'Bearer ' + TOKEN);
        console.log('Headers for get method=', this.headers);
        return this.http.get(environment.url + this.microService + param, { headers: this.headers, responseType: ResponseContentType.Blob })
            .map((response) => {
                return new Blob([response.blob()], { type: 'application/xhtml+xml' });  //text/json; charset=utf-8
            });
    }

    downloadFile(param, fileType) {
        console.log('get Param', param);
        const userData = JSON.parse(localStorage.getItem('UMD'));
        const TOKEN = (userData) ? userData.id_token : null;
        // const TOKEN = sessionStorage.getItem(AppConstants.TOKEN);
        console.log('My logged in usre objecty===', this.userObj);
        this.headers = new Headers();
        this.headers.append('Authorization', 'Bearer ' + TOKEN);
        console.log('Headers for get method=', this.headers);
        return this.http.get(environment.url + this.microService + param, { headers: this.headers, responseType: ResponseContentType.Blob })
            .map((response) => {
                return new Blob([response.blob()], { type: fileType });
            });
    }

    invoiceDownload(params) {
        const userData = JSON.parse(localStorage.getItem('UMD'));
        const TOKEN = (userData) ? userData.id_token : null;
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Authorization', 'Bearer ' + TOKEN);
        return this.http.get(environment.url + this.microService + params, { headers: this.headers, responseType: ResponseContentType.Blob })
    };

}
