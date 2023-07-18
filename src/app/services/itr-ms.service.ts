import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class ItrMsService {
  headers: any;
  userObj: any;
  microService: string = '/itr';
  constructor(private httpClient: HttpClient, private http: HttpClient) {}

  getMethod<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    // this.headers.append('Authorization', 'Bearer ' + this.TOKEN);
    return this.httpClient.get<T>(
      environment.url + this.microService + param[0],
      { headers: this.headers }
    );
    // .map(response => response.json())
  }

  getItrLifeCycle<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    // this.headers.append('Authorization', 'Bearer ' + this.TOKEN);
    return this.httpClient.get<T>(
      environment.ITR_LIFECYCLE + this.microService + param[0],
      { headers: this.headers }
    );
    // .map(response => response.json())
  }

  getLambda<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    // this.headers.append('Authorization', 'Bearer ' + this.TOKEN);
    return this.httpClient.get<T>(
      environment.check_upload + param[0],
      { headers: this.headers }
    );
    // .map(response => response.json())
  }

  downloadLambda<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');

    return this.httpClient.post<T>(
      environment.download_file + param[0],param[1],
      { headers: this.headers }
    );
    // .map(response => response.json())
  }

  postLambda<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');

    return this.httpClient.post<T>(
      environment.upload_file + param[0],param[1],
      { headers: this.headers }
    );
    // .map(response => response.json())
  }

  getAdjustmentDetails<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    // this.headers.append('Authorization', 'Bearer ' + this.TOKEN);
    return this.httpClient.get<T>(environment.get_adjustment + param[0],
      { headers: this.headers }
    );
    // .map(response => response.json())
  }

  addAdjustment<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    // this.headers.append('Authorization', 'Bearer ' + this.TOKEN);
    return this.httpClient.get<T>(environment.adjustment + param[0],
      { headers: this.headers }
    );
    // .map(response => response.json())
  }

  getTdsDetails<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    // this.headers.append('Authorization', 'Bearer ' + this.TOKEN);
    return this.httpClient.get<T>(environment.get_tds + param[0],
      { headers: this.headers }
    );
    // .map(response => response.json())
  }

  postAdjustmentDetails<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');

    return this.httpClient.post<T>(
      environment.add_adjustment + param[0],param[1],
      { headers: this.headers }
    );
    // .map(response => response.json())
  }

  putLambdaForUpdateId<T>(...param): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    // this.headers.append('Authorization', 'Bearer ' + this.TOKEN);
    return this.httpClient.put<T>(
      environment.update_id + param[0],param[1],{ headers: this.headers });
    // .map(response => response.json())
  }

  postMethod<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');

    return this.httpClient.post<T>(
      environment.url + this.microService + param[0],
      param[1],
      { headers: this.headers }
    );
    // .map(response => response.json())
  }

  postMethodForEri<T>(...param): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    // this.headers.append('panNumber', param[2].panNumber);
    // this.headers.append('assessmentYear',param[2].assessmentYear);
    // this.headers.append('userId',param[2].userId);
    console.log('POst Param', param);
    console.log('headers', this.headers);
    console.log(
      'url',
      (environment.production ? environment.url : environment.eri_url) +
        this.microService +
        param[0],
      param[1]
    );
    return this.httpClient.post<T>(
      (environment.production ? environment.url : environment.eri_url) +
        this.microService +
        param[0],
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
  patchMethod<T>(...param: any): Observable<T> {
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

  deleteMethod<T>(param: any): Observable<T> {
    // this.TOKEN = this.encrDecrService.get(AppConstants.TOKEN);
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    // this.headers.append('Authorization', 'Bearer ' + this.TOKEN);
    return this.httpClient.delete<T>(
      environment.url + this.microService + param,
      { headers: this.headers }
    );
    // .map(response => response.json())
  }

  deleteMethodWithRequest(param: any, body: any) {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    const userData = JSON.parse(localStorage.getItem('UMD') || '');
    const TOKEN = userData ? userData.id_token : null;
    this.headers.append('Authorization', 'Bearer ' + TOKEN);
    let reqBody = {
      headers: this.headers,
      body: body,
    };
    return this.httpClient.delete(environment.url + param, reqBody);
    //  .map(response => response.json());
  }

  downloadXML(param: any) {
    console.log('Download XML Param', param);
    const userData = JSON.parse(localStorage.getItem('UMD') || '');
    const TOKEN = userData ? userData.id_token : null;
    this.headers = new Headers();
    this.headers.append('Authorization', 'Bearer ' + TOKEN);
    return this.http
      .get(environment.url + this.microService + param, {
        headers: this.headers,
        responseType: 'blob',
      })
      .pipe(
        map((response) => {
          return new Blob([response], { type: 'application/xhtml+xml' }); //text/json; charset=utf-8
        })
      );
  }

  downloadFile(param: any, fileType: any) {
    console.log('get Param', param);
    const userData = JSON.parse(localStorage.getItem('UMD') || '');
    const TOKEN = userData ? userData.id_token : null;
    // const TOKEN = sessionStorage.getItem(AppConstants.TOKEN);
    this.headers = new Headers();
    this.headers.append('Authorization', 'Bearer ' + TOKEN);
    return this.http
      .get(environment.url + this.microService + param, {
        headers: this.headers,
        responseType: 'blob',
      })
      .pipe(
        map((response) => {
          return new Blob([response], { type: fileType });
        })
      );
  }

  downloadJsonFile(param: any, fileType: any) {
    console.log('get Param', param);
    const userData = JSON.parse(localStorage.getItem('UMD') || '');
    const TOKEN = userData ? userData.id_token : null;
    // const TOKEN = sessionStorage.getItem(AppConstants.TOKEN);
    this.headers = new Headers();
    this.headers.append('Authorization', 'Bearer ' + TOKEN);
    return this.http
      .get(environment.url + this.microService + param, {
        headers: this.headers,
        responseType: 'blob',
      })
      .pipe(
        map((response) => {
          return new Blob([response], { type: fileType });
        })
      );
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
