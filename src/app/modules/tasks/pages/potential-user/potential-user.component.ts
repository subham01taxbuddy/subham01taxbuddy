import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ColDef, GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ChatOptionsDialogComponent } from '../../components/chat-options/chat-options-dialog.component';
import { UserNotesComponent } from 'src/app/modules/shared/components/user-notes/user-notes.component';
import { SmeListDropDownComponent } from 'src/app/modules/shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { ReviewService } from 'src/app/modules/review/services/review.service';
import { environment } from 'src/environments/environment';
import { GenericCsvService } from 'src/app/services/generic-csv.service';
import { CacheManager } from 'src/app/modules/shared/interfaces/cache-manager.interface';
import * as moment from 'moment';
import { ReportService } from 'src/app/services/report-service';
import { LeaderListDropdownComponent } from 'src/app/modules/shared/components/leader-list-dropdown/leader-list-dropdown.component';
import { ChatService } from 'src/app/modules/chat/chat.service';
import { ConfirmDialogComponent } from 'src/app/modules/shared/components/confirm-dialog/confirm-dialog.component';
import { ReAssignActionDialogComponent } from '../../components/re-assign-action-dialog/re-assign-action-dialog.component';

@Component({
  selector: 'app-potential-user',
  templateUrl: './potential-user.component.html',
  styleUrls: ['./potential-user.component.scss']
})
export class PotentialUserComponent implements OnInit, OnDestroy {
  loading = false;
  agentId = null;
  itrStatus: any = [];
  userInfo: any = [];
  ogStatusList: any = [];
  usersGridOptions: GridOptions;
  config: any;
  roles: any;
  chatBuddyDetails: any;
  statuslist: any = [
    { statusName: 'ITR Filed', statusId: '18' },
    { statusName: 'Interested', statusId: '16' },
  ];
  searchParam: any = {
    serviceType: null,
    statusId: null,
    page: 0,
    pageSize: 20,
    mobileNumber: null,
    emailId: null,
    migrationSource: null,
    panNumber: null,
    name: null,
  }
  showCsvMessage: boolean;
  dataOnLoad = true;
  userInfoLength: any;
  sortMenus = [
    { value: 'name', name: 'Name' },
    { value: 'createdDate', name: 'Creation Date' }
  ];
  sortBy: any = {};
  searchBy: any = {};
  searchMenus = [];
  clearUserFilter: number;
  searchAsPrinciple: boolean = false;
  partnerType: any;
  migrationList = [
    { value: 'Registered', name: 'Registered' },
    { value: 'ITR Filed', name: 'ITR Filed' }
  ]
  dialogRef: any;

  constructor(
    private reviewService: ReviewService,
    private utilsService: UtilsService,
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private dialog: MatDialog,
    private reportService: ReportService,
    private genericCsvService: GenericCsvService,
    private cacheManager: CacheManager,
    private chatService: ChatService,
    @Inject(LOCALE_ID) private locale: string
  ) {
    this.usersGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.usersCreateColumnDef([]),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: params => {
      },

      sortable: true,
    };

