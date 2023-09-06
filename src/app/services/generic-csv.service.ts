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
    private utilsService: UtilsService,
  ) {
    this.roles = this.utilsService.getUserRoles();
  }

  async downloadReport(baseUrl: string, param: string, page: number, name: any, fields?: any, sortBy?: any) {
    debugger
    let sortJson = encodeURI(JSON.stringify(sortBy));
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
    paramUrl = Object.keys(sortBy).length ? `${param}${addOn}sortBy=${sortJson}&page=${page}&size=${this.size}&pageSize=${this.pageSize}` : `${param}${addOn}page=${page}&size=${this.size}&pageSize=${this.pageSize}`;
    this.count = 0;
    await this.getData(baseUrl, paramUrl).then((data: number) => { this.count = data });
    page += 1;
    for (; page < this.count; page++) {
      paramUrl =  Object.keys(sortBy).length ? `${param}${addOn}sortBy=${sortJson}&page=${page}&size=${this.size}&pageSize=${this.pageSize}` : `${param}${addOn}page=${page}&size=${this.size}&pageSize=${this.pageSize}`;
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
            if (param.includes('status-wise-report')) {
              if (result?.data?.content.length > 0 && result?.data?.content[0].statusWiseData && result?.data?.content[0].total) {
                this.data = [...result?.data?.content[0].statusWiseData];
                const columnTotal = this.calculateColumnTotal(this.data);
                this.data.push(columnTotal);
                resolve(result?.data.totalPages);
              } else {
                resolve(0);
              }
            }
            else {
              this.data = [...this.data, ...result?.data?.content];
              resolve(result?.data.totalPages);
            }
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

  calculateColumnTotal(data: any[]): any {
    const totalRow = {
      filerName: 'Grand Total',
      ownerName: 'Grand Total',
      assignedUsers: 0,
      itrFiledAsPerITRTab: 0,
      open: 0,
      interested: 0,
      followup: 0,
      autoFollowup: 0,
      converted: 0,
      documentsUploaded: 0,
      preparingItr: 0,
      waitingForConfirmation: 0,
      itrConfirmationReceived: 0,
      itrFiledStatusWise: 0,
      invoiceSent: 0,
      paymentReceived: 0,
      notInterested: 0,
      backout: 0
    };

    for (let i = 0; i < data.length; i++) {
      const rowData = data[i];
      for (const key in rowData) {
        if (rowData.hasOwnProperty(key) && key !== 'filerName' || key !== 'ownerName') {
          totalRow[key] += rowData[key];
        }
      }
    }

    if (data.length > 0) {
      if (data[0].filerName) {
        delete totalRow['ownerName'];
        totalRow.filerName = data[0].filerName ? 'Grand Total' : '';
      }
      else {
        delete totalRow['filerName'];
        totalRow.ownerName = data[0].ownerName ? 'Grand Total' : '';
      }
    }



    return totalRow;
  }
}

