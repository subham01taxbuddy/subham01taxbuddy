import {Component, Inject, LOCALE_ID, OnInit, ViewChild} from '@angular/core';
import {GridOptions} from "ag-grid-community";
import {UserMsService} from "../../services/user-ms.service";
import {ToastMessageService} from "../../services/toast-message.service";
import {UtilsService} from "../../services/utils.service";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {MatDialog} from "@angular/material/dialog";
import {ItrMsService} from "../../services/itr-ms.service";
import {NavbarService} from "../../services/navbar.service";
import {formatDate} from "@angular/common";
import {UserNotesComponent} from "../shared/components/user-notes/user-notes.component";
import {ChatOptionsDialogComponent} from "../tasks/components/chat-options/chat-options-dialog.component";
import {SmeListDropDownComponent} from "../shared/components/sme-list-drop-down/sme-list-drop-down.component";

@Component({
  selector: 'app-payouts',
  templateUrl: './payouts.component.html',
  styleUrls: ['./payouts.component.scss']
})
export class PayoutsComponent implements OnInit {

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;

  loading!: boolean;
  usersGridOptions: GridOptions;
  config: any;
  userInfo: any = [];
  searchMenus = [{
    value: 'emailAddress', name: 'Email Id'
  }, {
    value: 'mobileNumber', name: 'Mobile Number'
  }, {
    value: 'invoiceNo', name: 'Invoice No'
  }, ];
  statusList = [
    {value: '', name: 'All'},
    {value: 'APPROVED', name: 'Approved'},
    {value: 'NOT_APPROVED', name: 'Yet To Approve'}
  ];
  selectedStatus: any;
  searchVal: string = "";
  currentUserId: number = 0;
  user_data: any = [];
  key: any;
  allFilerList: any;
  selectedEntries: any;

  constructor(private userService: UserMsService,
              private _toastMessageService: ToastMessageService,
              private utilsService: UtilsService,
              private router: Router,
              private http: HttpClient,
              private dialog: MatDialog,
              private itrMsService: ItrMsService,
              @Inject(LOCALE_ID) private locale: string) {
    this.allFilerList = JSON.parse(sessionStorage.getItem('ALL_FILERS_LIST'));

    this.usersGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.usersCreateColumnDef(this.allFilerList),
      headerHeight: 60,
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      paginateChildRows:true,
      paginationPageSize: 15,
      rowSelection:'multiple',
      onGridReady: params => {
      },

      sortable: true,
    };