    this.config = {
      itemsPerPage: 20,
      currentPage: 1,
      totalItems: 0
    };
  }

  ngOnInit() {
    const userId = this.utilsService.getLoggedInUserID();
    this.roles = this.utilsService.getUserRoles();
    this.partnerType = this.utilsService.getPartnerType();
    if (this.roles.includes('ROLE_FILER')) {
      this.searchMenus = [
        { value: 'email', name: 'Email' },
        { value: 'panNumber', name: 'PAN Number' },
        { value: 'name', name: 'Name' },
      ]
    } else {
      this.searchMenus = [
        { value: 'email', name: 'Email' },
        { value: 'mobileNumber', name: 'Mobile No' },
        { value: 'panNumber', name: 'PAN Number' },
        { value: 'name', name: 'Name' },
      ]
    }
    if (!this.roles.includes('ROLE_ADMIN') && !this.roles.includes('ROLE_LEADER')) {
      this.agentId = userId;
      this.search();
    } else {
      this.dataOnLoad = false;
    }
    this.getMasterStatusList();
  }

  maskMobileNumber(mobileNumber) {
    if (mobileNumber) {
      return 'X'.repeat(mobileNumber.length);
    }
    return '-';
  }

  sortByObject(object) {
    this.sortBy = object;
  }

  searchByObject(object) {
    this.searchBy = object;
    console.log('object from search param ', this.searchBy);
  }


  async getMasterStatusList() {
    this.itrStatus = await this.utilsService.getStoredMasterStatusList();
    this.ogStatusList = await this.utilsService.getStoredMasterStatusList();
  }


  fromServiceType(event) {
    this.searchParam.serviceType = event;
    this.search('serviceType');

    if (this.searchParam.serviceType) {
      setTimeout(() => {
        this.itrStatus = this.ogStatusList.filter(item => item.applicableServices.includes(this.searchParam.serviceType));
      }, 100);
    }

  }

  filerId: number;
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

  fromSme1(event) {
    console.log('sme-drop-down', event);
    if (event) {
      this.leaderId = event ? event.userId : null;
    }
    if (this.leaderId) {
      this.agentId = this.leaderId;
    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }
  }

  search = (form?, isAgent?, pageChange?): Promise<any> => {
    //'https://dev-api.taxbuddy.com/report/bo/user-list-new?page=0&pageSize=20&active=false'
    if (!pageChange) {
      this.cacheManager.clearCache();
      console.log('in clear cache')
    }
    this.loading = true;
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

    if (this.searchBy?.mobileNumber) {
      this.searchParam.mobileNumber = this.searchBy?.mobileNumber
    }
    if (this.searchBy?.email) {
      this.searchParam.emailId = this.searchBy?.email
      this.searchParam.emailId = this.searchParam.emailId.toLocaleLowerCase();
    }

    if (this.searchBy?.panNumber) {
      this.searchParam.panNumber = this.searchBy?.panNumber
    }

    if (this.searchBy?.name) {
      this.searchParam.name = this.searchBy?.name
    }

    let data = this.utilsService.createUrlParams(this.searchParam);

    let leaderFilter = ''
    if (this.leaderId) {
      leaderFilter = `&leaderUserId=${this.leaderId}`
    }
    let filerFilter = '';
    if (this.filerId && this.searchAsPrinciple === true) {
      leaderFilter = '';
      filerFilter = `&searchAsPrincipal=true&filerUserId=${this.filerId}`
    }
    if (this.filerId && this.searchAsPrinciple === false) {
      leaderFilter = '';
      filerFilter = `&filerUserId=${this.filerId}`
    }

    let param = `/bo/user-list-new?${data}&active=false${leaderFilter}${filerFilter}`;
    let sortByJson = '&sortBy=' + encodeURI(JSON.stringify(this.sortBy));
    if (Object.keys(this.sortBy).length) {
      param = param + sortByJson;
    }
    return this.reportService.getMethod(param).toPromise().then((result: any) => {
      this.loading = false;
      if (result.success) {
        if (result.data && result.data['content'] instanceof Array) {
          this.usersGridOptions.api?.setRowData(this.createRowData(result.data['content']));
          this.usersGridOptions.api?.setColumnDefs(this.usersCreateColumnDef(this.itrStatus));
          this.userInfo = result.data['content'];
          this.userInfoLength = this.userInfo?.length;
          this.config.totalItems = result.data.totalElements;
          this.cacheManager.initializeCache(this.createRowData(result.data['content']));

          const currentPageNumber = pageChange || this.searchParam.page + 1;
          this.cacheManager.cachePageContent(currentPageNumber, this.createRowData(result.data['content']));
          this.config.currentPage = currentPageNumber;

        } else {
          this.usersGridOptions.api?.setRowData(this.createRowData([]));
          this.config.totalItems = 0;
          this._toastMessageService.alert('error', result.message)
        }
      } else {
        this._toastMessageService.alert("error", result.message);
        this.usersGridOptions.api?.setRowData(this.createRowData([]));
        this.config.totalItems = 0;
      }
    }).catch(() => {
      this.loading = false;
      this._toastMessageService.alert('error', 'error')
    })
  }

  async downloadReport() {
    this.loading = true;
    this.showCsvMessage = true;
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
    let leaderFilter = ''
    if (this.leaderId) {
      leaderFilter = `&leaderUserId=${this.leaderId}`
    }
    let filerFilter = '';
    if (this.filerId && this.searchAsPrinciple === true) {
      leaderFilter = '';
      filerFilter = `&searchAsPrincipal=true&filerUserId=${this.filerId}`
    }
    if (this.filerId && this.searchAsPrinciple === false) {
      leaderFilter = '';
      filerFilter = `&filerUserId=${this.filerId}`
    }

    let status = ''
    if (this.utilsService.isNonEmpty(this.searchParam.statusId)) {
      status += `&status=${this.searchParam.statusId}`;
    }

    let param = `/bo/user-list-new?active=false${leaderFilter}${filerFilter}${status}`;
    let sortByJson = '&sortBy=' + encodeURI(JSON.stringify(this.sortBy));
    if (Object.keys(this.sortBy).length) {
      param = param + sortByJson;
    }

    if (Object.keys(this.searchBy).length) {
      let searchByKey = Object.keys(this.searchBy);
      let searchByValue = Object.values(this.searchBy);
      param = param + '&' + searchByKey[0] + '=' + searchByValue[0];
    }

    let fieldName = [
      { key: 'name', value: 'Name' },
      { key: 'customerNumber', value: 'Mobile No' },
      { key: 'email', value: 'Email' },
      { key: 'source', value: 'Status' },
      { key: 'eriClientValidUpto', value: 'ERI Client' },
      { key: 'panNumber', value: 'PAN Number' },
      { key: 'createdDate', value: 'Created Date' },
      { key: 'userId', value: 'User Id' },
      { key: 'leaderName', value: 'Leader Name' },
      { key: 'filerName', value: 'Filer Name' },
    ]

    await this.genericCsvService.downloadReport(environment.url + '/report', param, 0, 'potential-user', fieldName, {});
    this.loading = false;
    this.showCsvMessage = false;
  }

  createRowData(userData: any) {
    let userArray = [];
    for (let i = 0; i < userData.length; i++) {
      let userInfo: any = Object.assign({}, userArray[i], {
        userId: userData[i].userId,
        createdDate: this.utilsService.isNonEmpty(userData[i].createdDate) ? userData[i].createdDate : '-',
        name: userData[i].name,
        customerNumber: this.utilsService.isNonEmpty(userData[i].customerNumber) ? userData[i].customerNumber : '-',
        email: this.utilsService.isNonEmpty(userData[i].email) ? userData[i].email : '-',
        serviceType: userData[i].serviceType,
        assessmentYear: userData[i].assessmentYear,
        callerAgentName: userData[i].filerName,
        leaderName: userData[i].leaderName,
        filerName: userData[i].filerName,
        callerAgentNumber: userData[i].filerMobile,
        callerAgentUserId: userData[i].filerUserId,
        statusId: userData[i].statusId,
        statusUpdatedDate: userData[i].statusUpdatedDate,
        panNumber: this.utilsService.isNonEmpty(userData[i].panNumber) ? userData[i].panNumber : null,
        eriClientValidUpto: userData[i].eriClientValidUpto,
        laguage: userData[i].laguage,
        itrObjectStatus: userData[i].itrObjectStatus,
        openItrId: userData[i].openItrId,
        lastFiledItrId: userData[i].lastFiledItrId,
        source: userData[i].source,
        statusName: userData[i].statusName,
        requestId: userData[i].requestId,
        whatsAppRequestId: userData[i].whatsAppRequestId

      })
      userArray.push(userInfo);
    }
    return userArray;
  }



  usersCreateColumnDef(itrStatus) {
    console.log(itrStatus);
    let loggedInUserRoles = this.utilsService.getUserRoles();
    let filtered = loggedInUserRoles.filter(item => item === 'ROLE_ADMIN' || item === 'ROLE_LEADER' || item === 'ROLE_OWNER');
    let showOwnerCols = filtered && filtered.length > 0 ? true : false;
    let columnDefs: ColDef[] = [

      // return [
      {
        headerName: 'Name',
        field: 'name',
        width: 180,
        suppressMovable: true,
        pinned: 'left',
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Mobile No',
        field: 'customerNumber',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        // code to masking mobile no
        cellRenderer: (params) => {
          const mobileNumber = params.value;
          if (mobileNumber) {
            if (!this.roles.includes('ROLE_ADMIN') && !this.roles.includes('ROLE_LEADER')) {
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
        headerName: 'Email',
        field: 'email',
        width: 200,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        cellRenderer: function (params) {
          return `<a href="mailto:${params.value}">${params.value}</a>`
        }
      },
      {
        headerName: 'Source',
        field: 'source',
        width: 100,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        valueGetter: function nameFromCode(params) {
          const source = params.data.source.toLowerCase();

          if (source.includes("itr-filed")) {
            return 'ITR Filed';
          } else if (source.includes("itr-interested") ||
            source.includes("registered-users") ||
            source.includes("tpa-paid")) {
            return 'Registered';
          } else {
            return 'NA';
          }
        }

      },

      {
        headerName: 'ERI Client',
        field: 'eriClientValidUpto',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data: any) => {
          if (data.value !== null)
            return formatDate(data.value, 'dd/MM/yyyy', this.locale);
          else
            return '-';
        },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'PAN Number',
        field: 'panNumber',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      // {
      //   headerName: 'Service Type',
      //   field: 'serviceType',
      //   width: 100,
      //   suppressMovable: true,
      //   cellStyle: { textAlign: 'center' },
      //   filter: "agTextColumnFilter",
      //   filterParams: {
      //     filterOptions: ["contains", "notContains"],
      //     debounceMs: 0
      //   }
      // },
      // {
      //   headerName: 'Language',
      //   field: 'laguage',
      //   width: 100,
      //   suppressMovable: true,
      //   cellStyle: { textAlign: 'center' },
      //   filter: "agTextColumnFilter",
      //   filterParams: {
      //     filterOptions: ["contains", "notContains"],
      //     debounceMs: 0
      //   }
      // },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data: any) => {
          if (data.value != '-') {
            return formatDate(data?.value, 'dd/MM/yyyy', this.locale);
          } else {
            return '-'
          }

        },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      // {
      //   headerName: 'Status Updated On',
      //   field: 'statusUpdatedDate',
      //   width: 120,
      //   suppressMovable: true,
      //   cellStyle: { textAlign: 'center' },
      //   cellRenderer: (data: any) => {
      //     if (data !== null)
      //       return formatDate(data.value, 'dd/MM/yyyy', this.locale);
      //     else
      //       return '-';
      //   },
      //   filter: "agTextColumnFilter",
      //   filterParams: {
      //     filterOptions: ["contains", "notContains"],
      //     debounceMs: 0
      //   }
      // },
      {
        headerName: 'User Id',
        field: 'userId',
        width: 80,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Leader Name',
        field: 'leaderName',
        width: 200,
        suppressMovable: true,
        hide: !showOwnerCols,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Filer Name',
        field: 'filerName',
        width: 200,
        suppressMovable: true,
        hide: !showOwnerCols,
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
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Call to user"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;color:#04a4bc;">
          <i class="fa-solid fa-phone"  data-action-type="call"></i>
           </button>`;
        },
        width: 80,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      // {
      //   headerName: 'Chat',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params: any) {
      //     return `<button type="button" class="action_icon add_button" title="Open Chat"
      //       style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
      //         <i class="fa fa-comments-o" aria-hidden="true" data-action-type="open-chat"></i>
      //        </button>`;
      //   },
      //   width: 60,
      //    pinned: 'right',
      //   cellStyle: function (params: any) {
      //     return {
      //       textAlign: 'center', display: 'flex',
      //       'align-items': 'center',
      //       'justify-content': 'center'
      //     }
      //   },
      // },
      {
        headerName: 'Notes',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Click see/add notes"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
          <i class="far fa-file-alt" style="color:#ab8708;" aria-hidden="true" data-action-type="addNotes"></i>
           </button>`;
        },
        width: 80,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      {
        headerName: 'Active',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Activate User"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
          <i class="fa-regular fa-user-check" data-action-type="active"></i>
           </button>`;
        },
        width: 85,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },

    ]
    return columnDefs;
  }


  onUsersRowClicked(params: any) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'call': {
          this.call(params.data);
          break;
        }
        case 'open-chat': {
          this.openChat(params.data)
          break;
        }
        case 'addNotes': {
          this.showNotes(params.data)
          break;
        }
        case 'active': {
          this.assignFilerBeforeActivate(params.data)
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
        this.search();
        return;
      } else {
        this.loading = true;
        const param = `tts/outbound-call`;
        const reqBody = {
          "agent_number": await this.utilsService.getMyCallingNumber(),
          "customer_number": data.customerNumber
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
    },
      (error) => {
        this.loading = false;
        if (error.error && error.error.error) {
          this._toastMessageService.alert("error", error.error.error);
          this.search();
        } else {
          this._toastMessageService.alert("error", "An unexpected error occurred.");
        }
      }
    );


  }

  openChat(client) {
    let disposable = this.dialog.open(ChatOptionsDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.name,
        serviceType: client.serviceType,
        requestId: client.requestId,
        whatsAppRequestId: client.whatsAppRequestId
      }
    })

    disposable.afterClosed().subscribe(result => {
      if(result?.requestId){
        this.chatBuddyDetails = result;
        this.chatService.unsubscribeRxjsWebsocket();
        this.chatService.initRxjsWebsocket(this.chatBuddyDetails.request_id);
     }
    });
  }

  showNotes(client) {
    this.utilsService.getUserCurrentStatus(client.userId).subscribe((res: any) => {
      console.log(res);
      if (res.error) {
        this.utilsService.showSnackBar(res.error);
        this.search();
        return;
      } else {
        let disposable = this.dialog.open(UserNotesComponent, {
          width: '75vw',
          height: 'auto',
          data: {
            userId: client.userId,
            clientName: client.name,
            serviceType: client.serviceType,
            clientMobileNumber: client.customerNumber
          }
        })

        disposable.afterClosed().subscribe(result => {
        });
      }
    }, error => {
      this.loading = false;
      if (error.error && error.error.error) {
        this._toastMessageService.alert("error", error.error.error);
        this.search();
      } else {
        this._toastMessageService.alert("error", "An unexpected error occurred.");
      }
    });

  }

  assignFilerBeforeActivate(data) {
    let smeList = JSON.parse(sessionStorage.getItem('SME_LIST'));
    smeList.forEach((item) => {
      if (item.name === data.leaderName)
        data['leaderUserId'] = item.userId;
      if (item.name === data.filerName)
        data['filerUserId'] = item.userId;
    });
    let loggedInId = this.utilsService.getLoggedInUserID();
    if (this.roles.includes('ROLE_LEADER') && data.leaderUserId != loggedInId) {
      debugger
      this.active(data);
    } else {
      this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Assign Filer Confirmation',
          message: 'Do you want to assign filer?',
        },
      });
      this.dialogRef.afterClosed().subscribe(result => {
        if (result === 'YES') {
          let selectedUser: any = [];
          selectedUser[0] = (data);
          let disposable = this.dialog.open(ReAssignActionDialogComponent, {
            width: '65%',
            height: 'auto',
            data: {
              data: selectedUser,
            },
          });
          disposable.afterClosed().subscribe((result) => {
            console.log('result of reassign user ', result);
            if (result?.data === 'success') {
              debugger
              this.active(data);
            }
          });
        } else {
          debugger
          this.active(data);
        }
      })
    }
  }


  active(data) {
    //'https://dev-api.taxbuddy.com/user/leader-assignment?userId=8729&serviceType=ITR&statusId=16' \
    this.utilsService.getUserCurrentStatus(data.userId).subscribe(
      (res: any) => {
        console.log(res);
        if (res.error) {
          this.utilsService.showSnackBar(res.error);
          this.search();
        } else {
          console.log('data to active user', data);
          let loggedInId = this.utilsService.getLoggedInUserID();
          this.loading = true;
          const param = `/leader-assignment?userId=${data.userId}&serviceType=${data.serviceType}&statusId=16`;
          this.userMsService.getMethod(param).subscribe(
            (result: any) => {
              console.log('res after active ', result);
              this.loading = false;
              if (result.success) {
                if (this.roles.includes('ROLE_LEADER') && result.data.leaderUserId != loggedInId) {
                  this.reAssign(data, loggedInId);
                } else {
                  this.utilsService.showSnackBar('user activated successfully.');
                }
              } else {
                this.utilsService.showSnackBar(
                  'Error while Activate User, Please try again.'
                );
                this.search();
              }
            },
            (error) => {
              this.loading = false;
              this.utilsService.showSnackBar(
                'Error while Activate User, Please try again.'
              );
              this.search();
            }
          );
        }
      },
      (error) => {
        this.loading = false;
        if (error.error && error.error.error) {
          this._toastMessageService.alert("error", error.error.error);
          this.search();
        } else {
          this._toastMessageService.alert("error", "An unexpected error occurred.");
        }
      }
    );
  }


  reAssign(data, loggedInId) {
    // 'https://uat-api.taxbuddy.com/user/v2/user-reassignment?userId=13621&serviceType=ITR&filerUserId=14198'
    this.loading = true
    this.utilsService.getUserCurrentStatus(data.userId).subscribe((res: any) => {
      console.log(res);
      if (res.error) {
        this.utilsService.showSnackBar(res.error);
        this.loading = false;
        return;
      } else {
        this.loading = true;
        let leaderFilter = '';
        if (this.leaderId) {
          leaderFilter += `&leaderUserId=${loggedInId}`
        }
        const param = `/v2/user-reassignment?userId=${data.userId}&serviceType=${data.serviceType}${leaderFilter}`
        this.userMsService.getMethod(param).subscribe((res: any) => {
          this.loading = false;
          console.log(res);
          if (res.success) {
            this.utilsService.showSnackBar('user activated &  re assigned successfully.');
            this.resetFilters();
          } else {
            this.utilsService.showSnackBar(res.error)
            console.log(res.message)
          }
        }, error => {
          this.loading = false;
          this.utilsService.showSnackBar('Leader not found active, please try another.');
          console.log(error);
        })
      }

    }, error => {
      this.loading = false;
      if (error.error && error.error.error) {
        this.utilsService.showSnackBar(error.error.error);
      } else {
        this.utilsService.showSnackBar("An unexpected error occurred.");
      }
    });
  }

  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.usersGridOptions.api?.setRowData(this.createRowData(pageContent));
      this.config.currentPage = event;
    } else {
      this.config.currentPage = event;
      this.searchParam.page = event - 1;
      this.search('', '', event);
    }
  }

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  @ViewChild('leaderDropDown') leaderDropDown: LeaderListDropdownComponent;
  resetFilters() {
    this.clearUserFilter = moment.now().valueOf();
    this.searchParam.page = 0;
    this.searchParam.pageSize = 20;
    this.searchParam.mobileNumber = null;
    this.searchParam.emailId = null;
    this.searchParam.statusId = null;
    this.searchParam.migrationSource = null;
    this.searchParam.panNumber = null;
    this.searchParam.name = null;
    this.usersGridOptions.api?.setRowData(this.createRowData([]));
    this.userInfoLength = 0;
    this.config.totalItems = 0;
    this?.smeDropDown?.resetDropdown();
    this?.leaderDropDown?.resetDropdown();
    this.searchBy = {};
    this.agentId = this.utilsService.getLoggedInUserID();
  }

  ngOnDestroy() {
    this.cacheManager.clearCache();
  }

  closeChat(){
    this.chatBuddyDetails = null;
  }
}
