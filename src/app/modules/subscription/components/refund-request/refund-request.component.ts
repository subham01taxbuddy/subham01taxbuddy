import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GridOptions, ICellRendererParams } from 'ag-grid-community';
import { UserNotesComponent } from 'src/app/modules/shared/components/user-notes/user-notes.component';
import { ChatOptionsDialogComponent } from 'src/app/modules/tasks/components/chat-options/chat-options-dialog.component';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ApproveRejectComponent } from '../approve-reject/approve-reject.component';
import { AgTooltipComponent } from 'src/app/modules/shared/components/ag-tooltip/ag-tooltip.component';
import { SmeListDropDownComponent } from 'src/app/modules/shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { CoOwnerListDropDownComponent } from 'src/app/modules/shared/components/co-owner-list-drop-down/co-owner-list-drop-down.component';

@Component({
  selector: 'app-refund-request',
  templateUrl: './refund-request.component.html',
  styleUrls: ['./refund-request.component.scss']
})
export class RefundRequestComponent implements OnInit {
  loading: boolean;
  cancelSubscriptionData: any;
  config = {
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: null,
  };
  refundListGridOptions: GridOptions;
  coOwnerId: number;
  coFilerId: number;
  ownerId: number;
  filerId: number;
  agentId: number;
  userInfo: any = [];
  loggedInUserRoles: any;
  isOwner: boolean;

  invoiceFormGroup: FormGroup = this.fb.group({

    mobile: new FormControl(''),
    email: new FormControl(''),
    txbdyInvoiceId: new FormControl(''),
  });

  get mobile() {
    return this.invoiceFormGroup.controls['mobile'] as FormControl;
  }

  get email() {
    return this.invoiceFormGroup.controls['email'] as FormControl;
  }

