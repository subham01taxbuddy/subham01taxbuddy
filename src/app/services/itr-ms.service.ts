import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { InterceptorSkipHeader } from "./token-interceptor";
@Injectable({
  providedIn: 'root',
})
export class ItrMsService {

  SINGLE_CG_URL = "https://9buh2b9cgl.execute-api.ap-south-1.amazonaws.com/prod/itr/single-cg-calculate";
  headers: any;
  userObj: any;
  microService: string = '/itr';
  constructor(private httpClient: HttpClient, private http: HttpClient) { }

  getMethod<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.get<T>(
      environment.url + this.microService + param[0],
      { headers: this.headers }
    );
  }

  getItrLifeCycle<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.get<T>(
      environment.ITR_LIFECYCLE + this.microService + param[0],
      { headers: this.headers }
    );
  }

  getLambda<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.get<T>(
      environment.check_upload + param[0],
      { headers: this.headers }
    );
  }

  downloadLambda<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');

    return this.httpClient.post<T>(
      environment.download_file + param[0], param[1],
      { headers: this.headers }
    );
  }

  postLambda<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');

    return this.httpClient.post<T>(
      environment.upload_file + param[0], param[1],
      { headers: this.headers }
    );
  }

  getAdjustmentDetails<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.get<T>(environment.get_adjustment + param[0],
      { headers: this.headers }
    );
  }

  getAdjustmentCSV<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.get<T>(environment.get_adjustment_csv + param[0],
      { headers: this.headers }
    );
  }

  addAdjustment<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.get<T>(environment.adjustment + param[0],
      { headers: this.headers }
    );
  }

  getTdsDetails<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.get<T>(environment.get_tds + param[0],
      { headers: this.headers }
    );
  }

  postAdjustmentDetails<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');

    return this.httpClient.post<T>(
      environment.add_adjustment + param[0], param[1],
      { headers: this.headers }
    );
  }

  putLambdaForUpdateId<T>(...param): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.put<T>(
      environment.update_id + param[0], param[1], { headers: this.headers });
  }

  postMethod<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.post<T>(
      environment.url + this.microService + param[0],
      param[1],
      { headers: this.headers }
    );
  }

  singelCgCalculate<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers = this.headers.append(InterceptorSkipHeader, '');
    return this.httpClient.post<T>(
      this.SINGLE_CG_URL,
      param[0],
      { headers: this.headers }
    );
  }

  postMethodForEri<T>(...param): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
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
  }

  putMethod<T>(...param): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.put<T>(
      environment.url + this.microService + param[0],
      param[1],
      { headers: this.headers }
    );
  }
  patchMethod<T>(...param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.patch<T>(
      environment.url + this.microService + param[0],
      param[1],
      { headers: this.headers }
    );
  }

  deleteMethod<T>(param: any): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.delete<T>(
      environment.url + this.microService + param,
      { headers: this.headers }
    );
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
  downloadFileAsPost(param: any, fileType: any, request: any) {
    console.log('get Param', param);
    const userData = JSON.parse(localStorage.getItem('UMD') || '');
    const TOKEN = userData ? userData.id_token : null;
    this.headers = new Headers();
    this.headers.append('Authorization', 'Bearer ' + TOKEN);
    return this.http
      .post(environment.url + this.microService + param, request, {
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

  getJvSnapshots<T>(openItrId): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.httpClient.get<T>(
      environment.url + this.microService + `/list-itr/${openItrId}`,
      { headers: this.headers }
    );
  }
 
  putJvSnapshots<T>(ids: string[], openItrId: number): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    const body = { ids: ids };
    return this.httpClient.put<T>(
        environment.url + this.microService +`/update-snapshot/${openItrId}`,body,
      { headers: this.headers }
    );
  }



}
