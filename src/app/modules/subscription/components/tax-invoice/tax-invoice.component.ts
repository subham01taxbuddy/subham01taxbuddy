import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DatePipe,formatDate } from '@angular/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { UtilsService } from 'src/app/services/utils.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import {GridApi, GridOptions} from 'ag-grid-community';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { UserNotesComponent } from 'src/app/modules/shared/components/user-notes/user-notes.component';
import { Observable, map, startWith } from 'rxjs';
import {AppConstants} from "../../../shared/constants";

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

export interface User {
  name: string;
  userId:Number;
}

@Component({
  selector: 'app-tax-invoice',
  templateUrl: './tax-invoice.component.html',
  styleUrls: ['./tax-invoice.component.scss'],
  providers: [DatePipe,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class TaxInvoiceComponent implements OnInit {
  loading!: boolean;
  invoiceData = [];
  invoiceInfo: any = [];
  config: any;
  totalInvoice = 0;
  loggedInSme: any;
  maxDate: any = new Date();
  toDateMin: any;
  roles: any;
  ownerList: any;
  ownerNames: User[];
  filerList: any;
  filerNames:User[];
  options1:User[] = [];
  options: User[] = [];
  filteredOptions: Observable<User[]>;
  filteredOptions1: Observable<User[]>;
  allFilers:any;

  searchParam: any = {
    statusId: null,
    page: 0,
    pageSize: 20,
    // assigned:false,
    // owner:true,
    mobileNumber: null,
    emailId: null,
  };
  invoiceListGridOptions: GridOptions;
  Status: any = [
    { label: 'Paid', value: 'Paid' },
    { label: 'Failed', value: 'Failed' },
  ];
  fyDropDown: any = [
    {
      label: '2022-2023',
      value: '2022-2023',
      startDate: new Date('2022-04-01'),
      endDate: new Date(),
    },
    {
      label: '2021-2022',
      value: '2021-2022',
      startDate: new Date('2021-04-01'),
      endDate: new Date('2022-03-31'),
    },
    {
      label: '2020-2021',
      value: '2020-2021',
      startDate: new Date('2020-04-01'),
      endDate: new Date('2021-03-31'),
    },
  ];

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private utilService: UtilsService,
    private userMsService: UserMsService,
    private itrService: ItrMsService,
    private _toastMessageService: ToastMessageService,
    private dialog: MatDialog,
    @Inject(LOCALE_ID) private locale: string
  ) {

    this.invoiceListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.invoicesCreateColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => {
        this.gridApi = params.api;
      },
      sortable: true,
    };
    this.config = {
      itemsPerPage: 15,
      currentPage: 1,
      totalItems: null,
    };
  }

  cardTitle:any;
  smeList: any;
  gridApi: GridApi;

  ngOnInit() {
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    this.roles = this.loggedInSme[0]?.roles;
    this.cardTitle=this.roles?.includes("ROLE_ADMIN")?
    'Leader/Admin':this.roles?.includes("ROLE_OWNER")?
    'Owner':this.roles?.includes("ROLE_FILER")?'Filer':"NA"
    console.log('roles', this.roles);
    // this.getInvoice();

    if(this.roles?.includes('ROLE_ADMIN') || this.roles?.includes('ROLE_LEADER')) {
      this.smeList = JSON.parse(sessionStorage.getItem(AppConstants.AGENT_LIST));
      console.log('all filers', this.smeList);
      this.allFilers = this.smeList.map((item) => {
        return {name: item.name, userId: item.userId};
      });
      this.options1 = this.allFilers;
    } else if(this.roles?.includes('ROLE_OWNER')){
      this.smeList = JSON.parse(sessionStorage.getItem(AppConstants.MY_AGENT_LIST));
      console.log('my agents', this.smeList);
      this.allFilers = this.smeList.map((item) => {
        return {name: item.name, userId: item.userId};
      });
      this.options1 = this.allFilers;
    }

    if (this.roles?.includes('ROLE_OWNER')) {
      this.ownerDetails = this.loggedInSme[0];
    } else if(!this.roles?.includes('ROLE_ADMIN') && !this.roles?.includes('ROLE_LEADER')) {
      this.filerDetails = this.loggedInSme[0];
    }
    this.getOwner();
    //  this.getFilers();
    this.startDate.setValue('2023-04-01');
    this.endDate.setValue(new Date());

    this.setFiletedOptions1()
    this.setFiletedOptions2();

    this.getInvoice();
  }

  setFiletedOptions2(){
    this.filteredOptions1 = this.searchFiler.valueChanges.pipe(
      startWith(''),
      map((value) => {
        if(!this.utilService.isNonEmpty(value)){
          this.filerDetails = null;
        }
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filter(name as string, this.options1) : this.options1.slice();
      })
    );
  }

  setFiletedOptions1(){
    this.filteredOptions = this.searchOwner.valueChanges.pipe(
      startWith(''),
      map((value) => {
        if(!this.utilService.isNonEmpty(value)){
          this.ownerDetails = null;
        }
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filter(name as string, this.options) : this.options.slice();
      })
    );
  }

  setList(){
    if(this.searchOwner.value==''){
      this.options1=this.allFilers;
      this.setFiletedOptions2()
    }
  }

  displayFn(user: User): string {
    return user && user.name ? user.name : '';
  }

  private _filter(name: string, options): User[] {
    const filterValue = name.toLowerCase();

    return options.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
  }

  invoiceFormGroup: FormGroup = this.fb.group({
    assessmentYear: new FormControl('2023-24'),
    startDate: new FormControl(''),
    endDate: new FormControl(''),
    status: new FormControl('Paid'),
    searchFiler: new FormControl(''),
    searchOwner: new FormControl(''),
  });
  get assessmentYear() {
    return this.invoiceFormGroup.controls['assessmentYear'] as FormControl;
  }
  get startDate() {
    return this.invoiceFormGroup.controls['startDate'] as FormControl;
  }
  get endDate() {
    return this.invoiceFormGroup.controls['endDate'] as FormControl;
  }
  get status() {
    return this.invoiceFormGroup.controls['status'] as FormControl;
  }
  get searchFiler() {
    return this.invoiceFormGroup.controls['searchFiler'] as FormControl;
  }
  get searchOwner() {
    return this.invoiceFormGroup.controls['searchOwner'] as FormControl;
  }

  getOwner() {
    const loggedInSmeUserId=this.loggedInSme[0].userId
    let param = `/sme-details-new/${loggedInSmeUserId}?owner=true`;
    this.userMsService.getMethod(param).subscribe((result: any) => {
      console.log('owner list result -> ', result);
      this.ownerList = result.data;
      console.log("ownerlist",this.ownerList)
      this.ownerNames = this.ownerList.map((item) => {
        return { name: item.name, userId:item.userId  };
      });
      this.options = this.ownerNames;
      console.log(' ownerName -> ', this.ownerNames);
    });
  }


  getFilers() {
    // API to get filers under owner-
    // https://dev-api.taxbuddy.com/user/sme-details-new/8078?owner=true&assigned=true
    const loggedInSmeUserId=this.loggedInSme[0].userId;
    let param = '';
    if(this.ownerDetails?.userId){
       param = `/sme-details-new/${this.ownerDetails?.userId}?owner=true&assigned=true`;
    }else{
       param = `/sme-details-new/${loggedInSmeUserId}?owner=true&assigned=true`;
    }

    this.userMsService.getMethod(param).subscribe((result: any) => {
      this.options1=[];
      console.log('filer list result -> ', result);
      this.filerList = result.data;
      console.log("filerList",this.filerList)
      this.filerNames = this.ownerList.map((item) => {
        return { name: item.name, userId:item.userId  };
      });
      this.options1 = this.filerNames;
      this.setFiletedOptions2()
      console.log(' filerNames -> ', this.filerNames);
    });
  }

  ownerDetails: any;
  getOwnerNameId(option) {
    this.ownerDetails = option;
    console.log(option);
  }


  filerDetails: any;
  getFilerNameId(option) {
    this.filerDetails = option;
    console.log(option);
  }


  getInvoice() {

    ///itr/v1/invoice/back-office?filerUserId=23505&ownerUserId=1062&paymentStatus=Unpaid,Failed&fromDate=2023-04-01&toDate=2023-04-07&pageSize=10&page=0
    ///itr/v1/invoice/back-office?fromDate=2023-04-07&toDate=2023-04-07&page=0&pageSize=20
    ///////////////////////////////////////////////////////////////////////////
    const loggedInSmeUserId = this?.loggedInSme[0]?.userId;
    let data = this.utilService.createUrlParams(this.searchParam);
    let status = this.status.value;
    console.log('selected status', this.status);
    let fromData =
      this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') ||
      this.startDate.value;
    console.log('fromdate', fromData);
    let toData = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd');
    console.log('todate', toData);
    let param = '';
    let statusFilter = '';
    if (status) {
      statusFilter = `&paymentStatus=${status}`;
    }
    let userFilter = '';
    if (this.ownerDetails?.userId) {
      userFilter += `&ownerUserId=${this.ownerDetails.userId}`;
    }
    if (this.filerDetails?.userId) {
      userFilter += `&filerUserId=${this.filerDetails.userId}`;
    }
    param = `/v1/invoice/back-office?fromDate=${fromData}&toDate=${toData}&${data}${userFilter}${statusFilter}`;
    this.itrService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      this.invoiceData = response.data.content;
      this.totalInvoice = response?.data?.totalElements;
      // this.invoicesCreateColumnDef(this.smeList);
      this.gridApi?.setRowData(this.createRowData(this.invoiceData));
      this.config.totalItems = response?.data?.totalElements;
    });

    /*this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    this.roles = this.loggedInSme[0]?.roles;
    console.log(this.loggedInSme[0].userId);

    if (this.roles?.includes('ROLE_OWNER')) {
      this.loading = true;
      const param = `/v1/invoice/back-office?ownerUserId=${
        this.loggedInSme[0].userId
      }&paymentStatus=${this.status.value}&fromDate=${this.datePipe.transform(
        this.startDate.value,
        'yyyy-MM-dd'
      )}&toDate=${this.datePipe.transform(
        this.endDate.value,
        'yyyy-MM-dd'
      )}&pageSize=${this.config.itemsPerPage}&page=${
        this.config.currentPage || 1
      }`;

      this.itrService.getMethod(param).subscribe(
        (res: any) => {
          this.loading = false;
          this.loading = false;
          console.log(res);
          this.invoiceData = res.data.content;
          this.totalInvoice = res?.data?.totalElements;
          this.gridApi?.setRowData(this.createRowData(this.invoiceData));
          this.config.totalItems = res?.data?.totalElements;
        },
        (error) => {
          this.loading = false;
          this.toastMsgService.alert(
            'error',
            'failed to calculate total capital gain.'
          );
        }
      );
    } else if (this.roles?.includes('ROLE_FILER')) {
      this.loading = true;
      const param = `/v1/invoice/back-office?filerUserId=${
        this.loggedInSme[0].userId
      }&paymentStatus=${this.status.value}&fromDate=${this.datePipe.transform(
        this.startDate.value,
        'yyyy-MM-dd'
      )}&toDate=${this.datePipe.transform(
        this.endDate.value,
        'yyyy-MM-dd'
      )}&pageSize=${this.config.itemsPerPage}&page=${
        this.config.currentPage || 1
      }`;

      this.itrService.getMethod(param).subscribe(
        (res: any) => {
          this.loading = false;
          console.log(res);
          this.invoiceData = res.data.content;
          this.totalInvoice = res?.data?.totalElements;
          this.gridApi?.setRowData(this.createRowData(this.invoiceData));
          this.config.totalItems = res?.data?.totalElements;
        },
        (error) => {
          this.loading = false;
          this.toastMsgService.alert(
            'error',
            'failed to calculate total capital gain.'
          );
        }
      );
    } else {
      this.loading = true;
      const param = `/v1/invoice/back-office?paymentStatus=${
        this.status.value
      }&fromDate=${this.datePipe.transform(
        this.startDate.value,
        'yyyy-MM-dd'
      )}&toDate=${this.datePipe.transform(
        this.endDate.value,
        'yyyy-MM-dd'
      )}&pageSize=${this.config.itemsPerPage}&page=${
        this.config.currentPage || 1
      }`;

      this.itrService.getMethod(param).subscribe(
        (res: any) => {
          this.loading = false;
          console.log(res);
          this.invoiceData = res.data.content;
          this.totalInvoice = res?.data?.totalElements;
          this.gridApi?.setRowData(this.createRowData(this.invoiceData));
          this.config.totalItems = res?.data?.totalElements;
        },
        (error) => {
          this.loading = false;
          this.toastMsgService.alert(
            'error',
            'failed to calculate total capital gain.'
          );
        }
      );
    }*/
  }

  createRowData(userInvoices) {
    console.log('userInvoices: ', userInvoices)
    var invoices = [];
    for (let i = 0; i < userInvoices.length; i++) {
      let updateInvoice = Object.assign({}, userInvoices[i],
        {
          userId: userInvoices[i].userId,
          billTo: userInvoices[i].billTo,
          phone: userInvoices[i].phone,
          email: userInvoices[i].email,
          invoiceNo: userInvoices[i].invoiceNo,
          txbdyInvoiceId: userInvoices[i].txbdyInvoiceId,
          invoiceDate: userInvoices[i].invoiceDate,
          dueDate: userInvoices[i].dueDate,
          modeOfPayment: userInvoices[i].modeOfPayment,
          paymentDate: userInvoices[i].paymentDate,
          paymentStatus: userInvoices[i].paymentStatus,
          purpose: userInvoices[i].itemList[0].itemDescription,
          invoicePreparedBy: userInvoices[i].agentName,
          invoiceAssignedTo: userInvoices[i].agentName,
          ifaLeadClient: userInvoices[i].ifaLeadClient,
          total: userInvoices[i].total
        })
      invoices.push(updateInvoice)
    }
    console.log('user invoices: ', invoices);
    return invoices;
  }

  getCount(param) {
    return this.invoiceData.filter(
      (item: any) => item.paymentStatus.toLowerCase() === param
    ).length;
  }

  downloadInvoicesSummary() {
    console.log('this.summaryDetailForm.value: ', this.invoiceFormGroup);
    if (this.invoiceFormGroup.valid) {
      console.log(this.invoiceFormGroup.value);
      // let fromData = this.invoiceFormGroup.value.fromDate;
      // let toData = this.invoiceFormGroup.value.toDate;
      let fromData = this.datePipe.transform(
        this.startDate.value,
        'yyyy-MM-dd'
      );
      let toData = this.datePipe.transform(
        this.endDate.value,
        'yyyy-MM-dd'
      );
      if (this.utilService.isNonEmpty(this.status.value)) {
        location.href =
          environment.url +
          '/itr/invoice/csv-report?fromDate=' +
          fromData +
          '&toDate=' +
          toData +
          '&paymentStatus=' +
          this.status.value;
      } else {
        location.href =
          environment.url +
          '/itr/invoice/csv-report?fromDate=' +
          fromData +
          '&toDate=' +
          toData;
      }
    }
  }

  invoicesCreateColumnDef() {
    return [
      {
        headerName: 'User Id',
        field: 'userId',
        width: 80,
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
          apply: true,
        },
      },
      {
        headerName: 'Invoice No',
        field: 'invoiceNo',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Invoice Date',
        field: 'invoiceDate',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data) => {
          return formatDate(data.value, 'dd MMM yyyy', this.locale);
        },
      },
      {
        headerName: 'User Name',
        field: 'billTo',
        width: 180,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Mobile No',
        field: 'phone',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Email',
        field: 'email',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Status',
        field: 'paymentStatus',
        width: 100,
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['startsWith', 'contains', 'notContains'],
          debounceMs: 0,
        },
        cellStyle: function (params: any) {
          if (params.data.paymentStatus === 'Paid') {
            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              backgroundColor: 'green',
              color: 'white',
            };
          } else {
            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              backgroundColor: 'red',
              color: 'white',
            };
          }
        },
      },
      {
        headerName: 'Services',
        field: 'serviceType',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Payment Mode',
        field: 'modeOfPayment',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Paid Date',
        field: 'paymentDate',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        cellRenderer: (data) => {
          return formatDate(data.value, 'dd MMM yyyy', this.locale);
        },
      },

      {
        headerName: 'Amount Paid',
        field: 'total',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
      },
      {
        headerName: 'Prepared By',
        field: 'invoicePreparedBy',
        width: 140,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        // valueGetter: function nameFromCode(params) {
        //   if (smeList.length !== 0) {
        //     const nameArray = smeList.filter(
        //       (item: any) =>
        //         item.userId.toString() === params.data.invoicePreparedBy
        //     );
        //     if (nameArray.length !== 0) {
        //       return nameArray[0].name;
        //     }
        //     return '-';
        //   }
        //   return params.data.statusId;
        // },
      },
      {
        headerName: 'Assigned to',
        field: 'invoiceAssignedTo',
        width: 140,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        // valueGetter: function nameFromCode(params) {
        //   if (smeList.length !== 0) {
        //     const nameArray = smeList.filter(
        //       (item: any) =>
        //         item.userId === params.data.invoiceAssignedTo
        //     );
        //     if (nameArray.length !== 0) {
        //       return nameArray[0].name;
        //     }
        //     return '-';
        //   }
        //   return params.data.statusId;
        // },
      },

      {
        headerName: 'Download invoice',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Download Invoice" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer">
         <i class="fa fa-download" aria-hidden="true" data-action-type="download-invoice"></i>
        </button>`;
        },
        width: 55,
        pinned: 'right',
        cellStyle: {
          textAlign: 'center',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
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
            textAlign: 'center',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          };
        },
      },
    ];
  }

  public onInvoiceRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {

        case 'download-invoice': {
          this.downloadInvoice(params.data);
          break;
        }

        case 'addNotes': {
          this.showNotes(params.data);
          break;
        }
      }
    }
  }


  downloadInvoice(data) {
    //https://uat-api.taxbuddy.com/itr/v1/invoice/download?txbdyInvoiceId={txbdyInvoiceId}
    location.href =
      environment.url + `/itr/v1/invoice/download?txbdyInvoiceId=${data.txbdyInvoiceId}`;
  }

  showNotes(client) {
    let disposable = this.dialog.open(UserNotesComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.billTo,
      },
    });

    disposable.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
    });
  }

  setDates() {
    let data = this.fyDropDown.filter(
      (item: any) => item.value === this.assessmentYear.value
    );
    if (data.length > 0) {
      this.startDate.setValue(data[0].startDate);
      this.endDate.setValue(data[0].endDate);
    }
    console.log(data);
  }
  setToDateValidation(FromDate) {
    console.log('FromDate: ', FromDate);
    this.toDateMin = FromDate;
  }

  pageChanged(event: any) {
    this.config.currentPage = event;
    this.searchParam.page = event - 1;
    this.getInvoice();
  }
}