  get txbdyInvoiceId() {
    return this.invoiceFormGroup.controls['txbdyInvoiceId'] as FormControl;
  }

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private itrService: ItrMsService,
    private router: Router,
    private utilService: UtilsService,
    @Inject(LOCALE_ID) private locale: string
  ) {
    this.refundListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.refundCreateColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => {

      }
      ,

      sortable: true,
      defaultColDef: {
        resizable: true,
        cellRendererFramework: AgTooltipComponent,
        cellRendererParams: (params: ICellRendererParams) => {
          this.formatToolTip(params.data);
        },
      },
    };
  }

  formatToolTip(params: any) {
    let temp = params.value;
    const lineBreak = false;
    return { temp, lineBreak };
  }

  fromOwner(event, isOwner) {
    if (event) {
      this.ownerId=null;
      this.filerId=null;
      if (this.isOwner) {
        this.ownerId = event ? event.userId : null;
        this.getRefundRequestList(0, 'ownerUserId', this.ownerId);
      } else {
        this.filerId = event ? event.userId : null;
        this.getRefundRequestList(0, 'filerUserId', this.filerId);
      }
    }
  }

  ngOnInit(): void {
    this.loggedInUserRoles = this.utilsService.getUserRoles();
    this.isOwner = this.loggedInUserRoles.indexOf('ROLE_OWNER') > -1;
  }
  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  @ViewChild('coOwnerDropDown') coOwnerDropDown: CoOwnerListDropDownComponent;

  resetFilters() {
    this.smeDropDown?.resetDropdown();
    const data = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    const loginSMEInfo = data[0];
    this.invoiceFormGroup.reset();
    this.invoiceFormGroup.updateValueAndValidity();
    this.filerId=null;
    this.ownerId=null;
    if (this.isOwner) {
      this.getRefundRequestList(0, 'ownerUserId', loginSMEInfo.userId);
    } else {
      this.getRefundRequestList(0);
    }

  }

  applyFilter() {
    const data = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    const loginSMEInfo = data[0];
    if (this.isOwner) {
      this.getRefundRequestList(0, 'ownerUserId', loginSMEInfo.userId);
    } else {
      this.getRefundRequestList(0);
    }
  }

  getRefundRequestList(pageNo, isUserId?, id?) {
    let pagination;
    let param;

    let mobileFilter = '';
    if (
      this.utilService.isNonEmpty(
        this.invoiceFormGroup.controls['mobile'].value
      ) &&
      this.invoiceFormGroup.controls['mobile'].valid
    ) {
      mobileFilter =
        '&mobile=' + this.invoiceFormGroup.controls['mobile'].value;
    }
    let emailFilter = '';
    if (
      this.utilService.isNonEmpty(
        this.invoiceFormGroup.controls['email'].value
      ) &&
      this.invoiceFormGroup.controls['email'].valid
    ) {
      emailFilter = '&email=' + this.invoiceFormGroup.controls['email'].value;
    }
    let invoiceFilter = '';
    if (
      this.utilService.isNonEmpty(
        this.invoiceFormGroup.controls['txbdyInvoiceId'].value
      )
    ) {
      invoiceFilter =
        '&txbdyInvoiceId=' +
        this.invoiceFormGroup.controls['txbdyInvoiceId'].value;
    }

    if (id) {
      pagination = `&page=${pageNo}&size=${this.config.itemsPerPage}${mobileFilter}${emailFilter}${invoiceFilter}`;
      param = '/v1/invoice/refund/requests?' + isUserId + '=' + id + pagination;
    } else {
      let userParam = '';
      if (this.ownerId) {
        userParam += `&ownerUserId=${this.ownerId}`;
      }
      if (this.filerId) {
        userParam += `&filerUserId=${this.filerId}`;
      }
      pagination = `?page=${pageNo}&size=${this.config.itemsPerPage}${mobileFilter}${emailFilter}${invoiceFilter}`;
      param = '/v1/invoice/refund/requests' + pagination + userParam;
    }
    this.loading = true;
    this.itrService.getMethod(param).subscribe(
      (response: any) => {
        this.cancelSubscriptionData = response;
        this.loading = false;
        if (response.success) {
          if (response.data.content instanceof Array && response.data.content.length > 0) {
            this.refundListGridOptions.api?.setRowData(this.createRowData(response.data.content));
            this.config.totalItems = response.data.totalElements;
          } else {
            this.refundListGridOptions.api?.setRowData(this.createRowData([]));
            this.config.totalItems = 0;
          }
        } else {
          this.refundListGridOptions.api?.setRowData(this.createRowData([]));
          this._toastMessageService.alert("error", response.message);
        }
      },
      (error) => {
        this.refundListGridOptions.api?.setRowData(this.createRowData([]));
        this.loading = false;
      }
    );
  }

  pageChanged(event: any) {
    this.config.currentPage = event;
    this.getRefundRequestList(event - 1);
  }

  refundCreateColumnDef() {
    return [
      {
        field: 'selection',
        headerName: '',
        headerCheckboxSelection: true,
        checkboxSelection: true,
        width: 50,

        lockPosition: true,
        suppressMovable: false,
        cellRenderer: (params) => { },
      },
      {
        headerName: 'User Id',
        field: 'userId',
        width: 100,
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'User Name',
        field: 'name',
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
        headerName: 'Mobile No.',
        field: 'mobile',
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
        headerName: 'Email Id',
        field: 'email',
        width: 200,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Request Type',
        field: 'refundRequestType',
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
        headerName: 'Request Date',
        field: 'requestCreatedDate',
        width: 130,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data: any) => {
          if (data !== null)
            return formatDate(data.value, 'dd/MM/yyyy', this.locale);
          else
            return '-';
        },
      },

      {
        headerName: 'Subscription',
        field: 'subscription',
        width: 320,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Old Subscription',
        field: 'oldSubscriptionAmount',
        width: 130,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },

      },
      {
        headerName: 'New Subscription',
        field: 'newSubscriptionAmount',
        width: 130,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },

      },
      {
        headerName: 'Service Type',
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
        headerName: 'Filer Name',
        field: 'assignedToName',
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
        headerName: 'Invoice Details (No :  Amount)',
        field: 'invoiceDetails',
        width: 250,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Amount to refund',
        field: 'payableRefundAmount',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Amount Paid Updates',
        field: 'payableRefundAmount',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'left' },
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

  createRowData(subscriptionData) {
    const newData = [];
    for (let i = 0; i < subscriptionData.length; i++) {
      const invoiceDetails = [];
      if (subscriptionData[i].invoiceDetail && subscriptionData[i].invoiceDetail.length > 0) {
        for (let x = 0; x < subscriptionData[i].invoiceDetail?.length; x++) {
          if (subscriptionData[i].invoiceDetail[x].invoiceNo === null) {
            subscriptionData[i].invoiceDetail[x].invoiceNo = '-';
          }
          let perInvoiceDetails = subscriptionData[i].invoiceDetail[x].invoiceNo + ': ' + subscriptionData[i].invoiceDetail[x].payableRefundAmount + ': ' + subscriptionData[i].invoiceDetail[x].paymentStatus;
          invoiceDetails.push(perInvoiceDetails);
        }
      }
      newData.push({
        userId: this.utilsService.isNonEmpty(subscriptionData[i].userId) ? subscriptionData[i].userId : '-',
        name: this.utilsService.isNonEmpty(subscriptionData[i].name) ? subscriptionData[i].name : '-',
        mobile: this.utilsService.isNonEmpty(subscriptionData[i].mobile) ? subscriptionData[i].mobile : '-',
        email: this.utilsService.isNonEmpty(subscriptionData[i].email) ? subscriptionData[i].email : '-',
        refundRequestType: this.utilsService.isNonEmpty(subscriptionData[i].refundRequestType) ? subscriptionData[i].refundRequestType : '-',
        requestCreatedDate: subscriptionData[i].requestCreatedDate,
        subscription: this.utilsService.isNonEmpty(subscriptionData[i].subscription) ? subscriptionData[i].subscription : '-',
        oldSubscriptionAmount: this.utilsService.isNonEmpty(subscriptionData[i].oldSubscriptionAmount) ? subscriptionData[i].oldSubscriptionAmount : '-',
        newSubscriptionAmount: this.utilsService.isNonEmpty(subscriptionData[i].newSubscriptionAmount) ? subscriptionData[i].newSubscriptionAmount : '-',
        serviceType: this.utilsService.isNonEmpty(subscriptionData[i].serviceType) ? subscriptionData[i].serviceType : '-',
        assignedToName: this.utilsService.isNonEmpty(subscriptionData[i].assignedToName) ? subscriptionData[i].assignedToName : '-',
        invoiceDetails: invoiceDetails.toString(),
        payableRefundAmount: this.utilsService.isNonEmpty(subscriptionData[i].payableRefundAmount) ? subscriptionData[i].payableRefundAmount : '-',


      });
    }
    return newData;
  }

  onRefundRowClicked(params: any) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'addNotes': {
          this.showNotes(params.data);
          break;
        }
        case 'open-chat': {
          this.openChat(params.data);
          break;
        }
      }
    }
  }

  updateStatus(mode, client) {
    let disposable = this.dialog.open(ApproveRejectComponent, {
      width: '50%',
      height: 'auto',
      data: {
        mode: 'Update Cancel Subscription Status',
        userInfo: client,
        approve: 'Approve',
        reject: 'Reject'
      }
    })
    disposable.afterClosed().subscribe(result => {
      if (result) {
        const data = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
        const loginSMEInfo = data[0];
        if (this.isOwner) {
          this.getRefundRequestList(0, 'ownerUserId', loginSMEInfo.userId);
        } else {
          this.getRefundRequestList(0);
        }
      }
    });
  }


  showNotes(client) {
    let disposable = this.dialog.open(UserNotesComponent, {
      width: '75vw',
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


}
