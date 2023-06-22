import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JsonToCsvService } from '../modules/shared/services/json-to-csv.service';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GenericCsvService {
  headers: any;
  pageSize = 20;
  data = [];
  count: number;
  constructor(
    private httpClient: HttpClient,
    private jsonToCsvService: JsonToCsvService
  ) { }

  async downloadReport(baseUrl: string, param: string, page: number, name: any, fields?: any) {
    // var subject = new Subject<boolean>();
    let paramUrl = param;
    if (page == 0) {
      this.data = [];
    }
    let addOn;
    if (param.endsWith('?')) {
      addOn = '';
    } else if (param.indexOf('?') === (-1)) {
      addOn = '?';
    } else {
      addOn = '&';
    }
    paramUrl = `${param}${addOn}page=${page}&size=${this.pageSize}`;
    this.count = 0;
    await this.getData(baseUrl, paramUrl).then((data: number) => { this.count = data });
    page += 1;
    for (; page < this.count; page++) {
      paramUrl = `${param}${addOn}page=${page}&size=${this.pageSize}`;
      await this.getData(baseUrl, paramUrl).then((data: number) => { this.count = data });
    }
    this.jsonToCsvService.downloadFile(this.data, name, fields);
    // subject.next(true);
    // return subject.asObservable();
  }

  async getData(baseUrl, param) {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    let promise = new Promise((resolve, reject) => {
      this.httpClient.get(baseUrl + param, { headers: this.headers }).toPromise()
        .then((result: any) => {
          if (result.success) {
            this.data = [...this.data, ...result?.data?.content];
            resolve(result?.data.totalPages);
          }
        }, error => {
          resolve(0);
        });
    });
    return promise;
  }
}
