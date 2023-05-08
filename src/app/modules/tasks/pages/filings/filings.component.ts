import { ItrLifecycleDialogComponent } from './../../components/itr-lifecycle-dialog/itr-lifecycle-dialog.component';
import { UtilsService } from 'src/app/services/utils.service';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  AfterContentChecked,
  ViewChild,
} from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { environment } from 'src/environments/environment';
import { ChangeStatusComponent } from 'src/app/modules/shared/components/change-status/change-status.component';
import { UserNotesComponent } from 'src/app/modules/shared/components/user-notes/user-notes.component';
import { UserMsService } from 'src/app/services/user-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';
import { EVerificationDialogComponent } from 'src/app/modules/tasks/components/e-verification-dialog/e-verification-dialog.component';
import { FilingStatusDialogComponent } from 'src/app/modules/itr-filing/filing-status-dialog/filing-status-dialog.component';
import { ReviseReturnDialogComponent } from 'src/app/modules/itr-filing/revise-return-dialog/revise-return-dialog.component';
import { ChatOptionsDialogComponent } from '../../components/chat-options/chat-options-dialog.component';
import { ServiceDropDownComponent } from 'src/app/modules/shared/components/service-drop-down/service-drop-down.component';
import { SmeListDropDownComponent } from 'src/app/modules/shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { FormControl } from '@angular/forms';
import { CoOwnerListDropDownComponent } from 'src/app/modules/shared/components/co-owner-list-drop-down/co-owner-list-drop-down.component';

@Component({
  selector: 'app-filings',
  templateUrl: './filings.component.html',
  styleUrls: ['./filings.component.scss'],
})
export class FilingsComponent implements OnInit, AfterContentChecked {
  loading: boolean = false;
  myItrsGridOptions: GridOptions;
  itrDataList = [];
  agents = [];
  selectedFilingTeamMemberId: number;
  config: any;
  selectedPageNo = 0;
  itrStatus: any = [];
  roles: any;
  loggedInSme:any;
  coOwnerToggle = new FormControl('');
  coOwnerCheck = false;
  searchParams = {
    mobileNumber: null,
    email: null,
    panNumber: null,
    selectedStatusId: 'ALL',
    selectedFyYear: null,
    ownerUserId: null,
    filerUserId: null,
  };
  constructor(
    private itrMsService: ItrMsService,
    public utilsService: UtilsService,
    private userMsService: UserMsService,
    private toastMsgService: ToastMessageService,
    private router: Router,
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private roleBaseAuthGuardService: RoleBaseAuthGuardService
  ) {
    this.myItrsGridOptions = <GridOptions>{
      rowData: this.createOnSalaryRowData([]),
      columnDefs: this.columnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => {
        // params.api.sizeColumnsToFit();
      },
      sortable: true,
      filter: true,
      floatingFilter: true,
    };
    this.selectedFilingTeamMemberId = this.utilsService.getLoggedInUserID();

    if (this.router.getCurrentNavigation().extras.state) {
      this.searchParams.mobileNumber =
        this.router.getCurrentNavigation().extras.state['mobileNumber'];
      console.log(this.router.getCurrentNavigation().extras.state);
      this.search();
    }
  }

  ngOnInit() {
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    console.log('loggedIn Sme Details', this.loggedInSme)
    this.roles = this.loggedInSme[0]?.roles
    this.config = {
      itemsPerPage: 20,
      currentPage: 1,
      totalItems: null,
    };
    this.selectedFilingTeamMemberId = this.utilsService.getLoggedInUserID();
    this.getAgentList();
    this.getMasterStatusList();
  }
  ngAfterContentChecked() {
    this.cdRef.detectChanges();
  }

  async getMasterStatusList() {
    //this.itrStatus = await this.utilsService.getStoredMasterStatusList();
    this.itrStatus = [
      {
        statusId: 'WIP',
        statusName: 'WIP', //WIP - Preparing ITR, Waiting for confirmation, Confirmation received
      },
      {
        statusId: 'ITR_FILED',
        statusName: 'ITR Filed',
      },
      {
        statusId: 'ALL',
        statusName: 'All', //Preparing ITR, Waiting for confirmation, Confirmation received, ITR Filed
      },
    ];
    if (!this.searchParams.mobileNumber) {
      this.searchParams.selectedStatusId = this.itrStatus[2].statusId;
    }
  }