    this.config = {
      itemsPerPage: 15,
      currentPage: 1,
      totalItems: 80
    };

  }

  loggedInUserId: number;
  ngOnInit() {
    this.loggedInUserId = this.utilsService.getLoggedInUserID();
    this.selectedStatus = this.statusList[2].value;
    this.getSearchList('status', this.selectedStatus);
  }

  clearValue() {
    this.searchVal = "";
    this.currentUserId = 0;
  }

  ownerId: number;
  filerId: number;
  fromOwner(event) {
    if(event) {
      this.ownerId = event ? event.userId : null;
      console.log('fromowner:', event);
      let queryString = this.ownerId ? `&ownerUserId=${this.ownerId}` : '';
      this.serviceCall(queryString);
    }
  }
  fromFiler(event) {
    if(event) {
      this.filerId = event ? event.userId : null;
      let queryString = this.filerId ? `&filerUserId=${this.filerId}` : '';
      this.serviceCall(queryString);
    }
  }

  advanceSearch(key: any) {
    this.user_data = [];
    if (this.searchVal !== "") {
      this.getSearchList(key, this.searchVal);
    }
  }

  getSearchList(key: any, searchValue: any) {

    let queryString = '';
    if(this.utilsService.isNonEmpty(searchValue)) {
      queryString = `&${key}=${searchValue}`;
    }
    this.serviceCall(queryString);
  }

  serviceCall(queryString){
    this.loading = true;
    const param = `/dashboard/itr-filing-credit/${this.loggedInUserId}?fromDate=2023-01-01&toDate=2023-05-11&page=0&size=20${queryString}`;
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      this.loading = false;
      console.log(result);
      if(result.success) {
        this.usersGridOptions.api?.setRowData(this.createRowData(result['data']));
        this.userInfo = result['data'];
        this.config.totalItems = result.totalElements;
      } else {
        this.usersGridOptions.api?.setRowData([]);
        this.userInfo = [];
        this.config.totalItems = 0;
      }
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar('Please try again, failed to get data');
    });
  }

  pageChanged(event: any) {
    this.config.currentPage = event;
    // this.getUserData(event - 1);
  }

  getUserData(pageNo: any) {
    this.loading = true;
    let param = '/profile?page=' + pageNo + '&pageSize=15'
    this.userService.getMethod(param).subscribe((result: any) => {
        console.log('result -> ', result);
        this.loading = false;
        this.usersGridOptions.api?.setRowData(this.createRowData(result['content']));
        this.userInfo = result['content'];
        this.config.totalItems = result.totalElements;
      },
      error => {
        this.loading = false;
        this._toastMessageService.alert("error", "Fail to getting leads data, try after some time.");
        console.log('Error during getting Leads data. -> ', error)
      })
  }

  usersCreateColumnDef(list: any) {
    return [
      {
        headerName: 'Sr. No.',
        width: 50,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        valueGetter: function(params) {
          return params.node.rowIndex + 1;
        }
      },
      {
        headerName: 'Filer Name',
        field: 'filerUserId',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        valueGetter: function(params) {
          let createdUserId= parseInt(params?.data?.filerUserId)
          let filer1 = list;
          let filer = filer1?.filter((item) => {
            return item.userId === createdUserId;
          }).map((item) => {
            return item.name;
          });
          console.log('filer', filer);
          return filer
        }
      },
      {
        headerName: 'Owner Name',
        field: 'ownerUserId',
        width: 110,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        valueGetter: function(params) {
          let createdUserId= parseInt(params?.data?.ownerUserId)
          let filer1 = list;
          let filer = filer1?.filter((item) => {
            return item.userId === createdUserId;
          }).map((item) => {
            return item.name;
          });
          console.log('filer', filer);
          return filer
        }
      },
      {
        headerName: 'User Name',
        field: 'userName',
        width: 160,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'User Phone Number',
        field: 'userMobileNumber',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Ack No',
        field: 'ackNumber',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Date of Filing',
        field: 'ackNumber',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        valueGetter:function(params:any) {
          var id = params.data.ackNumber;
          if(id) {
            var lastSix = id.substr(id.length - 6);
            var day = lastSix.slice(0, 2);
            var month = lastSix.slice(2, 4);
            var year = lastSix.slice(4, 6);
            let dateString = `20${year}-${month}-${day}`;
            console.log(dateString, year, month, day)
            return dateString;
          }
          return '';
        }
      },
      {
        headerName: 'Invoice List',
        field: 'invoiceNo',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Tax Invoice Date',
        field: 'invoiceDate',
        width: 100,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        cellRenderer: (data: any) => {
          return formatDate(data.value, 'dd/MM/yyyy', this.locale)
        }
      },
      {
        headerName: 'Invoice Amount',
        field: 'invoiceAmount',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'GST Amount',
        field: 'gstAmount',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Without GST Amount',
        field: 'amountwithoutGST',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Commission %',
        field: 'commissionPercentage',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Commission Earned',
        field: 'commissionEarned',
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
        headerName: 'TDS Amount',
        field: 'tdsOnCommissionEarned',
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
        headerName: 'Final Amount To Pay',
        field: 'commissionPayable',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Payout Status',
        field: 'commissionPaymentStatus',
        width: 120,
        suppressMovable: true,
        pinned: 'right',
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Approved By',
        field: 'commissionPaymentApprovedBy',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        valueGetter: function(params) {
          let createdUserId= parseInt(params?.data?.commissionPaymentApprovedBy)
          let filer1 = list;
          let filer = filer1?.filter((item) => {
            return item.userId === createdUserId;
          }).map((item) => {
            return item.name;
          });
          console.log('filer', filer);
          return filer
        }
      },{
        headerName: 'Approved Date',
        field: 'commissionPaymentApprovalDate',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        cellRenderer: (data: any) => {
          return formatDate(data.value, 'dd/MM/yyyy', this.locale)
        }
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
        headerName: 'Invoice',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Invoice" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-files-o" aria-hidden="true" data-action-type="invoice"></i>
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
      {
        // headerName: "Approve",
        // field: "commissionPaymentApprovalStatus",
        headerCheckboxSelection: true,
        width: 50,
        pinned: 'right',
        checkboxSelection: true,
        // valueGetter: function (params:any){
        //   return params.data.commissionPaymentApprovalStatus === 'APPROVED';
        // }
      },
    ]
  }

  createRowData(userData: any) {
    return userData;
  }

  onUsersRowClicked(params: any) {
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'invoice': {
          this.redirectTowardInvoice(params.data);
          break;
        }
        case 'addNotes': {
          this.showNotes(params.data)
          break;
        }
        case 'open-chat': {
          this.openChat(params.data);
          break;
        }
      }
    }
  }

  approveSelected(){
    let selectedRows = this.usersGridOptions.api.getSelectedRows();
    console.log(selectedRows);
    if(selectedRows.length === 0){
      this.utilsService.showSnackBar('Please select entries to approve');
      return;
    }
    let invoices = selectedRows.flatMap(item=> item.invoiceNo);
    let param = '/dashboard/partner-commission';
    let request = {
      invoiceNoList: invoices,
      commissionPaymentApprovalStatus: 'APPROVED'
    };
    this.loading = true;
    this.itrMsService.putMethod(param, request).subscribe((result: any)=> {
      this.loading = false;
      if(result.success){
        this.utilsService.showSnackBar('Payouts approved successfully');
        this.serviceCall('');
      }
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar('Error in processing payouts. Please try after some time.');
    });
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

  redirectTowardInvoice(userInfo: any) {
    this.router.navigate(['/subscription/tax-invoice'], { queryParams: { invoiceNo: userInfo.invoiceNo } });
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
      console.log('The dialog was closed');
    });
  }

  resetFilters(){
    this.filerId = null;
    this.ownerId = null;
    this.selectedStatus = null;
    this.key = null;
    this?.smeDropDown?.resetDropdown();
    this.clearValue();
  }
}
