import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ChatOptionsDialogComponent } from '../../components/chat-options/chat-options-dialog.component';
import { UserNotesComponent } from 'src/app/modules/shared/components/user-notes/user-notes.component';
import { FormControl } from '@angular/forms';
import { SmeListDropDownComponent } from 'src/app/modules/shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { CoOwnerListDropDownComponent } from 'src/app/modules/shared/components/co-owner-list-drop-down/co-owner-list-drop-down.component';
import { ReviewService } from 'src/app/modules/review/services/review.service';
import { environment } from 'src/environments/environment';
import { GenericCsvService } from 'src/app/services/generic-csv.service';
import { CacheManager } from 'src/app/modules/shared/interfaces/cache-manager.interface';
import * as moment from 'moment';
declare function we_track(key: string, value: any);

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
  coOwnerToggle = new FormControl('');
  coOwnerCheck = false;
  roles: any;
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
    emailId: null
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
  searchMenus = [
    { value: 'email', name: 'Email' },
    { value: 'mobileNumber', name: 'Mobile No' },
  ];
  clearUserFilter: number;
  searchAsPrinciple :boolean =false;

  constructor(
    private reviewService: ReviewService,
    private utilsService: UtilsService,
    private roleBaseAuthGuardService: RoleBaseAuthGuardService,
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private dialog: MatDialog,
    private genericCsvService: GenericCsvService,
    private cacheManager: CacheManager,
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
    this.agentId = userId;
    if (!this.roles.includes('ROLE_ADMIN') && !this.roles.includes('ROLE_LEADER')) {
      this.search();
    } else {
      this.dataOnLoad = false;
    }
    this.getMasterStatusList();
  }

  sortByObject(object) {
    this.sortBy = object;
  }

  searchByObject(object) {
    this.searchBy = object;
    console.log('object from search param ',this.searchBy);
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

  ownerId: number;
  filerId: number;
  leaderId: number;
  fromSme(event, isOwner) {
    console.log('sme-drop-down', event, isOwner);
    if (isOwner) {
      this.leaderId = event ? event.userId : null;
    } else {
      if (event.partnerType === 'PRINCIPAL') {
        this.filerId = event ? event.userId : null;
        this.searchAsPrinciple = true;
      } else {
        this.filerId = event ? event.userId : null;
        this.searchAsPrinciple = false;
      }
    }

    if (this.filerId) {
      this.agentId = this.filerId;
    } else if (this.leaderId) {
      this.agentId = this.leaderId;
      //  this.search('agent');
    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }
    //  this.search('agent');
  }

  coOwnerId: number;
  coFilerId: number;

  fromSme1(event, isOwner) {
    console.log('sme-drop-down', event, isOwner);
    if (isOwner) {
      this.coOwnerId = event ? event.userId : null;
    } else {
      this.coFilerId = event ? event.userId : null;
    }
    if (this.coFilerId) {
      this.agentId = this.coFilerId;
      // this.search('agent');
    } else if (this.coOwnerId) {
      this.agentId = this.coOwnerId;
      //  this.search('agent');
    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }
    //  this.search('agent');
  }

    search(form?, isAgent?, pageChange?) {
    //'https://dev-api.taxbuddy.com/report/bo/user-list-new?page=0&pageSize=20&active=false'
    if (!pageChange) {
      this.cacheManager.clearCache();
      console.log('in clear cache')
    }
    let loggedInId = this.utilsService.getLoggedInUserID();
    if(this.searchBy?.mobileNumber){
      this.searchParam.mobileNumber = this.searchBy?.mobileNumber
    }
    if(this.searchBy?.email){
      this.searchParam.emailId = this.searchBy?.email
    }
    if (form == 'mobile') {
      this.searchParam.page = 0;
      if (
        this.searchParam.mobileNumber == null ||
        this.searchParam.mobileNumber == ''
      ) {
        this.searchParam.mobileNumber = null;
      } else {
        this.searchParam.emailId = null;
      }
      if (this.searchParam.emailId == null || this.searchParam.emailId == '') {
        this.searchParam.emailId = null;
      } else {
        this.searchParam.mobileNumber = null;
      }

      this.searchParam.statusId = null;
    } else if (form == 'status') {
      this.searchParam.page = 0;
      // this.searchParam.serviceType = null;
      this.searchParam.mobileNumber = null;
      this.searchParam.emailId = null;
    } else if (form == 'serviceType') {
      this.searchParam.page = 0;
      this.searchParam.status = null;
      this.searchParam.mobileNumber = null;
      this.searchParam.emailId = null;
    } else if (form == 'agent') {
      this.searchParam.page = 0;
    }
    this.loading = true;

    if (this.searchParam.email) {
      this.searchParam.email = this.searchParam.email.toLocaleLowerCase();
    }
    let data = this.utilsService.createUrlParams(this.searchParam);

    let leaderFilter = ''
    if (this.leaderId) {
      leaderFilter = `&leaderUserId=${this.leaderId}`
    }
    let filerFilter ='';
    if(this.filerId && this.searchAsPrinciple === true){
      leaderFilter ='';
      filerFilter=`&searchAsPrincipal=true&filerUserId=${this.filerId}`
    }
    if(this.filerId && this.searchAsPrinciple === false){
      leaderFilter ='';
      filerFilter=`&filerUserId=${this.filerId}`
    }

    //https://uat-api.taxbuddy.com/report/7521/user-list-new?page=0&pageSize=20&active=false
    // https://uat-api.taxbuddy.com/user/3000/user-list-new?statusId=16&page=0&pageSize=20&active=false
    // 'https://uat-api.taxbuddy.com/user/7522/user-list-new?page=0&searchAsCoOwner=true&pageSize=100&active=false'
    let param = `/bo/user-list-new?${data}&active=false${leaderFilter}${filerFilter}`;
    let sortByJson = '&sortBy=' + encodeURI(JSON.stringify(this.sortBy));
    if (Object.keys(this.sortBy).length) {
      param = param + sortByJson;
    }
    if (this.coOwnerToggle.value && isAgent) {
      param = param + '&searchAsCoOwner=true';
    }
    if (this.coOwnerToggle.value == true && isAgent && loggedInId !== this.agentId) {
      param = `/${this.agentId}/user-list-new?${data}&active=false`;
      if (Object.keys(this.sortBy).length) {
        param = param + sortByJson;
      }
    }
    else {
      param;
    }

    this.userMsService.getMethodNew(param).subscribe(
      (result: any) => {
        this.loading = false;
        if (result.success == false) {
          this._toastMessageService.alert("error", result.message);
          this.usersGridOptions.api?.setRowData(this.createRowData([]));
          this.config.totalItems = 0;
        }
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
        }
        this.loading = false;
      })
  }

  async downloadReport() {
    this.loading = true;

    this.showCsvMessage = true;
    let loggedInId = this.utilsService.getLoggedInUserID();
    let param = `/${this.agentId}/user-list-new?active=false`;

    if (this.coOwnerToggle.value == true) {
      param = param + '&searchAsCoOwner=true';
    }
    if (this.coOwnerToggle.value == true && loggedInId !== this.agentId) {
      param = `/${this.agentId}/user-list-new?active=false`;
    }
    if (this.searchParam.emailId) {
      param = param + '&emailId=' + this.searchParam.emailId.toLocaleLowerCase();
    }
    if (this.searchParam.mobileNumber) {
      param = param + '&mobileNumber=' + this.searchParam.mobileNumber;
    }
    if (this.searchParam.statusId) {
      param = param + '&statusId=' + this.searchParam.statusId;
    }
    else {
      param;
    }
    await this.genericCsvService.downloadReport(environment.url + '/report', param, 0, 'potential-user', '', this.sortBy);
    this.loading = false;
    this.showCsvMessage = false;
  }

  createRowData(userData: any) {
    var userArray = [];
    for (let i = 0; i < userData.length; i++) {
      let userInfo: any = Object.assign({}, userArray[i], {
        userId: userData[i].userId,
        createdDate: this.utilsService.isNonEmpty(userData[i].createdDate) ? userData[i].createdDate : '-',
        name: userData[i].name,
        mobileNumber: this.utilsService.isNonEmpty(userData[i].customerNumber) ? userData[i].customerNumber : '-',
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
        source: userData[i].source
      })
      userArray.push(userInfo);
    }
    return userArray;
  }



  usersCreateColumnDef(itrStatus) {
    console.log(itrStatus);
    var statusSequence = 0;
    let loggedInUserRoles = this.utilsService.getUserRoles();
    let filtered = loggedInUserRoles.filter(item => item === 'ROLE_ADMIN' || item === 'ROLE_LEADER' || item === 'ROLE_OWNER');
    let showOwnerCols = filtered && filtered.length > 0 ? true : false;
    return [
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
        field: 'mobileNumber',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
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
        headerName: 'Status',
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
          if (params.data.source === 'Old Customer Migration Script') {
            return 'ITR Filed'
          } else if (params.data.source === 'Old Interested Customer Migration Script') {
            return 'Interested'
          } else 'NA'
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
        field: 'ownerName',
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
      //   pinned: 'right',
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
          this.active(params.data)
          break;
        }
      }
    }
  }

  call(data) {
    // https://9buh2b9cgl.execute-api.ap-south-1.amazonaws.com/prod/tts/outbound-call
    // let callInfo = data.customerNumber;
    this.loading = true;
    // const param = `/prod/call-support/call`;
    // TODO check the caller agent number;
    const param = `tts/outbound-call`;
    const reqBody = {
      "agent_number": data.callerAgentNumber,
      "customer_number": data.mobileNumber
    }
    // this.userMsService.postMethodAWSURL(param, reqBody).subscribe((result: any) => {
    //   this.loading = false;
    //   if (result.success.status) {
    //     this._toastMessageService.alert("success", result.success.message)
    //   }
    // }, error => {
    //   this.utilsService.showSnackBar('Error while making call, Please try again.');
    //   this.loading = false;
    // })
    this.reviewService.postMethod(param, reqBody).subscribe((result: any) => {
      this.loading = false;
      if (result.success == false) {
        this.loading = false;
        this.utilsService.showSnackBar('Error while making call, Please try again.');
      }
      if (result.success) {
        we_track('Call', {
          'User Name': data?.name,
          'User Phone number ': data.callerAgentNumber,
        });
        this._toastMessageService.alert("success", result.message)
      }
    }, error => {
      this.utilsService.showSnackBar('Error while making call, Please try again.');
      this.loading = false;
    })
  }

  openChat(client) {
    let disposable = this.dialog.open(ChatOptionsDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.name,
        serviceType: client.serviceType
      }
    })

    disposable.afterClosed().subscribe(result => {
    });
  }

  showNotes(client) {
    let disposable = this.dialog.open(UserNotesComponent, {
      width: '75vw',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.name,
        serviceType: client.serviceType,
        clientMobileNumber: client.mobileNumber
      }
    })

    disposable.afterClosed().subscribe(result => {
    });
  }

  active(data) {
    //'https://dev-api.taxbuddy.com/user/leader-assignment?userId=8729&serviceType=ITR&statusId=16' \
    console.log('data to active user', data);
    this.loading = true;
    const param = `/leader-assignment?userId=${data.userId}&serviceType=${data.serviceType}&statusId=16`;
    this.userMsService.getMethod(param).subscribe((result: any) => {
      console.log('res after active ', result)
      this.loading = false;
      if (result.success == true) {
        we_track('Active', {
          'User number ': data.mobileNumber,
        });
        this.utilsService.showSnackBar('user activated successfully.');
      } else {
        this.utilsService.showSnackBar('Error while Activate User, Please try again.');
      }
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar('Error while Activate User, Please try again.');

    })

  }

  // pageChanged(event: any) {
  //   this.config.currentPage = event;
  //   this.searchParam.page = event - 1
  //   if (this.coOwnerToggle.value == true) {
  //     this.search(event - 1, true);
  //   } else {
  //     this.search(event - 1);
  //   }
  // }

  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.usersGridOptions.api?.setRowData(this.createRowData(pageContent));
      this.config.currentPage = event;
    } else {
      this.config.currentPage = event;
      this.searchParam.page = event - 1;
      if (this.coOwnerToggle.value == true) {
        this.search('', true, event);
      } else {
        this.search('', '', event);
      }
    }
  }

  getToggleValue() {
    console.log('co-owner toggle', this.coOwnerToggle.value)
    we_track('Co-Owner Toggle', '');
    if (this.coOwnerToggle.value == true) {
      this.coOwnerCheck = true;
    }
    else {
      this.coOwnerCheck = false;
    }
    this.search('', true);
  }


  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  @ViewChild('coOwnerDropDown') coOwnerDropDown: CoOwnerListDropDownComponent;
  resetFilters() {
    this.clearUserFilter = moment.now().valueOf();
    this.searchParam.page = 0;
    this.searchParam.size = 20;
    this.searchParam.mobileNumber = null;
    this.searchParam.emailId = null;
    this.searchParam.statusId = null;

    this?.smeDropDown?.resetDropdown();

    if (this.coOwnerDropDown) {

      this.coOwnerDropDown.resetDropdown();
      this.search('', true);
    } else {
      if (this.dataOnLoad) {
        this.search();
      } else {
        this.usersGridOptions.api?.setRowData(this.createRowData([]));
        this.userInfoLength = 0;
        this.config.totalItems = 0;
      }
    }
  }

  ngOnDestroy() {
    this.cacheManager.clearCache();
  }
}
