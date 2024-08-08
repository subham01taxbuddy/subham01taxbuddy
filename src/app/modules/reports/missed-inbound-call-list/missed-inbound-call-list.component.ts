import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { GridOptions } from 'ag-grid-community';
import { ReportService } from 'src/app/services/report-service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';
import { CacheManager } from '../../shared/interfaces/cache-manager.interface';
import { SmeListDropDownComponent } from '../../shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { ReviewService } from '../../review/services/review.service';
import * as moment from 'moment';


export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
@Component({
  selector: 'app-missed-inbound-call-list',
  templateUrl: './missed-inbound-call-list.component.html',
  styleUrls: ['./missed-inbound-call-list.component.scss'],
  providers: [
    DatePipe,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class MissedInboundCallListComponent implements OnInit, OnDestroy {
  loading = false;
  startDate = new UntypedFormControl('');
  endDate = new UntypedFormControl('');
  minStartDate: string = '2023-04-01';
  maxStartDate = moment().toDate();
  maxEndDate = moment().toDate();
  minEndDate = new Date().toISOString().slice(0, 10);
  missedInboundCallList: any;
  config: any;
  searchParam: any = {
    page: 0,
    pageSize: 20,
  };
  missedInboundCallListGridOptions: GridOptions;
  loggedInSme: any;
  roles: any;
  dataOnLoad = true;
  showCsvMessage: boolean;
  searchAsPrinciple: boolean = false;
  partnerType: any;
  constructor(
    public datePipe: DatePipe,
    private reportService: ReportService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private cacheManager: CacheManager,
    private reviewService: ReviewService,
  ) {
    this.startDate.setValue(new Date());
    this.endDate.setValue(new Date());
    this.setToDateValidation();

    this.missedInboundCallListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.reportsCodeColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => { },
      sortable: true,
      filter: true,
    };


    this.config = {
      itemsPerPage: this.searchParam.pageSize,
      currentPage: 1,
      totalItems: null,
    };
  }

  ngOnInit() {
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    this.roles = this.loggedInSme[0]?.roles;
    this.partnerType = this.loggedInSme[0]?.partnerType;

    if (this.roles?.includes('ROLE_LEADER')) {
      this.leaderId = this.loggedInSme[0].userId;
    } else if (!this.roles?.includes('ROLE_ADMIN') && !this.roles?.includes('ROLE_LEADER')) {
      this.filerId = this.loggedInSme[0].userId;
    }

    if (!this.roles.includes('ROLE_ADMIN') && !this.roles.includes('ROLE_LEADER')) {
      this.agentId = this.loggedInSme[0]?.userId;
      this.showReports();
    } else {
      this.dataOnLoad = false;
    }

  }

  filerId: number;
  agentId: number;
  leaderId: number;

  fromSme(event, isOwner, fromPrinciple?) {
    console.log('sme-drop-down', event, isOwner);
    if (isOwner) {
      this.leaderId = event ? event.userId : null;
    } else {
      if (fromPrinciple) {
        if (event?.partnerType === 'PRINCIPAL') {
          this.filerId = event ? event.userId : null;
          this.searchAsPrinciple = true;
        } else {
          this.filerId = event ? event.userId : null;
          this.searchAsPrinciple = false;
        }
      } else {
        if (event) {
          this.filerId = event ? event.userId : null;
          this.searchAsPrinciple = false;
        }
      }
    }
    if (this.filerId) {
      this.agentId = this.filerId;
    } else if (this.leaderId) {
      this.agentId = this.leaderId;
    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }
  }

  showReports = (pageNumber?): Promise<any> => {
    // https://uat-api.taxbuddy.com/report/bo/report/calling-report/
    // missed-inbound-calls?fromDate=2023-11-21&toDate=2023-11-21&page=0&pageSize=20&status=ALL

    if (!pageNumber) {
      this.cacheManager.clearCache();
      console.log('in clear cache')
    }
    this.loading = true;
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    let loggedInId = this.utilsService.getLoggedInUserID();

    if (this.roles.includes('ROLE_LEADER')) {
      this.leaderId = loggedInId
    }

    if (this.roles.includes('ROLE_FILER') && this.partnerType === "PRINCIPAL" && this.agentId === loggedInId) {
      this.filerId = loggedInId;
      this.searchAsPrinciple = true;

    } else if (this.roles.includes('ROLE_FILER') && this.partnerType === "INDIVIDUAL" && this.agentId === loggedInId) {
      this.filerId = loggedInId;
      this.searchAsPrinciple = false;
    }

    let param = ''
    let userFilter = '';
    if (this.leaderId && !this.filerId && !pageNumber) {
      this.searchParam.page = 0;
      this.config.currentPage = 1
      userFilter += `&leaderUserId=${this.leaderId}`;
    }

    if (this.leaderId && pageNumber) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }

    if (this.filerId && this.searchAsPrinciple === true && !pageNumber) {
      this.searchParam.page = 0;
      this.config.currentPage = 1
      userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
    }
    if (this.filerId && this.searchAsPrinciple === true && pageNumber) {
      userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
    }
    if (this.filerId && this.searchAsPrinciple === false && !pageNumber) {
      this.searchParam.page = 0;
      this.config.currentPage = 1
      userFilter += `&filerUserId=${this.filerId}`;
    }
    if (this.filerId && this.searchAsPrinciple === false && pageNumber) {
      userFilter += `&filerUserId=${this.filerId}`;
    }

    let data = this.utilsService.createUrlParams(this.searchParam);
    param = `/bo/calling-report/missed-inbound-calls?fromDate=${fromDate}&toDate=${toDate}&${data}${userFilter}`;

    return this.reportService.getMethod(param).toPromise().then((response: any) => {
      this.loading = false;
      if (response.success) {
        if(response?.data?.content.length === 0){
          this._toastMessageService.alert("error", 'Data Not Found');
        }
        this.missedInboundCallList = response?.data?.content;
        this.config.totalItems = response?.data?.totalElements;
        this.missedInboundCallListGridOptions.api?.setRowData(this.createRowData(this.missedInboundCallList));
        this.cacheManager.initializeCache(this.createRowData(this.missedInboundCallList));

        const currentPageNumber = pageNumber || this.searchParam.page + 1;
        this.cacheManager.cachePageContent(currentPageNumber, this.createRowData(this.missedInboundCallList));
        this.config.currentPage = currentPageNumber;

      } else {
        this.loading = false;
        this._toastMessageService.alert("error", response.message);
      }
    }).catch(() =>{
      this.loading = false;
      this._toastMessageService.alert("error", "Error");
    })
  }

  createRowData(fillingData) {
    console.log('fillingRepoInfo -> ', fillingData);
    let fillingRepoInfoArray = [];
    for (let i = 0; i < fillingData.length; i++) {
      let agentReportInfo = Object.assign({}, fillingRepoInfoArray[i], {
        clientName: fillingData[i].clientName,
        clientNumber: fillingData[i].clientNumber,
        callDate: fillingData[i].callDate,
        currentStatus: fillingData[i].currentStatus,
        userId : fillingData[i].userId
      })
      fillingRepoInfoArray.push(agentReportInfo);
    }
    console.log('fillingRepoInfoArray-> ', fillingRepoInfoArray)
    return fillingRepoInfoArray;
  }

  maskMobileNumber(mobileNumber) {
    if (mobileNumber) {
      return 'X'.repeat(mobileNumber.length || 10);
    }
    return '-';
  }

  reportsCodeColumnDef() {
    return [
      {
        headerName: 'Client Name',
        field: 'clientName',
        sortable: true,
        width: 200,
        pinned: 'left',
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Client Number',
        field: 'clientNumber',
        sortable: true,
        width: 240,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        cellRenderer: (params) => {
          const mobileNumber = params.value;
          if (mobileNumber) {
            if (!this.roles?.includes('ROLE_ADMIN') && !this.roles?.includes('ROLE_LEADER')) {
              const maskedMobile = this.maskMobileNumber(mobileNumber);
              return maskedMobile;
            } else {
              return mobileNumber;
            }
          } else {
            return '-'
          }
        },
      },
      {
        headerName: 'Call Date & Time',
        field: 'callDate',
        sortable: true,
        width: 250,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Current Status',
        field: 'currentStatus',
        sortable: true,
        width: 250,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Call',
        editable: false,
        width: 80,
        pinned: 'left',
        suppressMenu: true,
        cellStyle: { textAlign: 'center' },
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="By clicking on call you will be able to place a call."
              style="border: none; background: transparent; font-size: 16px; cursor:pointer;color:#04a4bc;">
              <i class="fa-solid fa-phone" data-action-type="place-call"></i>
             </button>`;
        },
      },

    ]
  }

  public onRowClicked(params) {
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'place-call': {
          this.placeCall(params.data);
          break;
        }
      }
    }
  }

  async placeCall(params) {
    // https://9buh2b9cgl.execute-api.ap-south-1.amazonaws.com/prod/tts/outbound-call
    const agentNumber = await this.utilsService.getMyCallingNumber();
    if (!agentNumber) {
      this._toastMessageService.alert('error', "You don't have calling role.");
      return;
    }
    this.loading = true;
    const param = `tts/outbound-call`;
    const reqBody = {
      agent_number: agentNumber,
      userId: params.userId,
    };
    console.log('reqBody:', reqBody);

    this.reviewService.postMethod(param, reqBody).subscribe((result: any) => {
      this.loading = false;
      if (result.success) {
        this._toastMessageService.alert("success", result.message)
      }else{
        this.loading = false;
        this.utilsService.showSnackBar('Error while making call, Please try again.');
      }
    }, error => {
      this.utilsService.showSnackBar('Error while making call, Please try again.');
      this.loading = false;
    })
  }

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  resetFilters() {
    this.cacheManager.clearCache();
    this.searchParam.page = 0;
    this.searchParam.pageSize = 20;
    this.config.currentPage = 1
    this.startDate.setValue(new Date());
    this.endDate.setValue(new Date());
    this?.smeDropDown?.resetDropdown();
    if (this.roles?.includes('ROLE_LEADER')) {
      this.leaderId = this.loggedInSme[0].userId;
    } else if (!this.roles?.includes('ROLE_ADMIN') && !this.roles?.includes('ROLE_LEADER')) {
      this.filerId = this.loggedInSme[0].userId;
    }
    if (this.dataOnLoad) {
      this.showReports();
    } else {
      //clear grid for loaded data
      this.missedInboundCallListGridOptions.api?.setRowData(this.createRowData([]));
      this.config.totalItems = 0;
    }
  }

  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.missedInboundCallListGridOptions.api?.setRowData(this.createRowData(pageContent));
      this.config.currentPage = event;
    } else {
      this.config.currentPage = event;
      this.searchParam.page = event - 1;
      this.showReports(event);
    }
  }


  setToDateValidation() {
    this.minEndDate = this.startDate.value;
    this.maxStartDate = this.endDate.value;
  }

  ngOnDestroy() {
    this.cacheManager.clearCache();
  }

}