  getAgentList() {
    let loggedInUserRoles = this.utilsService.getUserRoles();
    let loggedInUserId = this.utilsService.getLoggedInUserID();
    const isAgentListAvailable =
      this.roleBaseAuthGuardService.checkHasPermission(loggedInUserRoles, [
        'ROLE_ADMIN',
        'ROLE_ITR_SL',
        'ROLE_GST_SL',
        'ROLE_NOTICE_SL',
      ]);
    if (isAgentListAvailable) {
      const param = `/sme/${loggedInUserId}/child-details`;
      this.userMsService.getMethod(param).subscribe((result: any) => {
        if (result.success) {
          this.agents = result.data;
        }
      });
    }
  }

  fromOwner(event) {
    this.searchParams.ownerUserId = event ? event.userId : null;
    console.log('fromowner:', event);
    this.myItrsList(0, this.selectedFilingTeamMemberId);
  }
  fromFiler(event) {
    this.searchParams.filerUserId = event ? event.userId : null;
    this.myItrsList(0, this.selectedFilingTeamMemberId);
  }
  search() {
    this.myItrsList(0, this.selectedFilingTeamMemberId);
  }

  filter() {
    this.myItrsList(0, this.selectedFilingTeamMemberId);
  }

  coOwnerId: number;
  coFilerId: number;
  agentId: number;

  fromCoOwner(event){
  this.coOwnerId = event.userId;
  this.myItrsList(0, this.selectedFilingTeamMemberId);
  }
  fromCoFiler(event){
  this.coFilerId = event.userId;
  this.myItrsList(0, this.selectedFilingTeamMemberId);
  }

  myItrsList(pageNo, filingTeamMemberId) {
    // https://uat-api.taxbuddy.com/itr/itr-list?pageSize=10&ownerUserId=7522&financialYear=2022-2023&status=ALL
    // &searchAsCoOwner=true&page=0
    this.loading = true;
    return new Promise((resolve, reject) => {
      let param = `/itr-list?page=${pageNo}&pageSize=20`;
      if (this.utilsService.isNonEmpty(this.searchParams.filerUserId)) {
        param = param + `&filerUserId=${this.searchParams.filerUserId}`;
      }
      if (this.utilsService.isNonEmpty(this.searchParams.ownerUserId)) {
        param = param + `&ownerUserId=${this.searchParams.ownerUserId}`;
      }

      if (this.utilsService.isNonEmpty(this.coOwnerId)) {
        param = param + `&ownerUserId=${this.coOwnerId}`;
      }

      if (this.utilsService.isNonEmpty(this.coFilerId)) {
        param = param + `&filerUserId=${this.coFilerId}`;
      }

      if (this.utilsService.isNonEmpty(this.searchParams.selectedFyYear)) {
        param = param + `&financialYear=${this.searchParams.selectedFyYear}`;
      }
      if (this.utilsService.isNonEmpty(this.searchParams.selectedStatusId)) {
        param = param + `&status=${this.searchParams.selectedStatusId}`;
      }
      if (this.utilsService.isNonEmpty(this.searchParams.mobileNumber)) {
        param = param + `&mobileNumber=${this.searchParams.mobileNumber}`;
      }
      if (this.utilsService.isNonEmpty(this.searchParams.email)) {
        param = param + `&email=${this.searchParams.email}`;
      }
      if (this.utilsService.isNonEmpty(this.searchParams.panNumber)) {
        param = param + `&panNumber=${this.searchParams.panNumber}`;
      }

      if (this.coOwnerToggle.value == true && filingTeamMemberId) {
        param = param + '&searchAsCoOwner=true';
      }
      else {
        param;
      }

      console.log('My Params:', param);
      this.itrMsService.getMethod(param).subscribe(
        (res: any) => {
          if(res.success == false){
            this.toastMsgService.alert("error",res.message);
            this.myItrsGridOptions.api?.setRowData(this.createOnSalaryRowData([]));
              this.config.totalItems = 0;
          }
          console.log('filingTeamMemberId: ', res);
          // TODO Need to update the api here to get the proper data like user management
          if (res.data?.content instanceof Array) {
            this.itrDataList = res.data['content'];
            this.config.totalItems = res.data.totalElements;
            this.myItrsGridOptions.api?.setRowData(
              this.createOnSalaryRowData(res.data['content'])
            );
          } else {
            this.itrDataList = [];
            this.config.totalItems = 0;
            this.myItrsGridOptions.api?.setRowData(
              this.createOnSalaryRowData([])
            );
          }
          this.loading = false;
          return resolve(true);
        },
        (error) => {
          this.myItrsGridOptions.api?.setRowData(this.createOnSalaryRowData([]));
              this.config.totalItems = 0;
          this.loading = false;
          return resolve(false);
        }
      );
    });
  }
  fromFy(event) {
    this.searchParams.selectedFyYear = event;
    this.selectedPageNo = 0;
    this.config.currentPage = 1;
    console.log(event);
    this.myItrsList(this.selectedPageNo, this.selectedFilingTeamMemberId);
  }

