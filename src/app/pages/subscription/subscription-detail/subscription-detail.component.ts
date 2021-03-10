import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { ItrMsService } from 'app/services/itr-ms.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { AppConstants } from 'app/shared/constants';
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

  constructor(private _toastMessageService: ToastMessageService, public utilService: UtilsService, private itrService: ItrMsService, @Inject(LOCALE_ID) private locale: string,
    private userService: UserMsService, private utileService: UtilsService, private router: Router, private dialog: MatDialog) {
    this.subscriptionListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.subscriptionColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
        // params.api.sizeColumnsToFit();
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
        }

      },
      // {
      //   headerName: 'Total Tax',
      //   field: 'totalTax',
      //   width: 120,
      //   suppressMovable: true,
      //   cellStyle: { textAlign: 'center' },
      //   filter: "agTextColumnFilter",
      //   filterParams: {
      //     filterOptions: ["contains", "notContains"],
      //     debounceMs: 0
      //   }
      // },
      // {
      //   headerName: 'Total Amount',
      //   field: 'totalAmount',
      //   width: 120,
      //   suppressMovable: true,
      //   cellStyle: { textAlign: 'center' },
      //   filter: "agTextColumnFilter",
      //   filterParams: {
      //     filterOptions: ["contains", "notContains"],
      //     debounceMs: 0
      //   }
      // },
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
      /* {
        headerName: 'Valid for Days',
        field: 'validFordays',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      }, */
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
        cellStyle: { textAlign: 'center' },
        valueFormatter: (data) => data.value ? moment(data.value).format('DD MMM YYYY') : null,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
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
        headerName: 'Add Plan',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Add Subscription plan">
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
          return `<button type="button" class="action_icon add_button" title="Generate Invoice">
            <i class="fa fa-files-o" aria-hidden="true" data-action-type="invoice"></i>
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
        headerName: "Served",
        field: "served",
        width: 50,
        pinned: 'right',
        // visible: this.listFor === "INTERESTED" ? true : false,
        cellRenderer: params => {
          return `<input type='checkbox' data-action-type="served" ${params.data.served === true ? 'checked' : ''} />`;
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
    if (this.utilService.isNonEmpty(this.searchVal)) {
      // var patt = new RegExp(this.searchVal)
      if (this.searchVal.toString().length === 10) {
        this.getUserIdByMobileNum(this.searchVal)
      } else {
        this._toastMessageService.alert("error", "Enter valid mobile number.");
      }
    }
    else {
      this.getUserSubscriptionInfo();
      // this._toastMessageService.alert("error", "Enter mobile number.");
      this.utilService.showSnackBar('You are fetching all records.')
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
        this._toastMessageService.alert("error", this.utileService.showErrorMsg(error.error.status));
      })
  }

  allSubscriptions = [];
  getUserSubscriptionInfo(userId?) {
    var param = '';   //;
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
      // console.log('subscription responce: ', responce, ' type of: ', typeof responce);
      // console.log('Object type: ', Object.keys(responce), ' length: ', Object.keys(responce).length);
      if (!this.utilService.isNonEmpty(userId)) {
        if (response.length > 0) {     //if (response.content.length > 0)     
          // this.subscriptionListGridOptions.api.setRowData(this.createRowData(response.content));
          this.subscriptionListGridOptions.api.setRowData(this.createRowData(response));
        }
        else {
          this._toastMessageService.alert("error", "Data not found.");
        }
      } else {
        if (response instanceof Array && response.length > 0) {
          this.subscriptionListGridOptions.api.setRowData(this.createRowData(response));
        } else {
          this.subscriptionListGridOptions.api.setRowData(this.createRowData([]));
          this.utilService.showSnackBar('There is no records of subscription against this user.')
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
        userSelected: this.utilService.isNonEmpty(subscriptionData[i].userSelectedPlan) ? subscriptionData[i].userSelectedPlan.name : 'NA',
        smeSelected: this.utilService.isNonEmpty(subscriptionData[i].smeSelectedPlan) ? subscriptionData[i].smeSelectedPlan.name : 'NA',
        servicesType: this.utilService.isNonEmpty(subscriptionData[i].userSelectedPlan) ? subscriptionData[i].userSelectedPlan.servicesType : (this.utilService.isNonEmpty(subscriptionData[i].smeSelectedPlan) ? subscriptionData[i].smeSelectedPlan.servicesType : 'NA'),
        startDate: subscriptionData[i].startDate,
        endDate: subscriptionData[i].endDate,
        txbdyInvoiceId: subscriptionData[i].txbdyInvoiceId,
        isActive: subscriptionData[i].isActive,
        served: subscriptionData[i].served,
        promoCode: this.utilService.isNonEmpty(subscriptionData[i].promoCode) ? subscriptionData[i].promoCode : 'NA',
      });
    }
    return newData;

    /*  console.log('subscriptionData -> ', subscriptionData);
     var subscriptionInfo = [];
     if (userId) {
       for (let i = 0; i < subscriptionData.length; i++) {
         console.log('subscriptionData[' + i + '] -> ', subscriptionData[i]);
         let updatedData = Object.assign({}, subscriptionInfo[i], { userId: subscriptionData[i].userId, planSelectedBy: subscriptionData[i].planDetails[0].selectionDetails.selectedBy, planName: subscriptionData[i].planDetails[0].plan.name, shortDescription: subscriptionData[i].planDetails[0].plan.shortDescription, basePrice: subscriptionData[i].planDetails[0].plan.basePrice, cgst: subscriptionData[i].planDetails[0].plan.cgst, sgst: subscriptionData[i].planDetails[0].plan.sgst, totalTax: subscriptionData[i].planDetails[0].plan.totalTax, igst: subscriptionData[i].planDetails[0].plan.igst, totalAmount: subscriptionData[i].planDetails[0].plan.totalAmount, serviceType: subscriptionData[i].planDetails[0].plan.servicesType, validFordays: subscriptionData[i].planDetails[0].plan.validForDays, startDate: subscriptionData[i].startDate, endDateDate: subscriptionData[i].endDate, taxByInvoiceId: subscriptionData[i].txbdyInvoiceId, isActive: subscriptionData[i].isActive, subscriptionId: subscriptionData[i].subscriptionId });
         subscriptionInfo.push(updatedData)
       }
       return subscriptionInfo;
     }
     else {
       for (let i = 0; i < subscriptionData.content.length; i++) {
         console.log('subscriptionData[' + i + '] -> ', subscriptionData.content[i]);
         let updatedData = Object.assign({}, subscriptionInfo[i], { userId: subscriptionData.content[i].userId, planSelectedBy: subscriptionData.content[i].planDetails[0].selectionDetails.selectedBy, planName: subscriptionData.content[i].planDetails[0].plan.name, shortDescription: subscriptionData.content[i].planDetails[0].plan.shortDescription, basePrice: subscriptionData.content[i].planDetails[0].plan.basePrice, cgst: subscriptionData.content[i].planDetails[0].plan.cgst, sgst: subscriptionData.content[i].planDetails[0].plan.sgst, totalTax: subscriptionData.content[i].planDetails[0].plan.totalTax, igst: subscriptionData.content[i].planDetails[0].plan.igst, totalAmount: subscriptionData.content[i].planDetails[0].plan.totalAmount, serviceType: subscriptionData.content[i].planDetails[0].plan.servicesType, validFordays: subscriptionData.content[i].planDetails[0].plan.validForDays, startDate: subscriptionData.content[i].startDate, endDateDate: subscriptionData.content[i].endDate, taxByInvoiceId: subscriptionData.content[i].txbdyInvoiceId, isActive: subscriptionData.content[i].isActive, subscriptionId: subscriptionData.content[i].subscriptionId });
         subscriptionInfo.push(updatedData)
       }
       return subscriptionInfo;
     } */
  }

  public onSubscriptionRowClicked(params) {
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'invoice': {
          this.generateIncoice(params.data);
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
      }
    }
  }

  generateIncoice(data) {
    // this.router.navigate(['/pages/invoice/generate'], {queryParams :{ userId: data.userId}});
    this.router.navigate(['/pages/subscription/add-invoice'], { queryParams: { subscriptionId: data.subscriptionId } });
  }

  addNewPlan(plan) {
    if (this.utilService.isNonEmpty(plan.txbdyInvoiceId)) {
      this.utilService.showSnackBar('This subscriptions invoice is created.');
      return;
    }
    console.log('Plan -> ', plan);
    this.router.navigate(['/pages/subscription/sub/' + plan.subscriptionId])   //'/pages/subscription/'+212'
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
      this.utilService.showSnackBar('Subscription updated successfully!');
      this.loading = false;
    }, error => {
      this.getUserSubscriptionInfo();
      this.utilService.showSnackBar('Failed to update subscription!');
      this.loading = false;
      console.log('Subscription Updated error=>:', error);
    })
  }
}
