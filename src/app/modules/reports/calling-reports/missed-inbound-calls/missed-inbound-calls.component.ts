import { DatePipe, formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import * as moment from 'moment';
import { ReviewService } from 'src/app/modules/review/services/review.service';
import { SmeListDropDownComponent } from 'src/app/modules/shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { CacheManager } from 'src/app/modules/shared/interfaces/cache-manager.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ReportService } from 'src/app/services/report-service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
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
  selector: 'app-missed-inbound-calls',
  templateUrl: './missed-inbound-calls.component.html',
  styleUrls: ['./missed-inbound-calls.component.scss'],
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
export class MissedInboundCallsComponent implements OnInit,OnDestroy {
  loading = false;
  startDate = new UntypedFormControl('');
  endDate = new UntypedFormControl('');
  status = new UntypedFormControl('');
  minStartDate: string = '2023-04-01';
  maxStartDate = moment().toDate();
  maxEndDate = moment().toDate();
  minEndDate = new Date().toISOString().slice(0, 10);
  missedInboundCallingReport: any;
  config: any;
  searchParam: any = {
    page: 0,
    pageSize: 20,
  };
  statusDropDown: any
  missedInboundCallGridOptions: GridOptions;
  statusList: any = [{ label: 'All', value: 'All' }, { label: 'Pending', value: 'Pending' }, { label: 'Completed', value: 'Completed' }]
  loggedInSme: any;
  roles: any;
  dataOnLoad = true;

  constructor(
    public datePipe: DatePipe,
    private userMsService: UserMsService,
    private reportService: ReportService,
    private reviewService: ReviewService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private itrService: ItrMsService,
    private dialog: MatDialog,
    private cacheManager: CacheManager,
    @Inject(LOCALE_ID) private locale: string,
  ) {
    this.startDate.setValue(new Date());
    this.endDate.setValue(new Date());
    this.maxEndDate = moment().toDate();
    this.setToDateValidation();

    this.missedInboundCallGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.inboundCallColumnDef(),
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

    if (this.roles?.includes('ROLE_OWNER')) {
      this.ownerId = this.loggedInSme[0].userId;
    } else if (!this.roles?.includes('ROLE_ADMIN') && !this.roles?.includes('ROLE_LEADER')) {
      this.filerId = this.loggedInSme[0].userId;
    }

    if(!this.roles.includes('ROLE_ADMIN') && !this.roles.includes('ROLE_LEADER')){
      this.showMissedInboundCall();
    } else{
      this.dataOnLoad = false;
    }
  }

  ownerId: number;
  filerId: number;
  agentId: number;

  fromSme(event, isOwner) {
    console.log('sme-drop-down', event, isOwner);
    if (isOwner) {
      this.ownerId = event ? event.userId : null;
    } else {
      this.filerId = event ? event.userId : null;
    }
    if (this.filerId) {
      this.agentId = this.filerId;

    } else if (this.ownerId) {
      this.agentId = this.ownerId;

    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }

  }

  showMissedInboundCall(pageChange?) {
    // https://uat-api.taxbuddy.com/report/calling-report/missed-inbound-calls
    if(!pageChange){
      this.cacheManager.clearCache();
      console.log('in clear cache')
    }
    this.loading = true;
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    let status = this.status.value || 'ALL'

    let param = ''
    let userFilter = '';
    if (this.ownerId && !this.filerId && !pageChange) {
      this.searchParam.page = 0;
      this.config.currentPage = 1
      userFilter += `&ownerUserId=${this.ownerId}`;

    }
    if (this.ownerId && pageChange) {
      userFilter += `&ownerUserId=${this.ownerId}`;
    }

    if (this.filerId && !pageChange) {
      userFilter += `&filerUserId=${this.filerId}`;
      this.searchParam.page = 0;
      this.config.currentPage = 1
    }

    if (this.filerId && pageChange) {
      userFilter += `&filerUserId=${this.filerId}`;
    }

    let statusFilter = '';
    if (status && !pageChange) {
      this.searchParam.page = 0;
      this.config.currentPage = 1
      statusFilter = `&status=${status}`;
    }
    if (status && pageChange ) {
      statusFilter = `&status=${status}`;
    }


    let data = this.utilsService.createUrlParams(this.searchParam);

    param = `/calling-report/missed-inbound-calls?fromDate=${fromDate}&toDate=${toDate}&${data}${userFilter}${statusFilter}`;
    this.reportService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
        this.missedInboundCallingReport = response?.data?.content;
        this.config.totalItems = response?.data?.totalElements;
        this.missedInboundCallGridOptions.api?.setRowData(this.createRowData(this.missedInboundCallingReport));
        this.cacheManager.initializeCache(this.createRowData(this.missedInboundCallingReport));

        const currentPageNumber = pageChange || this.searchParam.page + 1;
        this.cacheManager.cachePageContent(currentPageNumber,this.createRowData(this.missedInboundCallingReport));
        this.config.currentPage = currentPageNumber;

      } else {
        this.loading = false;
        this._toastMessageService.alert("error", response.message);
      }
    }, (error) => {
      this.loading = false;
      this._toastMessageService.alert("error", "Error");
    });

  }

  createRowData(missedInboundCallInfo) {
    console.log('missedInboundCallInfo -> ', missedInboundCallInfo);
    let missedInboundCallArray = [];
    for (let i = 0; i < missedInboundCallInfo.length; i++) {
      let smeReportInfo = Object.assign({}, missedInboundCallArray[i], {
        clientName: missedInboundCallInfo[i].clientName,
        clientNumber: missedInboundCallInfo[i].clientNumber,
        callDate: missedInboundCallInfo[i].callDate,
        assignedUserName: missedInboundCallInfo[i].assignedUserName,
        currentStatus: missedInboundCallInfo[i].currentStatus || '-',
        parentName: missedInboundCallInfo[i].parentName,
      })
      missedInboundCallArray.push(smeReportInfo);
    }
    console.log('missedInboundCallArray-> ', missedInboundCallArray)
    return missedInboundCallArray;
  }

  inboundCallColumnDef() {
    return [
      {
        headerName: 'Client Name',
        field: 'clientName',
        sortable: true,
        width: 180,
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
        width: 200,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Call Date',
        field: 'callDate',
        sortable: true,
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        cellRenderer: (data) => {
          if (data?.value != '-') {
            return formatDate(data?.value, 'dd MMM yyyy', this?.locale);
          } else {
            return '-';
          }
        }
      },
      {
        headerName: 'SME Name',
        field: 'assignedUserName',
        sortable: true,
        width: 185,
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
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Parent Name',
        field: 'parentName',
        sortable: true,
        width: 180,
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
        width: 70,
        pinned: 'right',
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

  downloadReport() {

  }

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  resetFilters() {
    this.cacheManager.clearCache();
    this.searchParam.page = 0;
    this.searchParam.pageSize = 20;
    this.config.currentPage = 1
    this.startDate.setValue(new Date());
    this.endDate.setValue(new Date());
    this.status.setValue('All')
    this?.smeDropDown?.resetDropdown();
    if(this.dataOnLoad) {
      this.showMissedInboundCall();
    } else {
      //clear grid for loaded data
      this.missedInboundCallGridOptions.api?.setRowData(this.createRowData([]));
      this.config.totalItems = 0;
    }
  }

  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.missedInboundCallGridOptions.api?.setRowData(this.createRowData(pageContent));
      this.config.currentPage = event;
    } else {
      this.config.currentPage = event;
      this.searchParam.page = event - 1;
      this.showMissedInboundCall(event);
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
