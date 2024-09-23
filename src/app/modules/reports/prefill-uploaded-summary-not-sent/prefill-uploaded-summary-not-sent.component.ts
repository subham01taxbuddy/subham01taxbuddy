import { DatePipe, formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { GridOptions } from 'ag-grid-community';
import * as moment from 'moment';
import { CacheManager } from '../../shared/interfaces/cache-manager.interface';
import { GenericCsvService } from 'src/app/services/generic-csv.service';
import { ReportService } from 'src/app/services/report-service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';
import { SmeListDropDownComponent } from '../../shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { environment } from 'src/environments/environment';
import { ChatOptionsDialogComponent } from '../../tasks/components/chat-options/chat-options-dialog.component';
import { ReviewService } from '../../review/services/review.service';
import { UserNotesComponent } from '../../shared/components/user-notes/user-notes.component';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';

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
  selector: 'app-prefill-uploaded-summary-not-sent',
  templateUrl: './prefill-uploaded-summary-not-sent.component.html',
  styleUrls: ['./prefill-uploaded-summary-not-sent.component.css'],
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
export class PrefillUploadedSummaryNotSentComponent implements OnInit {
  loading = false;
  showCsvMessage: boolean;
  loggedInSme: any;
  roles: any;
  filingDoneReport: any;
  config: any;
  searchParam: any = {
    page: 0,
    pageSize: 20,
  };
  filingDoneReportGridOptions: GridOptions;
  searchAsPrinciple: boolean = false;
  startDate = new UntypedFormControl('');
  endDate = new UntypedFormControl('');
  minStartDate = moment.min(moment(), moment('2024-04-01')).toDate();
  maxStartDate = moment().toDate();
  maxEndDate = moment().toDate();
  minEndDate = new Date().toISOString().slice(0, 10);
  isSummarySent=new UntypedFormControl(false);
  isAisProvided=new UntypedFormControl();
  delayedTimeInMinutes=new UntypedFormControl(30, [Validators.min(0)]);

  constructor(
    public datePipe: DatePipe,
    private utilsService: UtilsService,
    private reportService: ReportService,
    private _toastMessageService: ToastMessageService,
    private genericCsvService: GenericCsvService,
    private cacheManager: CacheManager,
    private reviewService: ReviewService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private router: Router,
    @Inject(LOCALE_ID) private locale: string
  ) {
    this.startDate.setValue(new Date());
    this.endDate.setValue(new Date());
    this.setToDateValidation();
    this.filingDoneReportGridOptions = <GridOptions>{
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
    if (this.roles?.includes('ROLE_LEADER')) {
      this.leaderId = this.loggedInSme[0].userId;
    }
  }

  setToDateValidation() {
    this.minEndDate = this.startDate.value;
    this.maxStartDate = this.endDate.value;
  }

  leaderId: number;
  filerId: number;
  agentId: number;
  fromLeader(event) {
    if (event) {
      this.leaderId = event ? event.userId : null;
      console.log('fromowner:', event);
      this.agentId = this.leaderId;

    }
  }
  fromPrinciple(event) {
    if (event) {
      if (event?.partnerType === 'PRINCIPAL') {
        this.filerId = event ? event.userId : null;
        this.searchAsPrinciple = true;
      } else {
        this.filerId = event ? event.userId : null;
        this.searchAsPrinciple = false;
      }
      this.agentId = this.filerId;
    }
  }
  fromFiler(event) {
    if (event) {
      this.filerId = event ? event.userId : null;
      this.agentId = this.filerId;
    }
  }

  showReports = (pageChange?): Promise<any> => {
    //https://uat-api.taxbuddy.com/report/bo/report-prefill-uploaded-summary-not-sent?page=0&pageSize=10&fromDate=2024-04-01&toDate=2024-04-30
    if (!pageChange) {
      this.cacheManager.clearCache();
      console.log('in clear cache')
    }
    this.loading = true;
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    let param = '';
    let userFilter = '';

    if (this.leaderId && !this.filerId && !pageChange) {
      this.searchParam.page = 0;
      this.config.currentPage = 1
      userFilter += `&leaderUserId=${this.leaderId}`;
    }

    if (this.leaderId && pageChange) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }

    if (this.filerId && this.searchAsPrinciple === true && !pageChange) {
      this.searchParam.page = 0;
      this.config.currentPage = 1
      userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
    }
    if (this.filerId && this.searchAsPrinciple === true && pageChange) {
      userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
    }
    if (this.filerId && this.searchAsPrinciple === false && !pageChange) {
      this.searchParam.page = 0;
      this.config.currentPage = 1
      userFilter += `&filerUserId=${this.filerId}`;
    }
    if (this.filerId && this.searchAsPrinciple === false && pageChange) {
      userFilter += `&filerUserId=${this.filerId}`;
    }

    let summaryFilter ='';
    if((this.utilsService.isNonEmpty(this.isSummarySent.value) && this.isSummarySent.valid)){
      summaryFilter += `&isSummarySent=${this.isSummarySent.value}`;
    }
    let aisFilter ='';
    if((this.utilsService.isNonEmpty(this.isAisProvided.value) && this.isAisProvided.valid)){
      aisFilter += `&isAisProvided=${this.isAisProvided.value}`;
    }
    let timeFilter ='';
    if((this.utilsService.isNonEmpty(this.delayedTimeInMinutes.value) && this.delayedTimeInMinutes.valid)){
      timeFilter += `&delayedTimeInMinutes=${this.delayedTimeInMinutes.value}`;
    }

    let data = this.utilsService.createUrlParams(this.searchParam);
    param = `/bo/report-prefill-uploaded-summary-not-sent?fromDate=${fromDate}&toDate=${toDate}&${data}${userFilter}${summaryFilter}${aisFilter}${timeFilter}`;

    return this.reportService.getMethod(param).toPromise().then((response: any) => {
      this.loading = false;
      if (response.success) {
        this.filingDoneReport = response?.data?.content;
        this.config.totalItems = response?.data?.totalElements || response?.data?.content.length ;
        this.filingDoneReportGridOptions.api?.setRowData(this.createRowData(this.filingDoneReport));
        this.cacheManager.initializeCache(this.createRowData(this.filingDoneReport));

        const currentPageNumber = pageChange || this.searchParam.page + 1;
        this.cacheManager.cachePageContent(currentPageNumber, this.createRowData(this.filingDoneReport));
        this.config.currentPage = currentPageNumber;
        if(response?.data?.content == ''){
          this._toastMessageService.alert("error", "No Data Found ");
        }

      } else {
        this.loading = false;
        this.config.totalItems = 0;
        this.filingDoneReportGridOptions.api?.setRowData(this.createRowData([]));
        this._toastMessageService.alert("error", response.message);
      }
    }).catch(() =>{
      this.config.totalItems = 0;
      this.filingDoneReportGridOptions.api?.setRowData(this.createRowData([]));
      this.loading = false;
      this._toastMessageService.alert("error", "Error");
    })

  }

  createRowData(fillingData) {
    console.log('payoutRepoInfo -> ', fillingData);
    let fillingRepoInfoArray = [];
    for (let i = 0; i < fillingData.length; i++) {
      let agentReportInfo = {
        name: fillingData[i].name,
        email: fillingData[i].email,
        customerNumber: fillingData[i].customerNumber,
        leaderName: fillingData[i].leaderName,
        filerName: fillingData[i].filerName,
        panNumber: fillingData[i].panNumber,
        statusName: fillingData[i].statusName,
        userId: fillingData[i].userId,
        serviceType :fillingData[i].serviceType,
        delayedTime:fillingData[i].delayedTime,
        aisProvidedDate:fillingData[i].aisProvidedDate,
      };
      fillingRepoInfoArray.push(agentReportInfo);
    }
    console.log('fillingRepoInfoArray-> ', fillingRepoInfoArray);
    return fillingRepoInfoArray;
  }


  reportsCodeColumnDef() {
    return [
      {
        headerName: 'Sr. No.',
        width: 40,
        pinned: 'left',
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        valueGetter: function (params) {
          return params.node.rowIndex + 1;
        }
      },
      {
        headerName: 'User Id',
        field: 'userId',
        width: 80,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Name',
        field: 'name',
        width: 130,
        pinned: 'left',
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
      },
      {
        headerName: 'Email',
        field: 'email',
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
        headerName: 'Customer Number',
        field: 'customerNumber',
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
        headerName: 'Pan Number',
        field: 'panNumber',
        width: 130,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
      },
      {
        headerName: 'Status',
        field: 'statusName',
        width: 190,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
      },
      {
        headerName: 'Delayed Time (hh:mm)',
        field: 'delayedTime',
        width: 160,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        cellRenderer: (data: any) => {
          return data.value ? data.value : '-';
        }
      },
      {
        headerName: 'AIS Provided Date',
        field: 'aisProvidedDate',
        width: 180,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        cellRenderer: (data: any) => {
          return data.value ? formatDate(data.value, 'dd/MM/yyyy', this.locale) : '-';
        }
      },
      {
        headerName: 'Leader Name',
        field: 'leaderName',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
      },
      {
        headerName: 'Filer Name',
        field: 'filerName',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
      },

      {
        headerName: 'Call',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Call to user"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;color:#04a4bc;">
          <i class="fa-solid fa-phone" data-action-type="call"></i>
           </button>`;
        },
        width: 60,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          };
        },
      },
      {
        headerName: 'Chat',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Open Chat"
            style="border: none; background: transparent; font-size: 16px; color: #3E82CD; cursor:pointer;">
              <i class="fa fa-comments-o" aria-hidden="true" data-action-type="open-chat"></i>
             </button>`;
        },
        width: 65,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          };
        },
      },
      {
        headerName: 'Notes',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Click see/add notes"
          style="border: none; background: transparent; font-size: 17px; cursor:pointer;">
          <i class="far fa-file-alt" style="color:#3E82CD;" aria-hidden="true" data-action-type="addNotes"></i>
           </button>`;
        },
        width: 70,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          };
        },
      },
      {
        headerName: 'Go To ITR Tab',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Redirect to ITR assigned tab" style="border: none;
            background: transparent; font-size: 12px; cursor:pointer;">
            <i class="fa fa-external-link" aria-hidden="true" data-action-type="redirect"></i>
           </button>`;
        },
        width: 80,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          };
        },
      },

    ]
  }


  async downloadReport() {
    this.loading = true;
    this.showCsvMessage = true;
    let loggedInId = this.utilsService.getLoggedInUserID();
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    let param = ''
    let userFilter = '';
    if (this.leaderId && !this.filerId) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }
    if (this.filerId && this.searchAsPrinciple === true) {
      userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
    }
    if (this.filerId && this.searchAsPrinciple === false) {
      userFilter += `&filerUserId=${this.filerId}`;
    }

    let summaryFilter ='';
    if((this.utilsService.isNonEmpty(this.isSummarySent.value) && this.isSummarySent.valid)){
      summaryFilter += `&isSummarySent=${this.isSummarySent.value}`;
    }
    let aisFilter ='';
    if((this.utilsService.isNonEmpty(this.isAisProvided.value) && this.isAisProvided.valid)){
      aisFilter += `&isAisProvided=${this.isAisProvided.value}`;
    }
    let timeFilter ='';
    if((this.utilsService.isNonEmpty(this.delayedTimeInMinutes.value) && this.delayedTimeInMinutes.valid)){
      timeFilter += `&delayedTimeInMinutes=${this.delayedTimeInMinutes.value}`;
    }

    param = `/bo/report-prefill-uploaded-summary-not-sent?fromDate=${fromDate}&toDate=${toDate}${userFilter}${summaryFilter}${aisFilter}${timeFilter}`;

    let fieldName = [
      { key: 'name', value: 'Name' },
      { key: 'email', value: 'Email' },
      { key: 'customerNumber', value: 'Customer Number' },
      { key: 'panNumber', value: 'Pan Number' },
      { key: 'statusName', value: 'Status' },
      { key: 'delayedTime', value: 'Delayed Time' },
      { key: 'aisProvidedDate', value: 'AIS Provided Date' },
      { key: 'leaderName', value: 'Leader Name' },
      { key: 'filerName', value: 'Filer Name' },
      { key: 'conversationId', value:'kommunicate chat Link'},
      { key: 'whatsAppConversationId', value:'WhatsApp chat Link'},
    ]
    await this.genericCsvService.downloadReport(environment.url + '/report', param, 0, 'prefill-uploaded-summary-not-sent-report', fieldName, {});
    this.loading = false;
    this.showCsvMessage = false;
  }

  onUsersRowClicked(params: any) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'call': {
          this.call(params.data);
          break;
        }
        case 'addNotes': {
          this.showNotes(params.data);
          break;
        }
        case 'open-chat': {
          this.openChat(params.data);
          break;
        }
        case 'redirect':{
          this.redirect(params.data);
          break;
        }
      }
    }
  }

  async call(data) {
    // https://9buh2b9cgl.execute-api.ap-south-1.amazonaws.com/prod/tts/outbound-call
    // let callInfo = data.customerNumber;
    this.utilsService.getUserCurrentStatus(data.userId).subscribe(async (res: any) => {
      console.log(res);
      if (res.error) {
        this.utilsService.showSnackBar(res.error);
        this.showReports();
        return;
      } else {
        let agent_number
        this.loading = true;

        const param = `tts/outbound-call`;
        const agentNumber = await this.utilsService.getMyCallingNumber();
        console.log('agent number', agentNumber);
        if (!agentNumber) {
          this._toastMessageService.alert('error', "You don't have calling role.");
          return;
        }

        const reqBody = {
          "agent_number": agentNumber,
          "userId": data.userId,
        }

        this.reviewService.postMethod(param, reqBody).subscribe((result: any) => {
          this.loading = false;
          if (result.success) {
            this._toastMessageService.alert("success", result.message)
          } else {
            this.utilsService.showSnackBar('Error while making call, Please try again.');
          }
        }, error => {
          this.utilsService.showSnackBar('Error while making call, Please try again.');
          this.loading = false;
        })
      }
    }, error => {
      if (error.error && error.error.error) {
        this._toastMessageService.alert("error", error.error.error);
        this.showReports();
      } else {
        this._toastMessageService.alert("error", "An unexpected error occurred.");
      }
    });
  }


  showNotes(client) {
    this.utilsService
      .getUserCurrentStatus(client.userId)
      .subscribe((res: any) => {
        console.log(res);
        if (res.error) {
          this.utilsService.showSnackBar(res.error);
          this.showReports();
          return;
        } else {
          let disposable = this.dialog.open(UserNotesComponent, {
            width: '75vw',
            height: 'auto',
            data: {
              userId: client.userId,
              clientName: client.name,
              serviceType: client.serviceType,
              clientMobileNumber: client.customerNumber,
            },
          });

          disposable.afterClosed().subscribe((result) => { });
        }
      }, error => {
        this.loading = false;
        if (error.error && error.error.error) {
          this._toastMessageService.alert("error", error.error.error);
          this.showReports();
        } else {
          this._toastMessageService.alert("error", "An unexpected error occurred.");
        }
      });
  }

  isChatOpen = false;
  kommChatLink = null;

  openChat(client) {
    let disposable = this.dialog.open(ChatOptionsDialogComponent, {
      width: '40%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.name,
        serviceType: client.serviceType
      }
    })

    disposable.afterClosed().subscribe(result => {
      if (result.id) {
        this.isChatOpen = true;
        this.kommChatLink = this.sanitizer.bypassSecurityTrustUrl(result.kommChatLink);
      }
    });

  }

  redirect(data){
    this.router.navigate(['/tasks/itr-assigned-users'], { queryParams: { mobileNumber: data.customerNumber } });
  }

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  resetFilters() {
    this.cacheManager.clearCache();
    this.searchParam.page = 0;
    this.searchParam.pageSize = 20;
    this.config.currentPage = 1
    this.isAisProvided.setValue(null);
    this.isSummarySent.setValue(false);
    this.delayedTimeInMinutes.setValue(30);
    this?.smeDropDown?.resetDropdown();
    this.startDate.setValue(new Date());
    this.endDate.setValue(new Date());
    this.config.totalCommissionEarned = 0;
    this.config.totalPartnersPaid = 0;
    this.filingDoneReportGridOptions.api?.setRowData(this.createRowData([]));
    this.config.totalItems = 0;

  }

  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.filingDoneReportGridOptions.api?.setRowData(this.createRowData(pageContent));
      this.config.currentPage = event;
    } else {
      this.config.currentPage = event;
      this.searchParam.page = event - 1;
      this.showReports(event);
    }
  }

  ngOnDestroy() {
    this.cacheManager.clearCache();
  }

}
