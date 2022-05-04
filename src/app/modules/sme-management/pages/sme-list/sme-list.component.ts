import { UserMsService } from 'src/app/services/user-ms.service';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { formatDate } from '@angular/common';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-sme-list',
  templateUrl: './sme-list.component.html',
  styleUrls: ['./sme-list.component.scss']
})
export class SmeListComponent implements OnInit {
  smeListGridOptions: GridOptions;
  config: any;
  loading = false;
  smeList: any = [];

  constructor(private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    @Inject(LOCALE_ID) private locale: string) {
    this.smeListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.smeCreateColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: params => {
      },

      sortable: true,
    };

    this.config = {
      itemsPerPage: 15,
      currentPage: 1,
      totalItems: null
    };
  }

  ngOnInit() {
    this.getSmeList(0);
  }

  pageChanged(event: any) {
    this.config.currentPage = event;
    this.getSmeList(event - 1);
  }

  getSmeList(pageNo: any) {
    this.loading = true;
    let param = '/sme/all-list?page=' + pageNo + '&pageSize=15'
    this.userMsService.getMethod(param).subscribe((result: any) => {
      console.log('result -> ', result);
      this.loading = false;
      this.smeListGridOptions.api?.setRowData(this.createRowData(result.data['content']));
      this.smeList = result.data['content'];
      this.config.totalItems = result.data.totalElements;
    },
      error => {
        this.loading = false;
        this._toastMessageService.alert("error", "Fail to getting leads data, try after some time.");
        console.log('Error during getting Leads data. -> ', error)
      })
  }

  smeCreateColumnDef() {
    return [
      {
        headerName: 'User Id',
        field: 'userId',
        width: 80,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Joining Date',
        field: 'joiningDate',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        // cellRenderer: (data: any) => {
        //   return formatDate(data.value, 'dd/MM/yyyy', this.locale)
        // },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Name',
        field: 'name',
        width: 180,
        suppressMovable: true,
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
        headerName: 'Assignment',
        field: 'assignmentStart',
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
        headerName: 'ITR Types',
        field: 'itrTypes',
        width: 180,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
      },
      {
        headerName: 'Service Type',
        field: 'serviceType',
        width: 180,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
      },
      {
        headerName: 'Active',
        field: 'active',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
    ]
  }

  createRowData(userData: any) {
    console.log('userData -> ', userData);
    var userArray = [];
    for (let i = 0; i < userData.length; i++) {
      let smeList: any = Object.assign({}, userArray[i], {
        userId: userData[i].userId,
        joiningDate: this.utilsService.isNonEmpty(userData[i].joiningDate) ? userData[i].joiningDate : '-',
        name: userData[i].name,
        mobileNumber: this.utilsService.isNonEmpty(userData[i].mobileNumber) ? userData[i].mobileNumber : '-',
        email: this.utilsService.isNonEmpty(userData[i].email) ? userData[i].email : '-',
        assignmentStart: userData[i].assignmentStart ? 'Yes' : 'No',
        active: userData[i].active ? 'Yes' : 'No',
        itrTypes: userData[i].itrTypes,
        serviceType: userData[i].serviceType,
      })
      userArray.push(smeList);
    }
    console.log('userArray-> ', userArray)
    return userArray;
  }

  onUsersRowClicked(params: any) {
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'invoice': {
          // this.redirectTowardInvoice(params.data);
          break;
        }
        case 'subscription': {
          // this.redirectTowardSubscription(params.data)
          break;
        }
        case 'profile': {
          //matomo('All Users Tab', '/pages/user-management/users', ['trackEvent', 'All Users', 'User Profile'], environment.matomoScriptId);
          // this.utilsService.matomoCall('All Users Tab', '/pages/user-management/users', ['trackEvent', 'All Users', 'User Profile'], environment.matomoScriptId)
          // this.router.navigate(['pages/user-management/profile/' + params.data.userId])
          break;
        }
        case 'link-to-finbingo': {
          // this.linkToFinbingo(params.data.userId);
          break;
        }
        case 'link-to-doc-cloud': {
          // this.linkToDocumentCloud(params.data.userId);
          break;
        }
        case 'isReviewGiven': {
          // this.updateReviewStatus(params.data);
          break;
        }
        case 'add-client': {
          // if (environment.production) {
          //   this.router.navigate(['/eri'], { state: { userId: params.data.userId, panNumber: params.data.pan, eriClientValidUpto: params.data.eriClientValidUpto } });
          // } else {
          //   this._toastMessageService.alert("error", 'You can not access add client on testing environment');
          // }
          break;
        }
      }
    }
  }

}