  createOnSalaryRowData(data) {
    console.log('ITRDATA:', data);
    const newData = [];
    for (let i = 0; i < data.length; i++) {
      newData.push({
        itrId: data[i].itrId,
        userId: data[i].userId,
        fName:
          this.utilsService.isNonEmpty(data[i].family) &&
          data[i].family instanceof Array &&
          data[i].family.length > 0
            ? data[i].family[0].fName
            : '',
        lName:
          this.utilsService.isNonEmpty(data[i].family) &&
          data[i].family instanceof Array &&
          data[i].family.length > 0
            ? data[i].family[0].lName
            : '',
        panNumber: data[i].panNumber,
        contactNumber: data[i].contactNumber,
        email: data[i].email,
        itrType: data[i].itrType,
        ackStatus: data[i].ackStatus,
        acknowledgementReceived: data[i].acknowledgementReceived,
        eFillingCompleted: data[i].eFillingCompleted,
        eFillingDate: data[i].eFillingDate,
        nextYearTpa: data[i].nextYearTpa,
        // isReviewGiven: data[i].reviewGiven,
        isEverified: data[i].isEverified,
        isRevised: data[i].isRevised,
        assessmentYear: data[i].assessmentYear,
        ackNumber: data[i].ackNumber,
        ownerUserId: data[i].ownerUserId,
        filerUserId: data[i].filerUserId,
        status: data[i].status,
      });
    }
    return newData;
  }
  getCount(val) {
    return this.itrDataList.filter(
      (item: any) => item.eFillingCompleted === val
    ).length;
  }

