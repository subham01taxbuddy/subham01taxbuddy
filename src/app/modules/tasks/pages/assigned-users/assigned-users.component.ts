import { ReAssignDialogComponent } from './../../components/re-assign-dialog/re-assign-dialog.component';
import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { ChangeStatusComponent } from 'src/app/modules/shared/components/change-status/change-status.component';
import { UserNotesComponent } from 'src/app/modules/shared/components/user-notes/user-notes.component';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { NavbarService } from 'src/app/services/navbar.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment';
import { MoreOptionsDialogComponent } from '../../components/more-options-dialog/more-options-dialog.component';

@Component({
  selector: 'app-assigned-users',
  templateUrl: './assigned-users.component.html',
  styleUrls: ['./assigned-users.component.scss']
})
export class AssignedUsersComponent implements OnInit {

  loading!: boolean;
  usersGridOptions: GridOptions;
  config: any;
  userInfo: any = [];
  itrStatus: any = [];
  searchParam: any = {
    // serviceType: 'ITR',
    statusId: null,
    page: 0,
    pageSize: 20,
    mobileNumber: null,
    emailId: null
  }
  agents = [];
  agentId = null;
  constructor(private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private router: Router,
    private http: HttpClient,
    private dialog: MatDialog,
    private itrMsService: ItrMsService,
    private roleBaseAuthGuardService: RoleBaseAuthGuardService,
    @Inject(LOCALE_ID) private locale: string) {
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
      totalItems: null
    };
  }

  ngOnInit() {
    const UMD = JSON.parse(localStorage.getItem('UMD'))
    this.agentId = UMD.USER_UNIQUE_ID;
    this.getMasterStatusList();
    this.search();
    this.getAgentList();
  }

  async getMasterStatusList() {
    this.itrStatus = await this.utilsService.getStoredMasterStatusList();
  }

  pageChanged(event: any) {
    this.config.currentPage = event;
    this.searchParam.page = event - 1
    this.search();
  }
  fromSme(event) {
    if (event === '' || event === 'ALL') {
      let loggedInId = JSON.parse(localStorage.getItem('UMD'))?.USER_UNIQUE_ID
      if (this.agentId !== loggedInId) {
        this.agentId = loggedInId;
        this.search('agent');
      }
    } else if (event === 'SELF') {
      let loggedInId = JSON.parse(localStorage.getItem('UMD'))?.USER_UNIQUE_ID;
      this.agentId = loggedInId;
      this.search('agent', true);
    } else {
      this.agentId = event;
      this.search('agent');
    }
  }

  getAgentList() {
    const loggedInUserDetails = JSON.parse(localStorage.getItem('UMD'));
    const isAgentListAvailable = this.roleBaseAuthGuardService.checkHasPermission(loggedInUserDetails.USER_ROLE, ['ROLE_ADMIN', 'ROLE_ITR_SL', 'ROLE_GST_SL', 'ROLE_NOTICE_SL']);
    if (isAgentListAvailable) {
      const param = `/sme/${loggedInUserDetails.USER_UNIQUE_ID}/child-details`;
      this.userMsService.getMethod(param).subscribe((result: any) => {
        if (result.success) {
          this.agents = result.data;
        }
      })
    }
  }
  // getUserData(pageNo: any) {
  //   this.loading = true;
  //   const UMD = JSON.parse(localStorage.getItem('UMD'))
  //   let param = `/sme/${UMD.USER_UNIQUE_ID}/user-list?page=${pageNo}&pageSize=20`;
  //   this.userMsService.getMethod(param).subscribe((result: any) => {
  //     console.log('result -> ', result);
  //     this.loading = false;
  //     if (result.success) {
  //       this.usersGridOptions.api?.setRowData(this.createRowData(result.data['content']));
  //       this.usersGridOptions.api.setColumnDefs(this.usersCreateColumnDef(this.itrStatus));
  //       this.userInfo = result.data['content'];
  //       this.config.totalItems = result.totalElements;
  //     }
  //   }, error => {
  //     this.loading = false;
  //     this._toastMessageService.alert("error", "Fail to getting leads data, try after some time.");
  //     console.log('Error during getting Leads data. -> ', error)
  //   })
  // }

  usersCreateColumnDef(itrStatus) {
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
        }
      },
      {
        headerName: 'Status',
        field: 'statusId',
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
          // console.log('params === ', params, params.data.statusId);
          // console.log('itrStatus array === ', itrStatus);
          if (itrStatus.length !== 0) {
            const nameArray = itrStatus.filter((item: any) => (item.statusId === params.data.statusId));
            if (nameArray.length !== 0) {
              return nameArray[0].statusName;
            }
            else {
              return '-';
            }
          } else {
            return params.data.statusId;
          }
        }
      },
      {
        headerName: 'Language',
        field: 'laguage',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
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
      {
        headerName: 'Created Date',
        field: 'createdDate',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data: any) => {
          return formatDate(data.value, 'dd/MM/yyyy', this.locale)
        },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Status Updated On',
        field: 'statusUpdatedDate',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data: any) => {
          if (data !== null)
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
        headerName: 'Service Type',
        field: 'serviceType',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
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
        headerName: 'Agent Name',
        field: 'callerAgentName',
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
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Call to user"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-phone" aria-hidden="true" data-action-type="call"></i>
           </button>`;
        },
        width: 50,
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
        headerName: 'Update Status',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Update Status"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-user" aria-hidden="true" data-action-type="updateStatus"></i>
           </button>`;
        },
        width: 60,
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
        headerName: 'See/Add Notes',
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
        width: 60,
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
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      {
        headerName: 'Add Client',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          if (params.data.serviceType === 'ITR') {
            return `<button type="button" class="action_icon add_button" title="Add Client" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-plus" aria-hidden="true" data-action-type="add-client"></i>
           </button>`;
          }
          return 'NA'
        },
        width: 50,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      /* {
        headerName: 'Inv',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Redirect toward Invoice"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-files-o" aria-hidden="true" data-action-type="invoice"></i>
           </button>`;
        },
        width: 50,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      }, */
      /* {
        headerName: 'Sub',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Redirect toward Subscription"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-list-alt" aria-hidden="true" data-action-type="subscription"></i>
           </button>`;
        },
        width: 50,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      }, */
      {
        headerName: 'Re Assign',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          // if (params.data.serviceType === 'ITR' || params.data.serviceType === 'TPA') {
            return `<button type="button" class="action_icon add_button" title="Re Assignment"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-refresh" aria-hidden="true" data-action-type="re-assign"></i>
           </button>`;
          // }
          // return 'NA'
        },
        width: 50,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      /* {
        headerName: 'Cloud',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="View Document cloud" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-cloud" aria-hidden="true" data-action-type="link-to-doc-cloud"></i>
           </button>`;
        },
        width: 50,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      }, */
      /* {
        headerName: 'User Profile',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return ` 
           <button type="button" class="action_icon add_button" title="User Profile" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-user" aria-hidden="true" data-action-type="profile"></i>
           </button>`;
        },
        width: 60,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      }, */
      // {
      //   headerName: 'FNB',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params: any) {
      //     return `<button type="button" class="action_icon add_button" title="Link To Finbingo" style="border: none;
      //       background: transparent; font-size: 16px; cursor:pointer;">
      //       <i class="fa fa-link" aria-hidden="true" data-action-type="link-to-finbingo"></i>
      //      </button>`;
      //   },
      //   width: 50,
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
        headerName: 'More',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="More Options" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-info-circle" aria-hidden="true" data-action-type="more-options"></i>
           </button>`;
        },
        width: 50,
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
      //   headerName: "Review",
      //   field: "isReviewGiven",
      //   width: 50,
      //   pinned: 'right',
      //   cellRenderer: (params: any) => {
      //     return `<input type='checkbox' data-action-type="isReviewGiven" ${params.data.isReviewGiven ? 'checked' : ''} />`;
      //   },
      //   cellStyle: (params: any) => {
      //     return (params.data.isReviewGiven) ? { 'pointer-events': 'none', opacity: '0.4' }
      //       : '';
      //   }
      // },





      // {
      //   headerName: 'More',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params: any) {
      //     //     var a = document.createElement('div');
      //     //     a.innerHTML = ` <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Example icon-button with a menu">
      //     //   <mat-icon>more_vert</mat-icon>

      //     // </button>
      //     // <mat-menu #menu="matMenu">
      //     //   <button mat-menu-item>
      //     //     <mat-icon>dialpad</mat-icon>
      //     //     <span>Redial</span>
      //     //   </button>
      //     //   <button mat-menu-item disabled>
      //     //     <mat-icon>voicemail</mat-icon>
      //     //     <span>Check voice mail</span>
      //     //   </button>
      //     //   <button mat-menu-item>
      //     //     <mat-icon>notifications_off</mat-icon>
      //     //     <span>Disable alerts</span>
      //     //   </button>
      //     // </mat-menu>`;
      //     //     return a;

      //     return (
      //       "<div class='buttons'>" +

      //       "<div class='front'><button>Option A1</button><br><button>Option A</button><br><button>Option B</button><br><button>Option c</button> </div>" +
      //       "</div>"
      //     );;
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
    ]
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
        callerAgentName: userData[i].callerAgentName,
        callerAgentNumber: userData[i].callerAgentNumber,
        callerAgentUserId: userData[i].callerAgentUserId,
        statusId: userData[i].statusId,
        statusUpdatedDate: userData[i].statusUpdatedDate,
        panNumber: this.utilsService.isNonEmpty(userData[i].panNumber) ? userData[i].panNumber : null,
        eriClientValidUpto: userData[i].eriClientValidUpto,
        laguage: userData[i].laguage
      })
      userArray.push(userInfo);
    }
    return userArray;
  }

  onUsersRowClicked(params: any) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'invoice': {
          this.redirectTowardInvoice(params.data);
          break;
        }
        case 'subscription': {
          this.redirectTowardSubscription(params.data)
          break;
        }
        case 'profile': {
          this.router.navigate(['pages/user-management/profile/' + params.data.userId])
          break;
        }
        case 'link-to-finbingo': {
          this.linkToFinbingo(params.data.userId);
          break;
        }
        case 'link-to-doc-cloud': {
          this.linkToDocumentCloud(params.data.userId);
          break;
        }
        case 'updateStatus': {
          this.updateStatus('Update Status', params.data)
          break;
        }
        case 'add-client': {
          if (params.data.statusId !== 11) {
            const reqParam = `/profile-data?filedNames=panNumber,dateOfBirth&userId=${params.data.userId}`;
            this.userMsService.getMethod(reqParam).subscribe((res: any) => {
              console.log('Result DOB:', res);
              this.router.navigate(['/eri'], {
                state:
                {
                  userId: params.data.userId,
                  panNumber: params.data.panNumber ? params.data.panNumber : res.data.panNumber,
                  eriClientValidUpto: params.data.eriClientValidUpto,
                  callerAgentUserId: params.data.callerAgentUserId,
                  assessmentYear: params.data.assessmentYear,
                  name: params.data.name,
                  dateOfBirth: res.data.dateOfBirth,
                  mobileNumber: params.data.mobileNumber
                }
              });
            })

          } else {
            this._toastMessageService.alert("success", 'This user ITR is filed');
          }
          break;
        }
        case 'call': {
          this.call(params.data);
          break;
        }
        case 'addNotes': {
          this.showNotes(params.data)
          break;
        }
        case 'open-chat': {
          this.openChat(params.data)
          break;
        }
        case 're-assign': {
          this.reAssignUser(params.data)
          break;
        }
        case 'more-options': {
          this.moreOptions(params.data)
          break;
        }
      }
    }
  }

  redirectTowardInvoice(userInfo: any) {
    this.router.navigate(['/pages/subscription/invoices'], { queryParams: { userId: userInfo.userId } });
  }

  redirectTowardSubscription(userInfo: any) {
    this.router.navigate(['/pages/subscription/sub'], { queryParams: { userMobNo: userInfo.mobileNumber } });
  }

  linkToFinbingo(userId: any) {
    const param = `/partner/create-user`;
    const request = {
      userId: userId
    }
    this.loading = true;
    this.userMsService.postMethod(param, request).subscribe((res: any) => {
      this.loading = false;
      if (res.success) {
        if (res.data.isFnbVirtualUser) {
          this.utilsService.showSnackBar('User is already linked with FinBingo partner, please check under virtual users.');
        } else if (res.data.isFnbUser) {
          this.utilsService.showSnackBar('This user is already FinBingo user, please check under FinBingo users.');
        } else {
          this.utilsService.showSnackBar('User successfully linked with FinBingo partner, please check under virtual users.');
        }
      } else {
        this.utilsService.showSnackBar(res.message)
      }
    }, error => {
      this.loading = false;
    })
  }

  linkToDocumentCloud(userId: any) {
    this.router.navigate(['/pages/itr-filing/user-docs/' + userId]);
  }

  updateReviewStatus(data: any) {
    const param = `/update-itr-userProfile?userId=${data.userId}&isReviewGiven=true`;
    this.itrMsService.putMethod(param, {}).subscribe(result => {
      this.utilsService.showSnackBar('Marked as review given');
    }, error => {
      this.utilsService.showSnackBar('Please try again, failed to mark as review given');
    })
  }

  call(data) {
    // let callInfo = data.customerNumber;
    this.loading = true;
    const param = `/prod/call-support/call`;
    // TODO check the caller agent number;
    const reqBody = {
      "agent_number": data.callerAgentNumber,
      "customer_number": data.mobileNumber
    }
    this.userMsService.postMethodAWSURL(param, reqBody).subscribe((result: any) => {
      this.loading = false;
      if (result.success.status) {
        this._toastMessageService.alert("success", result.success.message)
      }
    }, error => {
      this.utilsService.showSnackBar('Error while making call, Please try again.');
      this.loading = false;
    })
  }

  updateStatus(mode, client) {
    let disposable = this.dialog.open(ChangeStatusComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.name,
        serviceType: client.serviceType,
        mode: mode,
        userInfo: client
      }
    })

    disposable.afterClosed().subscribe(result => {
      if (result) {
        if (result.data === "statusChanged") {
          this.searchParam.page = 0;
          this.search();
        }
      }
    });
  }
  showNotes(client) {
    let disposable = this.dialog.open(UserNotesComponent, {
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
  openChat(client) {
    this.loading = true;
    let param = `/kommunicate/chat-link?userId=${client.userId}&serviceType=${client.serviceType}`;
    this.userMsService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
        window.open(response.data.chatLink)
      } else {
        this._toastMessageService.alert('error', 'User has not initiated chat on kommunicate')
      }
    }, error => {
      this._toastMessageService.alert('error', 'Error during fetching chat, try after some time.')
      this.loading = false;
    })
  }

  reAssignUser(client) {
    let disposable = this.dialog.open(ReAssignDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.name,
        serviceType: client.serviceType
      }
    })

    disposable.afterClosed().subscribe(result => {
      if (result.data === 'success') {
        this.search();
      }
    });
  }

  moreOptions(client) {
    let disposable = this.dialog.open(MoreOptionsDialogComponent, {
      width: '50%',
      height: 'auto',
      data: client
    })

    // disposable.afterClosed().subscribe(result => {
    //   if (result.data === 'success') {
    //     this.search();
    //   }
    // });
  }
  isNumeric(value) {
    return /^\d+$/.test(value);
  }
  search(form?, isAgent?) {
    if (form == 'mobile') {
      this.searchParam.page = 0;
      if (this.searchParam.mobileNumber == null || this.searchParam.mobileNumber == '') {
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
      this.searchParam.mobileNumber = null
      this.searchParam.emailId = null
    } else if (form == 'agent') {
      this.searchParam.page = 0;
    }
    this.loading = true;
    let data = this.utilsService.createUrlParams(this.searchParam);
    let param = `/sme/${this.agentId}/user-list?${data}`;
    if (isAgent) {
      param = param + '&isAgent=true';
    }

    this.userMsService.getMethod(param).subscribe(
      /* {
        next: (v) => console.log(v),
        error: (e) => console.error(e),
        complete: () => {
          console.info('complete');
          this.loading = false;
        }
      } */
      (result: any) => {
        if (result.success) {
          if (result.data && result.data['content'] instanceof Array) {
            this.usersGridOptions.api?.setRowData(this.createRowData(result.data['content']));
            this.usersGridOptions.api.setColumnDefs(this.usersCreateColumnDef(this.itrStatus));
            this.userInfo = result.data['content'];
            this.config.totalItems = result.data.totalElements;
          } else {
            this.usersGridOptions.api?.setRowData(this.createRowData([]));
            this.config.totalItems = 0;
            this._toastMessageService.alert('error', result.message)
          }
        }
        this.loading = false;

      }, error => {
        this.loading = false;
        this.config.totalItems = 0;
        this._toastMessageService.alert("error", "Fail to getting leads data, try after some time.");
      })
  }
}
