import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JsonToCsvService } from '../modules/shared/services/json-to-csv.service';
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
  smeList: any;
  allPlanDetails: any;
  allResignedActiveSmeList: any;
  constructor(
    private httpClient: HttpClient,
    private jsonToCsvService: JsonToCsvService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
  ) {
    this.roles = this.utilsService.getUserRoles();
    this.smeList = JSON.parse(sessionStorage.getItem('SME_LIST'));
    this.allResignedActiveSmeList = JSON.parse(sessionStorage.getItem('ALL_RESIGNED_ACTIVE_SME_LIST'));
    this.allPlanDetails = JSON.parse(sessionStorage.getItem('ALL_PLAN_LIST'));
  }

  async downloadReport(baseUrl: string, param: string, page: number, name: any, fields?: any, sortBy?: any) {
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
            // if (result?.data?.content.length) {
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