  columnDef() {
    return [
      {
        headerName: 'Client Name',
        // field: "fName",
        sortable: true,
        filter: 'agTextColumnFilter',
        pinned: 'left',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        valueGetter: function (params) {
          return params.data.fName + ' ' + params.data.lName;
        },
      },
      /* {
        headerName: "Last Name",
        field: "lName",
        sortable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      }, */
      {
        headerName: 'Mobile',
        field: 'contactNumber',
        sortable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          defaultOption: 'startsWith',
          debounceMs: 0,
        },
      },
      {
        headerName: 'ITR Type',
        field: 'itrType',
        width: 90,
        filter: 'agTextColumnFilter',
        filterParams: {
          defaultOption: 'startsWith',
          debounceMs: 0,
        },
      },

      {
        headerName: 'Filing Date',
        field: 'eFillingDate',
        sortable: true,
        width: 100,
        valueFormatter: (data) =>
          data.value ? moment(data.value).format('DD MMM YYYY') : null,
      },
      {
        headerName: 'Return Type',
        field: 'isRevised',
        sortable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          defaultOption: 'startsWith',
          debounceMs: 0,
        },
        valueGetter: function (params) {
          if (params.data.isRevised === 'Y') {
            return 'Revised';
          }
          return 'Original';
        },
      },
      {
        headerName: 'PAN Number',
        field: 'panNumber',
        sortable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          defaultOption: 'startsWith',
          debounceMs: 0,
        },
      },
      {
        headerName: 'Email Address',
        field: 'email',
        sortable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          defaultOption: 'startsWith',
          debounceMs: 0,
        },
      },
      {
        headerName: 'Owner',
        field: 'ownerName',
        sortable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          defaultOption: 'startsWith',
          debounceMs: 0,
        },
      },
      {
        headerName: 'Filer',
        field: 'filerName',
        sortable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          defaultOption: 'startsWith',
          debounceMs: 0,
        },
      },

      {
        headerName: 'ITR ID',
        field: 'itrId',
        sortable: true,
        width: 70,
      },
      {
        headerName: 'Actions',
        width: 90,
        sortable: true,
        pinned: 'right',
        cellRenderer: function (params: any) {
          if (
            params.data.eFillingCompleted &&
            params.data.ackStatus === 'SUCCESS'
          ) {
            return `<button type="button" class="action_icon add_button" title="Acknowledgement not received, Contact team lead" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;color: green">
            <i class="fa fa-check" title="ITR filed successfully / Click to start revise return"
            aria-hidden="true" data-action-type="startRevise"></i>
           </button>`;
          } else if (params.data.ackStatus === 'DELAY') {
            return `<button type="button" class="action_icon add_button" title="ITR filed successfully / Click to start revise return" style="border: none;
            background: transparent; font-size: 16px; color: red">
            <i class="fa fa-circle" title="Acknowledgement not received, Contact team lead"
            aria-hidden="true" data-action-type="ackDetails"></i>
           </button>`;
          } else {
            return `<button type="button" class="action_icon add_button" title="Start ITR Filing" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;color: orange">
            <i class="fa fa-edit" aria-hidden="true" data-action-type="startFiling"></i>
           </button>`;
          }
        },
        cellStyle: function (params: any) {
          if (params.data.eFillingCompleted) {
            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              color: 'green',
            };
          } else {
            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              color: 'orange',
            };
          }
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
            style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
              <i class="fa fa-comments-o" aria-hidden="true" data-action-type="open-chat"></i>
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
        headerName: 'Call',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Call to user"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-phone" aria-hidden="true" data-action-type="call"></i>
           </button>`;
        },
        width: 58,
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
      // {
      //   headerName: "TPA",
      //   field: "nextYearTpa",
      //   width: 50,
      //   pinned: 'right',
      //   cellRenderer: (params:any) => {
      //     return `<input type='checkbox' data-action-type="isTpa" ${params.data.nextYearTpa === 'INTERESTED' || params.data.nextYearTpa === "COMPLETED" ? 'checked' : ''} />`;
      //   },
      //   cellStyle: params => {
      //     return (params.data.nextYearTpa === 'INTERESTED' || params.data.nextYearTpa === 'COMPLETED' || !params.data.eFillingCompleted) ? { 'pointer-events': 'none', opacity: '0.4' }
      //       : '';
      //   }
      // },

      {
        headerName: 'E-Verify',
        width: 85,
        sortable: true,
        pinned: 'right',
        cellRenderer: function (params: any) {
          if (params.data.isEverified) {
            return `<button type="button" class="action_icon add_button" style="border: none;
            background: transparent; font-size: 16px; color: green">
            <i class="fa fa-circle" title="E-Verification is done"
            aria-hidden="true"  data-action-type="lifeCycle"></i>
           </button>`;
          } else {
            return `<button type="button" class="action_icon add_button" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;color: orange">
            <i class="fa fa-check-circle" title="Click to check the latest E-verification status"
            aria-hidden="true" data-action-type="ackDetails"></i>
           </button>`;
          }
        },
        cellStyle: function (params: any) {
          if (params.data.eFillingCompleted) {
            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              color: 'green',
            };
          } else {
            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              color: 'orange',
            };
          }
        },
      },
      // {
      //   headerName: 'Cloud',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params: any) {
      //     return `<button type="button" class="action_icon add_button" title="View Document cloud" style="border: none;
      //       background: transparent; font-size: 16px; cursor:pointer;">
      //       <i class="fa fa-cloud" aria-hidden="true" data-action-type="link-to-doc-cloud"></i>
      //      </button>`;
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
      // {
      //   headerName: "Review",
      //   field: "isReviewGiven",
      //   width: 50,
      //   pinned: 'right',
      //   cellRenderer: params => {
      //     return `<input type='checkbox' data-action-type="isReviewGiven" ${params.data.isReviewGiven ? 'checked' : ''} />`;
      //   },
      //   cellStyle: params => {
      //     return (params.data.isReviewGiven) ? { 'pointer-events': 'none', opacity: '0.4' }
      //       : '';
      //   }
      // },
      // {
      //   headerName: 'Update Status',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params: any) {
      //     return `<button type="button" class="action_icon add_button" title="Update Status"
      //     style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
      //       <i class="fa fa-user" aria-hidden="true" data-action-type="updateStatus"></i>
      //      </button>`;
      //   },
      //   width: 80,
      //   pinned: 'right',
      //   cellStyle: function (params: any) {
      //     return {
      //       textAlign: 'center',
      //       display: 'flex',
      //       'align-items': 'center',
      //       'justify-content': 'center',
      //     };
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
            <i class="fa fa-book" aria-hidden="true" data-action-type="addNotes"></i>
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
  public onRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'startFiling': {
          this.startFiling(params.data);
          break;
        }
        case 'open-chat': {
          this.openChat(params.data);
          break;
        }
        case 'startRevise': {
          this.openReviseReturnDialog(params.data);
          break;
        }
        case 'ackDetails': {
          this.getAcknowledgeDetail(params.data);
          break;
        }
        case 'lifeCycle': {
          this.eriITRLifeCycleStatus(params.data);
          break;
        }
        case 'isTpa': {
          this.interestedForNextYearTpa(params.data);
          break;
        }
        case 'link-to-doc-cloud': {
          this.showUserDocuments(params.data);
          break;
        }
        // case 'isReviewGiven': {
        //   this.updateReviewStatus(params.data);
        //   break;
        // }
        case 'call': {
          this.startCalling(params.data);
          break;
        }
        case 'updateStatus': {
          this.updateStatus('Update Status', params.data);
          break;
        }
        case 'addNotes': {
          this.showNotes(params.data);
          break;
        }
      }
    }
  }

  async startFiling(data) {
    var workingItr = this.itrDataList.filter(
      (item: any) => item.itrId === data.itrId
    )[0];
    Object.entries(workingItr).forEach((key, value) => {
      if (key[1] === null) {
        delete workingItr[key[0]];
      }
    });
    const fyList = await this.utilsService.getStoredFyList();
    const currentFyDetails = fyList.filter((item: any) => item.isFilingActive);
    if (!(currentFyDetails instanceof Array && currentFyDetails.length > 0)) {
      this.utilsService.showSnackBar(
        'There is no any active filing year available'
      );
      return;
    }
    let obj = this.utilsService.createEmptyJson(
      null,
      currentFyDetails[0].assessmentYear,
      currentFyDetails[0].financialYear
    );
    Object.assign(obj, workingItr);
    console.log('obj:', obj);
    workingItr = JSON.parse(JSON.stringify(obj));
    sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(workingItr));
    this.router.navigate(['/itr-filing/itr'], {
      state: {
        userId: data.userId,
        panNumber: data.panNumber,
        eriClientValidUpto: data?.eriClientValidUpto,
        name: data?.fName + ' ' + data?.lName,
      },
    });
    // if (data.statusId !== 11) {
    //   this.router.navigate(['/eri'], {
    //     state:
    //     {
    //       userId: data.userId,
    //       panNumber: data.panNumber,
    //       eriClientValidUpto: data?.eriClientValidUpto,
    //       callerAgentUserId: this.selectedFilingTeamMemberId,
    //       assessmentYear: data?.assessmentYear,
    //       name: data?.fName + ' ' + data?.lName
    //     }
    //   });
    // } else {
    //   // this._toastMessageService.alert("success", 'This user ITR is filed');
    // }
  }

  openFilingStatusDialog(data) {
    let disposable = this.dialog.open(FilingStatusDialogComponent, {
      width: '50%',
      height: 'auto',
      data: data,
    });
    disposable.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
    });
  }
  openReviseReturnDialog(data) {
    console.log('Data for revise return ', data);
    let disposable = this.dialog.open(ReviseReturnDialogComponent, {
      width: '50%',
      height: 'auto',
      data: data,
    });
    disposable.afterClosed().subscribe((result) => {
      if (result === 'reviseReturn') {
        this.router.navigate(['/itr-filing/itr'], {
          state: {
            userId: data.userId,
            panNumber: data.panNumber,
            eriClientValidUpto: data?.eriClientValidUpto,
            name: data?.fName + ' ' + data?.lName,
          },
        });
      }
      console.log('The dialog was closed', result);
    });
  }

  getAcknowledgeDetail(data) {
    console.log(data);
    let disposable = this.dialog.open(EVerificationDialogComponent, {
      data: {
        pan: data.panNumber,
        ay: data.assessmentYear.substring(0, 4),
        ackNum: data.ackNumber,
        formCode: data.itrType,
        name: data.fName + ' ' + data.lName,
        userId: data.userId,
        assessmentYear: data.assessmentYear,
      },
    });
    disposable.afterClosed().subscribe((result) => {
      console.log('New Bank Dialog', result);
      if (result?.data === 'ONLINE') {
        this.utilsService.showSnackBar(
          'E-Verification status updated successfully'
        );
        this.myItrsList(
          // this.selectedFyYear,
          this.selectedPageNo,
          this.selectedFilingTeamMemberId
        );
      } else if (result?.data === 'MANUAL') {
        this.markAsEverified(data);
      }
    });
  }
  openChat(client) {
    console.log('client:', client);
    let disposable = this.dialog.open(ChatOptionsDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.fName + ' ' + client.lName,
        serviceType: 'ITR',
      },
    });

    disposable.afterClosed().subscribe((result) => {});
  }
  markAsEverified(data) {
    this.loading = true;
    var workingItr = this.itrDataList.filter(
      (item: any) => item.itrId === data.itrId
    )[0];
    workingItr['everifiedStatus'] = 'Successfully e-Verified';
    workingItr['isEverified'] = true;
    const param =
      '/itr/' +
      workingItr.userId +
      '/' +
      workingItr.itrId +
      '/' +
      workingItr.assessmentYear;
    this.itrMsService.putMethod(param, workingItr).subscribe(
      (result: any) => {
        this.loading = false;
        this.utilsService.showSnackBar(
          'E-Verification status updated successfully'
        );
        this.myItrsList(
          // this.selectedFyYear,
          this.selectedPageNo,
          this.selectedFilingTeamMemberId
        );
      },
      (error) => {
        this.loading = false;
        this.utilsService.showSnackBar(
          'Failed to update E-Verification status'
        );
      }
    );
  }

  interestedForNextYearTpa(data) {
    this.loading = true;
    var workingItr = this.itrDataList.filter(
      (item: any) => item.itrId === data.itrId
    )[0];
    workingItr['nextYearTpa'] = 'INTERESTED';
    console.log(workingItr);

    const param =
      '/itr/' +
      workingItr['userId'] +
      '/' +
      workingItr['itrId'] +
      '/' +
      workingItr['assessmentYear'];
    this.itrMsService.putMethod(param, workingItr).subscribe(
      (result: ITR_JSON) => {
        this.myItrsList(
          // this.selectedFyYear,
          this.selectedPageNo,
          this.selectedFilingTeamMemberId
        );
      },
      (error) => {
        this.myItrsList(
          // this.selectedFyYear,
          this.selectedPageNo,
          this.selectedFilingTeamMemberId
        );
      }
    );
  }

  showUserDocuments(data) {
    console.log(data);
    this.router.navigate(['/pages/itr-filing/user-docs/' + data.userId]);
  }

  // updateReviewStatus(data) {
  //   const param = `/update-itr-userProfile?itrId=${data.itrId}&userId=${data.userId}&isReviewGiven=true`;
  //   this.itrMsService.putMethod(param, {}).subscribe(result => {
  //     console.log(result);
  //     this.utilsService.showSnackBar('Marked as review given');
  //     this.myItrsList(this.selectedFyYear, this.selectedPageNo, this.selectedFilingTeamMemberId);
  //   }, error => {
  //     this.utilsService.showSnackBar('Please try again, failed to mark as review given');
  //     this.myItrsList(this.selectedFyYear, this.selectedPageNo, this.selectedFilingTeamMemberId);
  //   })
  // }

  async startCalling(user) {
    const agentNumber = await this.utilsService.getMyCallingNumber();
    if (!agentNumber) {
      this.toastMsgService.alert('error', "You don't have calling role.");
      return;
    }
    console.log('user: ', user);
    this.loading = true;
    let customerNumber = user.contactNumber;
    const param = `/prod/call-support/call`;
    const reqBody = {
      agent_number: agentNumber,
      customer_number: customerNumber,
    };
    console.log('reqBody:', reqBody);
    this.userMsService.postMethodAWSURL(param, reqBody).subscribe(
      (result: any) => {
        console.log('Call Result: ', result);
        this.loading = false;
        if (result.success.status) {
          this.toastMsgService.alert('success', result.success.message);
        }
      },
      (error) => {
        this.utilsService.showSnackBar(
          'Error while making call, Please try again.'
        );
        this.loading = false;
      }
    );
  }

  updateStatus(mode, client) {
    console.log('Client', client);
    let disposable = this.dialog.open(ChangeStatusComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.fName + ' ' + client.lName,
        serviceType: 'ITR',
        mode: mode,
        userInfo: client,
      },
    });

    disposable.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
      console.log('result: ', result);
      if (result) {
      }
    });
  }

  showNotes(client) {
    let disposable = this.dialog.open(UserNotesComponent, {
      width: '75vw',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.fName + ' ' + client.lName,
      },
    });
    disposable.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
    });
  }
  pageChanged(event) {
    this.config.currentPage = event;
    this.selectedPageNo = event - 1;
    if (this.coOwnerToggle.value == true) {
      this.myItrsList(event - 1,true);
    }else{
      this.myItrsList(event - 1,'');
    }
    // this.myItrsList(
    //   // this.selectedFyYear,
    //   this.selectedPageNo,
    //   this.selectedFilingTeamMemberId
    // );
  }

  @ViewChild('serviceDropDown') serviceDropDown: ServiceDropDownComponent;
  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  @ViewChild('coOwnerDropDown') coOwnerDropDown: CoOwnerListDropDownComponent;
  resetFilters() {
    this.searchParams.selectedStatusId = null;
    this.config.page = 0;
    this.config.itemsPerPage = 10;
    this.searchParams.mobileNumber = null;
    this.searchParams.email = null;

    this?.smeDropDown?.resetDropdown();
    this?.serviceDropDown?.resetService();
    if(this.coOwnerDropDown){
      this.coOwnerDropDown.resetDropdown();
      this.myItrsList(0, true)
    }else{
      this.search();
    }
  }

  eriITRLifeCycleStatus(data) {
    console.log(data);
    const param = `/eri/v1/api`;
    let headerObj = {
      panNumber: data.panNumber,
      assessmentYear: data.assessmentYear,
      userId: data.userId.toString(),
    };
    sessionStorage.setItem('ERI-Request-Header', JSON.stringify(headerObj));
    let req = {
      serviceName: 'EriITRLifeCycleStatus',
      pan: data.panNumber,
      ay: '2022',
    };

    this.itrMsService.postMethodForEri(param, req).subscribe((res: any) => {
      console.log(res);
      if (res && res.successFlag) {
        if (res.hasOwnProperty('itrsFiled') && res.itrsFiled instanceof Array) {
          let input = {
            name: data.fName + ' ' + data.lName,
            pan: data.panNumber,
            itrsFiled: res.itrsFiled[0],
          };
          this.openLifeCycleDialog(input);
        } else if (res.hasOwnProperty('messages')) {
          if (res.messages instanceof Array && res.messages.length > 0)
            this.utilsService.showSnackBar(res.messages[0].desc);
        }
      } else {
        if (res.hasOwnProperty('errors')) {
          if (res.errors instanceof Array && res.errors.length > 0)
            this.utilsService.showSnackBar(res.errors[0].desc);
        }
      }
    });
  }

  openLifeCycleDialog(data) {
    let disposable = this.dialog.open(ItrLifecycleDialogComponent, {
      width: '50%',
      height: 'auto',
      data: data,
    });
    disposable.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
    });
  }

  getToggleValue(){
    console.log('co-owner toggle',this.coOwnerToggle.value)
    if (this.coOwnerToggle.value == true) {
    this.coOwnerCheck = true;}
    else {
      this.coOwnerCheck = false;
    }
    this.myItrsList(0, true)
  }
}
