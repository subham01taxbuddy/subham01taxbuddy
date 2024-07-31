import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JsonToCsvService } from '../modules/shared/services/json-to-csv.service';
import { ToastMessageService } from './toast-message.service';
import { UtilsService } from './utils.service';
import { AppConstants } from '../modules/shared/constants';
import { NgxIndexedDBService } from 'ngx-indexed-db';

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
  smeList: any;
  allPlanDetails: any;
  allResignedActiveSmeList: any;
  constructor(
    private httpClient: HttpClient,
    private jsonToCsvService: JsonToCsvService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private dbService: NgxIndexedDBService
  ) {
    this.roles = this.utilsService.getUserRoles();
    this.smeList = JSON.parse(sessionStorage.getItem('SME_LIST'));
    // this.allResignedActiveSmeList = JSON.parse(sessionStorage.getItem('ALL_RESIGNED_ACTIVE_SME_LIST'));
    this.allPlanDetails = JSON.parse(sessionStorage.getItem('ALL_PLAN_LIST'));
  }

  async downloadReport(baseUrl: string, param: string, page: number, name: any, fields?: any, sortBy?: any, taxpayable?) {
    if (name === 'Filed-ITR') {
      this.dbService.getAll('taxbuddy').subscribe((result: any) => {
        console.log('indexDB get data results: ', result);
        this.allResignedActiveSmeList = JSON.parse(result[0][AppConstants.ALL_RESIGNED_ACTIVE_SME_LIST]);
      });
    }
    let sortJson = encodeURI(JSON.stringify(sortBy));
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
    console.log('no of pages to be downloaded', this.count)
    page += 1;
    for (; page < this.count; page++) {
      paramUrl = Object.keys(sortBy).length ? `${param}${addOn}sortBy=${sortJson}&page=${page}&size=${this.size}&pageSize=${this.pageSize}` : `${param}${addOn}page=${page}&size=${this.size}&pageSize=${this.pageSize}`;
      await this.getData(baseUrl, paramUrl).then((data: number) => { this.count = data });
    }
    console.log('this.data', this.data)
    console.log('this.data.length', this.data.length)
    if (this.data.length) {
      if (name === 'ITR-Assigned Users') {
        this.mapItrAssignedDetails(taxpayable);
      }
      if (name === 'Filed-ITR') {
        this.mapFiledItrDetails();
      }
      if (name === 'assigned-sme-report') {
        this.mapAssignedSmeDetails(fields);
      }
      if (name === 'calling-report-list') {
        this.mapCallingReportDetails();
      }
      if (name === 'prefill-uploaded-summary-not-sent-report') {
        this.mapChatLink();
      }
      this.jsonToCsvService.downloadFile(this.data, fields, name);
    } else {
      this._toastMessageService.alert('error', "There is no records found");
      return
    }

  }

  mapCallingReportDetails() {
    this.data.forEach((element) => {
      element['recordingLink'] = `=HYPERLINK("${element.recordingLink}")`;
    });
  }

  mapChatLink() {
    this.data.forEach((element) => {
      if (element.conversationId) {
        let link = `https://dashboard.kommunicate.io/conversations/${element.conversationId}`
        element['conversationId'] = `=HYPERLINK("${link}")`;
      }
      if (element.whatsAppConversationId) {
        let link = `https://dashboard.kommunicate.io/conversations/${element.whatsAppConversationId}`
        element['whatsAppConversationId'] = `=HYPERLINK("${link}")`;
      }
    });
  }

  mapItrAssignedDetails(taxPayable) {
    if (!taxPayable) {
      this.data.forEach((element) => {
        element['taxPayable'] = '(' + element['taxPayable'] + ')';
      })
    }
  }

  mapFiledItrDetails() {
    this.allResignedActiveSmeList?.forEach((item) => {
      this.data.forEach((element) => {
        if (item.userId === element.leaderUserId)
          element['leaderUserId'] = item.name;
        if (item.userId === element.filingTeamMemberId)
          element['filingTeamMemberId'] = item.name;
        if (item.userId === element.filerUserId)
          element['filerUserId'] = item.name;
      });
    });
    this.data.forEach((element) => {
      element['isRevised'] = (element.isRevised === 'Y') ? 'Revised' : 'Original';
    })
  }

  mapAssignedSmeDetails(fields) {
    this.smeList.forEach((item) => {
      this.data.forEach((element) => {
        if (item.userId === element.parentPrincipalUserId)
          element['parentPrincipalUserId'] = item.name;
      });
    });

    this.data.forEach((element) => {
      if (element.roles.includes('ROLE_FILER')) {
        element.serviceEligibility_ITR.assignmentStart = element.serviceEligibility_ITR.assignmentStart ? 'Active' : 'In-Active';
      } else {
        element.serviceEligibility_ITR.assignmentStart = '-'
      }
      let result = [];
      fields.forEach(item => {
        if (item.key === 'services') {
          const serviceTypes = [
            { key: 'serviceEligibility_ITR', displayName: 'ITR' },
            { key: 'serviceEligibility_TPA', displayName: 'TPA' },
            { key: 'serviceEligibility_NOTICE', displayName: 'NOTICE' },
            { key: 'serviceEligibility_GST', displayName: 'GST' },
          ];

          serviceTypes.forEach(serviceType => {
            if (element[serviceType.key]) {
              result.push(serviceType.displayName);
            }
          });
        }
      });
      element['services'] = result;

      //For planDetails
      let itrPlanList = this.allPlanDetails.filter(element => element.servicesType === 'ITR');
      if (element.skillSetPlanIdList || element.skillSetPlanIdList?.length) {
        let planNames = [];
        itrPlanList.forEach(item => {
          element.skillSetPlanIdList.forEach(item2 => {
            if (item2 === item.planId)
              planNames.push(item.name);
          })
        })
        element.skillSetPlanIdList = planNames;
      }
      element['exhaustedCapacity'] = Number(element.activeCaseMaxCapacity) - Number(element.balanceUserAssignmentCapacity)

    });


  }

  async getData(baseUrl, param) {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    let promise = new Promise((resolve, reject) => {
      this.httpClient.get(baseUrl + param, { headers: this.headers }).toPromise()
        .then((result: any) => {
          if (result.success) {
            if (param.includes('status-wise-report')) {
              if (result?.data?.content.length > 0 && result?.data?.content[0].statusWiseData && result?.data?.content[0].total) {
                this.data = [...result.data.content[0].statusWiseData];
                const columnTotal = this.calculateColumnTotal(this.data);
                this.data.push(columnTotal);
                resolve(result?.data.totalPages);
              } else {
                resolve(0);
              }
            } else if (param.includes('attendance-performance-report')) {
              if (result?.data?.content.length > 0) {
                this.data = [...result.data.content]
                resolve(0);
              }

            }
            else {
              if (result?.data?.content) {
                this.data = [...this.data, ...result.data.content];
                let count = result.data.totalPages
                console.log('no of pages to be downloaded', count);
                resolve(result.data.totalPages);
              }
              if (!result?.data) {
                resolve(0);
              }
            }
          }
          if (param.includes('promocodes')) {
            if (result?.content.length > 0) {
              this.data = [...this.data, ...result.content]
              resolve(result.totalPages);
            }
          }
        }, error => {
          resolve(0);
        });
    });
    return promise;
  }

  calculateColumnTotal(data: any[]): any {
    if (data.length === 0) {
      return {};
    }

    let totalRow: { [key: string]: any } = {};

    const serviceType = data[0].servicetype;

    switch (serviceType) {
      case 'ITR':
        totalRow = {
          'filerName': '',
          'leaderName': '',
          'servicetype': 'Grand Total',
          'open': 0,
          'notInterested': 0,
          'chatInitiated': 0,
          'chatResolve': 0,
          'interested': 0,
          'documentsUploaded': 0,
          'proformaInvoiceSent': 0,
          'paymentReceived': 0,
          'waitingForConfirmation': 0,
          'itrConfirmationReceived': 0,
          'itrFiled': 0,
          'backOutWithRefund': 0,
          'backOut': 0,
          'planConfirmed': 0,
          'documentsIncomplete': 0
        };
        break;
      case 'TPA':
        totalRow = {
          'filerName': '',
          'leaderName': '',
          'servicetype': 'Grand Total',
          'open': 0,
          'notInterested': 0,
          'interested': 0,
          'documentsUploaded': 0,
          'proformaInvoiceSent': 0,
          'paymentReceived': 0,
          'backOut': 0,
          'followup': 0,
          'tpaCompleted': 0
        };
        break;
      case 'NOTICE':
        totalRow = {
          'filerName': '',
          'leaderName': '',
          'servicetype': 'Grand Total',
          'open': 0,
          'notInterested': 0,
          'interested': 0,
          'documentsUploaded': 0,
          'proformaInvoiceSent': 0,
          'paymentReceived': 0,
          'converted': 0,
          'followUp': 0,
          'noticeResponseFiled': 0,
          'partResponseFiled': 0,
          'noticeWIP': 0,
          'noticeClosed': 0,
          'noticeReopen': 0,
          'backOut': 0
        };
        break;
      case 'GST':
        totalRow = {
          'filerName': '',
          'leaderName': '',
          'servicetype': 'Grand Total',
          'open': 0,
          'interested': 0,
          'notInterested': 0,
          'proformaInvoiceSent': 0,
          'paymentReceived': 0,
          'followUp': 0,
          'converted': 0,
          'activeClientReturn': 0,
          'registrationDone': 0,
          'gstCancelled': 0,
          'backOut': 0
        };
        break;
      case 'ITRU':
        totalRow = {
          'filerName': '',
          'leaderName': '',
          'servicetype': 'Grand Total',
          'open': 0,
          'interested': 0,
          'notInterested': 0,
          'chatInitiated': 0,
          'chatResolve': 0,
          'proformaInvoiceSent': 0,
          'documentsIncomplete': 0,
          'documentsUploaded': 0,
          'itrConfirmationReceived': 0,
          'itrFiled20_21': 0,
          'itrFiled21_22': 0,
          'itrFiled22_23': 0,
          'paymentReceived': 0,
          'planConfirmed': 0,
          'waitingForConfirmation': 0,
          'backOutWithRefund': 0,
          'backedOut': 0
        };
        break;
      default:
        totalRow = {
          'filerName': 'Grand Total',
          'leaderName': 'Grand Total',
        };
        break;
    }

    for (let i = 0; i < data.length; i++) {
      const rowData = data[i];
      for (const key in rowData) {
        if (rowData.hasOwnProperty(key) && totalRow.hasOwnProperty(key) && typeof rowData[key] === 'number') {
          totalRow[key] += rowData[key];
        }
      }
    }
    return totalRow;
  }

}

