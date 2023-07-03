import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JsonToCsvService } from '../modules/shared/services/json-to-csv.service';
import { Observable, Subject } from 'rxjs';
import { ToastMessageService } from './toast-message.service';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class GenericCsvService {
  headers: any;
  pageSize = 100;
  size = 100;
  data = [];
  count: number;
  roles: any;
  constructor(
    private httpClient: HttpClient,
    private jsonToCsvService: JsonToCsvService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService
  ) {
    this.roles = this.utilsService.getUserRoles();
  }

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
    paramUrl = `${param}${addOn}page=${page}&size=${this.size}&pageSize=${this.pageSize}`;
    this.count = 0;
    await this.getData(baseUrl, paramUrl).then((data: number) => { this.count = data });
    page += 1;
    for (; page < this.count; page++) {
      paramUrl = `${param}${addOn}page=${page}&size=${this.size}&pageSize=${this.pageSize}`;
      await this.getData(baseUrl, paramUrl).then((data: number) => { this.count = data });
    }
    if (this.data.length) {
      this.jsonToCsvService.downloadFile(this.data, name, fields);
    } else {
      this._toastMessageService.alert('error', "There is no records found");
      return
    }
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
            // if (result?.data?.content.length) {
            this.data = [...this.data, ...result?.data?.content];
            resolve(result?.data.totalPages);
            // } else {
            //   resolve(0);
            // }
          }
        }, error => {
          resolve(0);
        });
    });
    return promise;
  }
}
