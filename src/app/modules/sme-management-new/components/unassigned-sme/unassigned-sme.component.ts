import { DatePipe } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import * as moment from 'moment';
import { LeaderListDropdownComponent } from 'src/app/modules/shared/components/leader-list-dropdown/leader-list-dropdown.component';
import { UserNotesComponent } from 'src/app/modules/shared/components/user-notes/user-notes.component';
import { CacheManager } from 'src/app/modules/shared/interfaces/cache-manager.interface';
import { ReportService } from 'src/app/services/report-service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { UpdateStatusComponent } from './update-status/update-status.component';
import { ConfirmDialogComponent } from 'src/app/modules/shared/components/confirm-dialog/confirm-dialog.component';


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
  selector: 'app-unassigned-sme',
  templateUrl: './unassigned-sme.component.html',
  styleUrls: ['./unassigned-sme.component.scss'],
  providers: [DatePipe,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class UnassignedSmeComponent implements OnInit, OnDestroy {
  sortBy: any = {};
  sortMenus = [
    { value: 'name', name: 'Name' },
    { value: 'roles', name: 'Roles' },
    { value: 'parentName', name: 'Parent Name' },
  ];
  smeListGridOptions: GridOptions;
  loading = false;
  smeList: any = [];
  smeInfo: any;
  config: any;
  loggedInSme: any;
  searchParam: any = {
    statusId: null,
    page: 0,
    pageSize: 20,
    assigned: false,
    mobileNumber: null,
    emailId: null,
  };
  searchMenus = [
    {
      value: 'mobileNumber',
      name: 'Mobile Number',
    },
    {
      value: 'name',
      name: 'Name',
    },
    {
      value: 'smeOriginalEmail',
      name: 'Email ID',
    },
    {
      value: 'partnerType',
      name: 'Joining As',
    },
  ];

  searchVal: any;
  key: any;
  showError: boolean = false;
  startDate = new UntypedFormControl('');
  endDate = new UntypedFormControl('');
  minDate = moment.min(moment(), moment('2024-04-01')).toDate();
  minStartDate: string = '2024-04-01';
  maxStartDate = moment().toDate();
  maxEndDate = moment().toDate();
  minEndDate = new Date().toISOString().slice(0, 10);
  toDateMin = this.minDate;
  selectedStatus = new UntypedFormControl('');
  statusList = [
    { value: 'SHORTLISTED', name: 'Shortlisted' },
    { value: 'FINALIZED', name: 'Finalized' },
    { value: 'DOC_PENDING', name: 'Document Pending' },
  ];

  roles: any;
  searchBy: any = {};
  clearUserFilter: number;
  allFilerList: any;

  constructor(
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private router: Router,
    private matDialog: MatDialog,
    private cacheManager: CacheManager,
    private reportService: ReportService,
    private datePipe: DatePipe,
    @Inject(LOCALE_ID) private locale: string
  ) {
    this.allFilerList = JSON.parse(sessionStorage.getItem('SME_LIST'))
    this.smeListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.smeCreateColumnDef(this.allFilerList),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => { },

      sortable: true,
    };
    this.config = {
      itemsPerPage: 20,
      currentPage: 1,
      totalItems: null,
    };

    this.startDate.setValue(this.minDate);
    this.minEndDate = this.startDate.value;
    this.endDate.setValue(new Date());
  }

  ngOnInit() {
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    this.roles = this.utilsService.getUserRoles();
    this.getSmeList();
  }

  leaderId: number;
  agentId: number;

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

  setToDateValidation() {
    this.minEndDate = this.startDate.value;
    this.maxStartDate = this.endDate.value;
  }

  sortByObject(object) {
    this.sortBy = object;
  }

  searchByObject(object) {
    this.searchBy = object;
    console.log('object from search param ', this.searchBy);
  }

  clearValue() {
    this.searchVal = '';
  }

  advanceSearch(key: any) {
    if (!this.key || !this.searchVal) {
      this.showError = true;
      this._toastMessageService.alert(
        'error',
        'Please select attribute and also enter search value.'
      );
      return;
    } else {
      this.showError = false;
      this.getSmeSearchList(key, this.searchVal);
    }
  }

  getSmeSearchList(key: any, searchValue: any) {
    this.loading = true;
    const loggedInSmeUserId = this.loggedInSme[0].userId;

    if (this.searchParam.emailId) {
      this.searchParam.emailId = this.searchParam.emailId.toLocaleLowerCase();
    }
    if (searchValue) {
      searchValue = searchValue.toLocaleLowerCase();
    }

    let data = this.utilsService.createUrlParams(this.searchParam);
    let param = `/sme-details-new/${loggedInSmeUserId}?${data}&${key}=${searchValue}`;
    let sortByJson = '&sortBy=' + encodeURI(JSON.stringify(this.sortBy));
    if (Object.keys(this.sortBy).length) {
      param = param + sortByJson;
    }
    this.userMsService.getMethodNew(param).subscribe(
      (result: any) => {
        this.loading = false;
        console.log('Search result:', result);
        if (
          Array.isArray(result?.data?.content) &&
          result?.data?.content?.length > 0
        ) {
          this.loading = false;
          this.smeInfo = result.data.content;
          this.config.totalItems = result.data.totalElements;
          this.smeListGridOptions.api?.setRowData(
            this.createRowData(this.smeInfo)
          );
        } else {
          this.loading = false;
          this._toastMessageService.alert('error', 'No Lead Data Found .');
          this.smeListGridOptions.api?.setRowData(this.createRowData([]));
          this.config.totalItems = 0;
        }
      },
      (error) => {
        this.loading = false;
        this._toastMessageService.alert('error', 'No Lead Data Found .');
        this.smeListGridOptions.api?.setRowData(this.createRowData([]));
        this.config.totalItems = 0;
      }
    );
  }

  getSmeList=(pageChange?):Promise <any> => {
    // 'https://uat-api.taxbuddy.com/report/bo/sme-details?page=0&pageSize=1&assigned=false' \
    if (!pageChange) {
      this.cacheManager.clearCache();
      console.log('in clear cache');
    }

    let fromData = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toData = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd');

    let loggedInId = this.utilsService.getLoggedInUserID();
    if (this.roles.includes('ROLE_LEADER')) {
      this.leaderId = loggedInId;
    }
    let userFilter = '';
    if ((this.leaderId)) {
      userFilter += `&interviewedBy=${this.leaderId}`;
    }
    let statusFilter = '';
    if (this.selectedStatus.value) {
      statusFilter += `&onboardingStatus=${this.selectedStatus.value}`;
    }

    let data = this.utilsService.createUrlParams(this.searchParam);
    let param = `/bo/sme-details?${data}${userFilter}${statusFilter}&fromDate=${fromData}&toDate=${toData}`;

    if (Object.keys(this.searchBy).length) {
      Object.keys(this.searchBy).forEach(key => {
        param = param + '&' + key + '=' + this.searchBy[key];
      });
    }

    return this.reportService.getMethod(param).toPromise().then((result: any) => {
        console.log('sme list result -> ', result);
        if (Array.isArray(result?.data?.content) && result?.data?.content?.length > 0) {
          this.loading = false;
          this.smeInfo = result.data.content;
          console.log('smelist', this.smeList);
          this.config.totalItems = result.data.totalElements;
          this.smeListGridOptions.api?.setRowData(
            this.createRowData(this.smeInfo)
          );
          this.cacheManager.initializeCache(this.createRowData(this.smeInfo));

          const currentPageNumber = pageChange || this.searchParam.page + 1;
          this.cacheManager.cachePageContent(
            currentPageNumber,
            this.createRowData(this.smeInfo)
          );
          this.config.currentPage = currentPageNumber;
        } else {
          this.loading = false;
          console.log('in else');
          this.smeListGridOptions.api?.setRowData(this.createRowData([]));
          this._toastMessageService.alert(
            'error',
            result.error
          );
          this.config.totalItems = 0;
        }

      }).catch((error)=>{
        this.loading = false;
        this._toastMessageService.alert(
          'error',
          'Fail to getting leads data, try after some time.'
        );
        console.log('Error during getting Leads data. -> ', error);
      });
  }

  smeCreateColumnDef(List) {
    return [
      {
        field: 'selection',
        headerName: '',
        checkboxSelection: true,
        width: 50,
        pinned: 'left',
        lockPosition: true,
        suppressMovable: false,
        cellRenderer: (params) => { },
      },
      {
        headerName: 'Mobile No',
        field: 'mobileNumber',
        width: 120,
        suppressMovable: true,
        pinned: 'left',
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Name',
        field: 'name',
        width: 185,
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Email',
        field: 'smeOriginalEmail',
        width: 190,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        cellRenderer: function (params) {
          return `<a href="mailto:${params.value}">${params.value}</a>`;
        },
      },
      {
        headerName: 'Qualification',
        field: 'qualification',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Current Status',
        field: 'onboardingStatus',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        cellRenderer: function (params: any) {
          if (params.data?.partnerDetails?.onboardingStatus) {
            let onboardingStatus = params.data?.partnerDetails?.onboardingStatus;
            return onboardingStatus;
          } else {
            return '-';
          }
        },
      },
      {
        headerName: 'Joining As',
        field: 'partnerType',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        cellRenderer: function (params: any) {
          if (params?.data?.partnerType) {
            let referredBy = params.data?.partnerType;
            return referredBy;
          } else if (params.data?.partnerDetails?.partnerType) {
            let referredBy = params.data?.partnerDetails?.partnerType;
            return referredBy;
          } else {
            return '-';
          }
        },
      },
      {
        headerName: 'Referred Person',
        field: 'referredBy',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        cellRenderer: function (params: any) {
          if (params?.data && params.data?.partnerDetails) {
            let referredBy = params.data?.partnerDetails?.referredBy;
            return referredBy;
          } else {
            return '-';
          }
        },
      },

      {
        headerName: 'Interviewed By',
        field: 'interviewedBy',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        valueGetter: function (params) {
          let createdUserId = params.data.partnerDetails.interviewedBy
          let filer1 = List;
          let filer = filer1.filter((item) => {
            return item.userId === createdUserId;
          }).map((item) => {
            return item.name;
          });
          return filer;
        }
      },

      {
        headerName: 'View/Edit Profile',
        field: '',
        width: 100,
        pinned: 'right',
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },

        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Click to edit sme" data-action-type="edit"
          style="border: none; background: transparent; font-size: 14px; cursor:pointer; color:#2199e8;">
          <i class="fa-sharp fa-solid fa-pen fa-xs" data-action-type="edit"> Edit</i>
           </button>`;
        },
      },
      {
        headerName: 'Update Status',
        field: '',
        width: 100,
        pinned: 'right',
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },

        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Click to update status" data-action-type="update-status"
          style="border: none; background: transparent; font-size: 14px; cursor:pointer; color:#2199e8;">
          <i class="fas fa-edit" data-action-type="update-status"> </i>
           </button>`;
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
    ];
  }
  public rowSelection: 'single';
  rowMultiSelectWithClick: false;

  createRowData(data: any) {
    return data;
  }

  onSmeRowClicked(params: any) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'edit': {
          this.editAddSme(params.data);
          break;
        }
        case 'update-status': {
          this.updateStatus(params.data);
          break;
        }
        case 'addNotes': {
          this.showNotes(params.data);
          break;
        }
        case 'reject': {
          this.reject(params.data);
          break;
        }
      }
    }
  }

  editAddSme(sme) {
    let smeData = {
      type: 'edit',
      data: sme,
    };
    sessionStorage.setItem('smeObject', JSON.stringify(smeData));
    this.router.navigate(['/sme-management-new/edit-unassignedsme']);
  }

  updateStatus(partner) {
    let disposable = this.matDialog.open(UpdateStatusComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: partner.userId,
        id: partner.id,
        partnerName: partner.name,
        emailAddress: partner.emailAddress,
        status: partner.status,
        currentStatus: partner.currentstatus,
        mode: 'Update Status',
        mobileNumber: partner.mobileNumber,
      },
    });

    disposable.afterClosed().subscribe((result) => {
      console.log('statusData:', result);
      if (result) {
        if (result.data === 'statusChanged') {
          this.getSmeList();
        }
      }
    });
  }

  showNotes(client) {
    let disposable = this.matDialog.open(UserNotesComponent, {
      width: '75vw',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.name,
        serviceType: client.serviceType,
        clientMobileNumber: client.mobileNumber,
      },
    });

    disposable.afterClosed().subscribe((result) => { });
  }

  reject(data) {
    let disposable = this.matDialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Reject/Backed Out SME!',
        message: 'Are you sure?',
      },
    });

    disposable.afterClosed().subscribe(result => {
      if (result === 'YES') {
        console.log('Result',result)
      }
    })

  }

  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.smeListGridOptions.api?.setRowData(this.createRowData(pageContent));
      this.config.currentPage = event;
    } else {
      this.config.currentPage = event;
      this.searchParam.page = event - 1;
      this.getSmeList(event);
    }
  }
  @ViewChild('leaderDropDown') leaderDropDown: LeaderListDropdownComponent;
  resetFilters() {
    this.cacheManager.clearCache();
    this.searchParam.page = 0;
    this.searchParam.size = 20;
    this.config.currentPage = 1;
    this.clearUserFilter = moment.now().valueOf();
    this.searchBy = {};
    this.startDate.setValue('2023-04-01');
    this.endDate.setValue(new Date());
    this.selectedStatus.setValue(null);
    this?.leaderDropDown?.resetDropdown();
    this.getSmeList();
  }
  ngOnDestroy() {
    this.cacheManager.clearCache();
  }
}
