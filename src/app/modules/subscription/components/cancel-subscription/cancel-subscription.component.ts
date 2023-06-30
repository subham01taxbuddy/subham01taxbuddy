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
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ApproveRejectComponent } from '../approve-reject/approve-reject.component';
import { AgTooltipComponent } from 'src/app/modules/shared/components/ag-tooltip/ag-tooltip.component';
import { SmeListDropDownComponent } from 'src/app/modules/shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { CoOwnerListDropDownComponent } from 'src/app/modules/shared/components/co-owner-list-drop-down/co-owner-list-drop-down.component';

@Component({
  selector: 'app-cancel-subscription',
  templateUrl: './cancel-subscription.component.html',
  styleUrls: ['./cancel-subscription.component.scss']
})
export class CancelSubscriptionComponent implements OnInit {
  loading: boolean;
  cancelSubscriptionData: any;
  config = {
    itemsPerPage: 20,
    currentPage: 1,
    totalItems: null,
  };
  subscriptionListGridOptions: GridOptions;
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
  });

  get mobile() {
    return this.invoiceFormGroup.controls['mobile'] as FormControl;
  }

  get email() {
    return this.invoiceFormGroup.controls['email'] as FormControl;
  }


  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private _toastMessageService: ToastMessageService,
    private utilService: UtilsService,
    private itrService: ItrMsService,
    @Inject(LOCALE_ID) private locale: string
  ) {

    this.subscriptionListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.subscriptionCreateColumnDef(),
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
      this.ownerId = null;
      this.filerId = null;
      if (isOwner) {
        this.ownerId = event ? event.userId : null;
        this.getCancelSubscriptionList(0, 'ownerUserId', this.ownerId);
      } else {
        this.filerId = event ? event.userId : null;
        this.getCancelSubscriptionList(0, 'filerUserId', this.filerId);
      }
    }
  }

  ngOnInit(): void {
    this.loggedInUserRoles = this.utilService.getUserRoles();
    this.isOwner = this.loggedInUserRoles.indexOf('ROLE_OWNER') > -1;
  }

  public rowSelection: 'single';
  rowMultiSelectWithClick: false;

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  @ViewChild('coOwnerDropDown') coOwnerDropDown: CoOwnerListDropDownComponent;
  resetFilters() {
    this.invoiceFormGroup.controls['mobile'].setValue(null);
    this.invoiceFormGroup.controls['email'].setValue(null);
    this.smeDropDown?.resetDropdown();
    const data = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    const loginSMEInfo = data[0];
    this.invoiceFormGroup.reset();
    this.invoiceFormGroup.updateValueAndValidity();

    this.filerId = null;
    this.ownerId = null;
    if (this.isOwner) {
      this.getCancelSubscriptionList(0, 'ownerUserId', loginSMEInfo.userId);
    } else {
      this.getCancelSubscriptionList(0);
    }

  }

  applyFilter() {
    const data = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    const loginSMEInfo = data[0];
    if (this.filerId) {
      this.getCancelSubscriptionList(0, 'filerUserId', this.filerId);
      return;
    }
    if (this.isOwner) {
      this.getCancelSubscriptionList(0, 'ownerUserId', loginSMEInfo.userId);
    } else {
      this.getCancelSubscriptionList(0);
    }
  }

  getCancelSubscriptionList(pageNo, isUserId?, id?) {
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
      emailFilter = '&email=' + this.invoiceFormGroup.controls['email'].value.toLocaleLowerCase();
    }


    let pagination;
    let param;

    if (id) {
      pagination = `&page=${pageNo}&size=${this.config.itemsPerPage}${mobileFilter}${emailFilter}`;
      param = '/subscription/cancel/requests?' + isUserId + '=' + id + pagination;
    } else {
      let userParam = '';
      if (this.ownerId) {
        userParam += `&ownerUserId=${this.ownerId}`;
      }
      if (this.filerId) {
        userParam += `&filerUserId=${this.filerId}`;
      }
      pagination = `?page=${pageNo}&size=${this.config.itemsPerPage}${mobileFilter}${emailFilter}`;
      param = '/subscription/cancel/requests' + pagination + userParam;
    }
    this.loading = true;
    this.itrService.getMethod(param).subscribe(
      (response: any) => {
        this.cancelSubscriptionData = response;
        this.loading = false;
        if (response.success) {
          if (response?.data?.content instanceof Array && response?.data?.content?.length > 0) {
            this.subscriptionListGridOptions.api?.setRowData(this.createRowData(response.data.content));
            this.config.totalItems = response.data.totalElements;
          } else {
            this.subscriptionListGridOptions.api?.setRowData(this.createRowData([]));
            this.config.totalItems = 0;
            if (response.message !== null) { this._toastMessageService.alert('error', response.message); }
            else { this._toastMessageService.alert('error', 'No Data Found'); }
          }
        } else {
          this.subscriptionListGridOptions.api?.setRowData(this.createRowData([]));
          this._toastMessageService.alert("error", response.message);
        }
      },
      (error) => {
        this.subscriptionListGridOptions.api?.setRowData(this.createRowData([]));
        this.loading = false;
        this._toastMessageService.alert("error", "Error while fetching subscription cancellation requests: Not_found: data not found");
      }
    );
  }

  pageChanged(event: any) {
    this.config.currentPage = event;
    this.getCancelSubscriptionList(event - 1);
  }

  subscriptionCreateColumnDef() {
    return [
      {
        field: 'selection',
        headerName: '',
        // headerCheckboxSelection: true,
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
        field: 'userName',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      // {
      //   headerName: 'Mobile No.',
      //   field: 'reminderMobileNumber',
      //   width: 120,
      //   suppressMovable: true,
      //   cellStyle: { textAlign: 'center' },
      //   filter: 'agTextColumnFilter',
      //   filterParams: {
      //     filterOptions: ['contains', 'notContains'],
      //     debounceMs: 0,
      //   },
      // },
      // {
      //   headerName: 'Email Id',
      //   field: 'reminderEmail',
      //   width: 120,
      //   suppressMovable: true,
      //   cellStyle: { textAlign: 'center' },
      //   filter: 'agTextColumnFilter',
      //   filterParams: {
      //     filterOptions: ['contains', 'notContains'],
      //     debounceMs: 0,
      //   },
      // },
      {
        headerName: 'Subscription',
        field: 'userSelected',
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
        headerName: 'Service Type',
        field: 'servicesType',
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
        field: 'assigneeName',
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
        field: 'cancellationRequestDate',
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
        headerName: 'Invoice Details (No :  Amount : Status)',
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
        headerName: 'Amount to be approved/refunded',
        field: 'payableSubscriptionAmount',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'left' },
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
            <i class="fa-regular fa-user-check" data-action-type="updateStatus"></i>
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
      {
        headerName: 'Chat',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Open Chat"
            style="border: none; background: transparent; font-size: 16px; cursor:pointer;color:#2dd35c;">
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
            <i class="far fa-file-alt" style="color:#ab8708;" aria-hidden="true" data-action-type="addNotes"></i>
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
      for (let x = 0; x < subscriptionData[i].invoiceDetail?.length; x++) {
        if (subscriptionData[i].invoiceDetail[x].invoiceNo === null) {
          subscriptionData[i].invoiceDetail[x].invoiceNo = '-';
        }
        let perInvoiceDetails = subscriptionData[i].invoiceDetail[x].invoiceNo + ': ' + subscriptionData[i].invoiceDetail[x].total + ': ' + subscriptionData[i].invoiceDetail[x].paymentStatus;
        invoiceDetails.push(perInvoiceDetails);
        console.log('invoiceDetails', invoiceDetails);
      }
      newData.push({
        userId: this.utilService.isNonEmpty(subscriptionData[i].userId) ? subscriptionData[i].userId : '-',
        userName: this.utilService.isNonEmpty(subscriptionData[i].userName) ? subscriptionData[i].userName : '-',
        reminderMobileNumber: this.utilService.isNonEmpty(subscriptionData[i].reminderMobileNumber) ? subscriptionData[i].reminderMobileNumber : '-',
        reminderEmail: this.utilService.isNonEmpty(subscriptionData[i].reminderEmail) ? subscriptionData[i].reminderEmail : '-',
        userSelected: this.utilService.isNonEmpty(subscriptionData[i].userSelectedPlan) ? subscriptionData[i].userSelectedPlan.name + '  ' + subscriptionData[i].userSelectedPlan.description.toString()
          : this.utilService.isNonEmpty(subscriptionData[i].smeSelectedPlan) ? subscriptionData[i].smeSelectedPlan.name + '  ' + subscriptionData[i].smeSelectedPlan.description.toString()
            : '-',
        servicesType: this.utilService.isNonEmpty(subscriptionData[i].userSelectedPlan) ? subscriptionData[i].userSelectedPlan.servicesType :
          this.utilService.isNonEmpty(subscriptionData[i].smeSelectedPlan) ? subscriptionData[i].smeSelectedPlan.servicesType : '-',
        assigneeName: (this.utilService.isNonEmpty(subscriptionData[i].assigneeName) && subscriptionData[i].subscriptionAssigneeId !== 0) ? subscriptionData[i].assigneeName : 'NA',
        cancellationRequestDate: this.utilService.isNonEmpty(subscriptionData[i].cancellationRequestDate) ? subscriptionData[i].cancellationRequestDate : null,
        invoiceDetails: invoiceDetails.toString(),
        payableSubscriptionAmount: this.utilService.isNonEmpty(subscriptionData[i].payableSubscriptionAmount) ? subscriptionData[i].payableSubscriptionAmount : '-',
        cancellationStatus: subscriptionData[i].cancellationStatus,


        subscriptionId: subscriptionData[i].subscriptionId,
        planAgreedByUserOn: subscriptionData[i].planAgreedByUserOn,
        startDate: subscriptionData[i].startDate,
        endDate: subscriptionData[i].endDate,
        subscriptionAssigneeId: subscriptionData[i].subscriptionAssigneeId !== 0 ? subscriptionData[i].subscriptionAssigneeId : 'NA',
        isActive: subscriptionData[i].isActive,
        served: subscriptionData[i].served,
        promoCode: this.utilService.isNonEmpty(subscriptionData[i].promoCode) ? subscriptionData[i].promoCode : '-',
        subscriptionCreatedBy: subscriptionData[i].subscriptionCreatedBy,
      });
    }
    return newData;
  }

  onSubscriptionRowClicked(params: any) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'updateStatus': {
          this.updateStatus('Update Status', params.data);
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
          this.getCancelSubscriptionList(0, 'ownerUserId', loginSMEInfo.userId);
        } else {
          this.getCancelSubscriptionList(0);
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
        serviceType: client.serviceType,
        clientMobileNumber: (client?.mobileNumber) ? (client?.mobileNumber) : ''
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
