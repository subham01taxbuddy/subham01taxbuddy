import { style } from '@angular/animations';
import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { ItrMsService } from 'app/services/itr-ms.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
import moment = require('moment');
import { AddSubscriptionComponent } from '../add-subscription/add-subscription.component';

@Component({
  selector: 'app-subscription-detail',
  templateUrl: './subscription-detail.component.html',
  styleUrls: ['./subscription-detail.component.css']
})
export class SubscriptionDetailComponent implements OnInit {

  loading: boolean;
  searchVal: any;
  subscriptionListGridOptions: GridOptions;
  selectedUserName: any = '';
  userId: any;

  constructor(private _toastMessageService: ToastMessageService, public utilsService: UtilsService, private itrService: ItrMsService, @Inject(LOCALE_ID) private locale: string,
    private userService: UserMsService, private router: Router, private dialog: MatDialog) {
    this.subscriptionListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.subscriptionColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      sortable: true,
    };
  }

  ngOnInit() {
    this.getUserSubscriptionInfo();
  }

  subscriptionColoumnDef() {
    return [
      {
        headerName: 'User Id',
        field: 'userId',
        width: 80,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'User Selected',
        field: 'userSelected',
        width: 180,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'SME Selected',
        field: 'smeSelected',
        width: 180,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        cellRenderer: function (params) {
          if (params.data.smeSelected !== 'NA') {
            if (params.data.planAgreedByUserOn !== null && params.data.planAgreedByUserOn !== '') {
              return `<button type="button" class="action_icon add_button" title="User Accepted changed amount"
          style="border: none; background: transparent; font-size: 8px; cursor:pointer">
            <i class="fa fa-circle" style="color:green" aria-hidden="true"></i>
           </button>`+ params.data.smeSelected;
            }
            return `<button type="button" class="action_icon add_button" title="User has not accepted plan change request yet."
          style="border: none; background: transparent; font-size: 8px; cursor:pointer">
            <i class="fa fa-circle" style="color:red" aria-hidden="true"></i>
           </button>`+ params.data.smeSelected;
          }
          return params.data.smeSelected
        },
      },
      {
        headerName: 'Service Type',
        field: 'servicesType',
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
        headerName: 'Promo Code',
        field: 'promoCode',
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
        headerName: 'Invoice Amount',
        field: 'invoiceAmount',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
      },
      {
        headerName: 'Is Active',
        field: 'isActive',
        width: 80,
        suppressMovable: true,
        valueGetter: function (params) {
          if (params.data.isActive) {
            return 'Yes';
          } else {
            return 'No'
          }
        },
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Start Date',
        field: 'startDate',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        valueFormatter: (data) => data.value ? moment(data.value).format('DD MMM YYYY') : null,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'End Date',
        field: 'endDate',
        width: 120,
        suppressMovable: true,
        valueFormatter: (data) => data.value ? moment(data.value).format('DD MMM YYYY') : null,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        tooltip: function (params) {
          let currentDate = new Date();
          let dateSent = new Date(params.data.endDate);
          let diff = Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate())) / (1000 * 60 * 60 * 24));
          if (diff > 0 && !params.data.served) {
            return 'Subscription is ended you have not served client yet.';
          } else if (diff > -8 && !params.data.served) {
            return 'Subscription will be end in next 7 days.';
          }
        },
        cellStyle: function (params) {
          let currentDate = new Date();
          let dateSent = new Date(params.data.endDate);
          let diff = Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate())) / (1000 * 60 * 60 * 24));
          console.log('____________________', diff, '______', dateSent)
          if (diff > 0 && !params.data.served) {
            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              color: 'red',
            }
          } else if (diff > -7 && !params.data.served) {
            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              color: 'orange',
            }
          } else {
            return { textAlign: 'center' }
          }
        },
      },
      {
        headerName: 'Invoice Id',
        field: 'txbdyInvoiceId',
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
        headerName: 'Filer Id',
        field: 'subscriptionAssigneeId',
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
        headerName: 'Add Plan',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Add Subscription plan"
          style="border: none;
            background: transparent; font-size: 16px; cursor:pointer">
            <i class="fa fa-inr" aria-hidden="true" data-action-type="subscription"></i>
           </button>`;
        },
        width: 60,
        pinned: 'right',
        cellStyle: function (params) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      {
        headerName: 'Invoice',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          if (params.data.txbdyInvoiceId == 0) {
            return `<button type="button" class="action_icon add_button" title="Generate Invoice" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-files-o" aria-hidden="true" data-action-type="generateInvoice"></i>
           </button>`;
          } else {
            return `<button type="button" class="action_icon add_button" title="Delete Invoice" 
            style="border: none;
            background: transparent; font-size: 16px; cursor:pointer">
            <i class="fa fa-trash" aria-hidden="true" data-action-type="delete-invoice"></i>
           </button>`;
          }
        },
        width: 60,
        pinned: 'right',
        cellStyle: function (params) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      {
        headerName: "Served",
        field: "served",
        width: 50,
        pinned: 'right',
        cellRenderer: params => {
          return `<input type='checkbox' style="border: none;
             cursor:pointer;" data-action-type="served" ${params.data.served === true ? 'checked' : ''} />`;
        },
        cellStyle: params => {
          return (!params.data.isActive) ? { 'pointer-events': 'none', opacity: '0.4' }
            : '';
        }
      }
    ]
  }

  advanceSearch() {
    console.log('this.searchVal -> ', this.searchVal)
    if (this.utilsService.isNonEmpty(this.searchVal)) {
      if (this.searchVal.toString().length === 10) {
        this.getUserIdByMobileNum(this.searchVal)
      } else {
        this._toastMessageService.alert("error", "Enter valid mobile number.");
      }
    }
    else {
      this.getUserSubscriptionInfo();
      this.utilsService.showSnackBar('You are fetching all records.')
    }
  }

  getUserIdByMobileNum(mobileNumber) {
    this.loading = true;
    let param = '/search/userprofile/query?mobileNumber=' + mobileNumber;
    this.userService.getMethod(param).subscribe((res: any) => {
      this.loading = false;
      console.log('Get user id by mobile number responce: ', res);
      if (res && res.records instanceof Array) {
        this.selectedUserName = res.records[0].family[0].fName + ' ' + res.records[0].family[0].lName;
        this.userId = res.records[0].userId;
        this.getUserSubscriptionInfo(res.records[0].userId);
      }
    },
      error => {
        this.loading = false;
        this.selectedUserName = '';
        console.log('Error -> ', error);
        this._toastMessageService.alert("error", this.utilsService.showErrorMsg(error.error.status));
      })
  }

  allSubscriptions = [];
  getUserSubscriptionInfo(userId?) {
    var param = '';
    if (userId) {
      param = '/subscription?userId=' + userId;
    }
    else {
      this.selectedUserName = '';
      param = '/subscription';
    }
    this.loading = true;
    this.itrService.getMethod(param).subscribe((response: any) => {
      console.log(response);
      this.allSubscriptions = response;
      this.loading = false;
      if (!this.utilsService.isNonEmpty(userId)) {
        if (response.length > 0) {
          this.subscriptionListGridOptions.api.setRowData(this.createRowData(response));
        } else {
          this._toastMessageService.alert("error", "Data not found.");
        }
      } else {
        if (response instanceof Array && response.length > 0) {
          this.subscriptionListGridOptions.api.setRowData(this.createRowData(response));
        } else {
          this.subscriptionListGridOptions.api.setRowData(this.createRowData([]));
          this.utilsService.showSnackBar('There is no records of subscription against this user.')
        }
      }
    },
      error => {
        this.loading = false;
        console.log('error during getting subscription info: ', error)
      })
  }

  createRowData(subscriptionData) {
    const newData = [];
    for (let i = 0; i < subscriptionData.length; i++) {
      newData.push({
        subscriptionId: subscriptionData[i].subscriptionId,
        userId: subscriptionData[i].userId,
        userSelected: this.utilsService.isNonEmpty(subscriptionData[i].userSelectedPlan) ? subscriptionData[i].userSelectedPlan.name : 'NA',
        smeSelected: this.utilsService.isNonEmpty(subscriptionData[i].smeSelectedPlan) ? subscriptionData[i].smeSelectedPlan.name : 'NA',
        planAgreedByUserOn: subscriptionData[i].planAgreedByUserOn,
        servicesType: this.utilsService.isNonEmpty(subscriptionData[i].userSelectedPlan) ? subscriptionData[i].userSelectedPlan.servicesType : (this.utilsService.isNonEmpty(subscriptionData[i].smeSelectedPlan) ? subscriptionData[i].smeSelectedPlan.servicesType : '-'),
        startDate: subscriptionData[i].startDate,
        endDate: subscriptionData[i].endDate,
        txbdyInvoiceId: subscriptionData[i].txbdyInvoiceId,
        subscriptionAssigneeId: subscriptionData[i].subscriptionAssigneeId !== 0 ? subscriptionData[i].subscriptionAssigneeId : 'NA',
        isActive: subscriptionData[i].isActive,
        served: subscriptionData[i].served,
        promoCode: this.utilsService.isNonEmpty(subscriptionData[i].promoCode) ? subscriptionData[i].promoCode : '-',
        invoiceAmount: this.utilsService.isNonEmpty(subscriptionData[i].promoApplied) ? subscriptionData[i].promoApplied.totalAmount : (this.utilsService.isNonEmpty(subscriptionData[i].smeSelectedPlan) ? subscriptionData[i].smeSelectedPlan.totalAmount : (this.utilsService.isNonEmpty(subscriptionData[i].userSelectedPlan) ? subscriptionData[i].userSelectedPlan.totalAmount : '0')),
      });
    }
    return newData;
  }

  public onSubscriptionRowClicked(params) {
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'generateInvoice': {
          if (params.data.isActive) {
            this.router.navigate(['/pages/subscription/add-invoice'], { queryParams: { subscriptionId: params.data.subscriptionId } });
          } else {
            this.utilsService.showSnackBar('Please activate the subscription first.')
          }
          break;
        }
        case 'subscription': {
          this.addNewPlan(params.data);
          break;
        }
        case 'served': {
          this.updateSubscription(params.data);
          break;
        }
        case 'delete-invoice': {
          this.deleteInvoice(params.data);
          break;
        }
      }
    }
  }

  addNewPlan(plan) {
    if (this.utilsService.isNonZero(plan.txbdyInvoiceId)) {
      this.utilsService.showSnackBar('This subscriptions invoice is created.');
      return;
    }
    console.log('Plan -> ', plan);
    this.router.navigate(['/pages/subscription/sub/' + plan.subscriptionId]);
  }

  addSubscriptionPlan() {
    let disposable = this.dialog.open(AddSubscriptionComponent, {
      width: '65%',
      height: 'auto',
      data: {
        userId: this.userId
      }
    })

    disposable.afterClosed().subscribe(result => {
      if (result && result.data) {
        console.log('Afetr dialog close -> ', result);
        this.router.navigate(['/pages/subscription/sub/' + result.data['subscriptionId']]);
      }
    })
  }

  updateSubscription(value) {
    console.log('Subscription;', value);
    this.loading = true;
    let temp = this.allSubscriptions.filter(item => item.subscriptionId === value.subscriptionId)
    let request;
    if (temp instanceof Array && temp.length > 0) {
      request = temp[0];
      request.served = !value.served;
    } else {
      return;
    }
    console.log('Updated Request for served', request);
    const param = "/subscription";
    this.itrService.putMethod(param, request).subscribe((response: any) => {
      console.log('Subscription Updated Successfully:', response);
      this.utilsService.showSnackBar('Subscription updated successfully!');
      this.getUserSubscriptionInfo();
      this.loading = false;
    }, error => {
      this.getUserSubscriptionInfo();
      this.utilsService.showSnackBar('Failed to update subscription!');
      this.loading = false;
      console.log('Subscription Updated error=>:', error);
    })
  }

  deleteInvoice(invoiceInfo) {
    console.log('invoiceInfo: ', invoiceInfo);
    this.loading = true;
    let param = `/invoice/delete?txbdyInvoiceId=${invoiceInfo.txbdyInvoiceId}`;
    this.itrService.deleteMethod(param).subscribe((responce: any) => {
      this.loading = false;
      console.log('responce: ', responce);
      this._toastMessageService.alert("success", responce.reponse);
      if (responce.reponse !== 'You cannot delete invoice with Paid status')
        this.getUserSubscriptionInfo();
    }, error => {
      this.loading = false;
      this._toastMessageService.alert("error", "Faild to delete invoice.");
    })
  }
}
