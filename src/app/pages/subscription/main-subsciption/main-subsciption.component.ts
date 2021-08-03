import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { ItrMsService } from 'app/services/itr-ms.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
import moment = require('moment');
import { FilingCalendarComponent } from '../filing-calendar/filing-calendar.component';
import { InvoiceDialogComponent } from '../invoice-dialog/invoice-dialog.component';

@Component({
  selector: 'app-main-subsciption',
  templateUrl: './main-subsciption.component.html',
  styleUrls: ['./main-subsciption.component.css']
})
export class MainSubsciptionComponent implements OnInit, OnDestroy, OnChanges {
  @Input('queryParam') queryParam: any;
  @Input('from') from: any;
  loading: boolean;
  subscriptionListGridOptions: GridOptions;
  subscription: any;
  userId: any;
  userInfo: any = [];
  config: any;

  constructor(private itrService: ItrMsService, private utilsService: UtilsService, private _toastMessageService: ToastMessageService, private router: Router,
    private userMsService: UserMsService, private dialog: MatDialog) {
    this.config = {
      itemsPerPage: 20,
      currentPage: 1,
      totalItems: null
    };
    this.subscription = this.utilsService.onMessage().subscribe(res => {
      console.log('Agent id :--> ', res)
      this.queryParam = res.text;
      this.getUserSubscriptionInfo(0);
    });
  }

  ngOnInit() {
    this.subscriptionListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.subscriptionColoumnDef(this.from),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      sortable: true,
    };
    // this.getUserSubscriptionInfo();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  ngOnChanges() {
    this.getUserSubscriptionInfo(0);

  }
  subscriptionColoumnDef(from) {
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
        headerName: 'User Name',
        field: 'userName',
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
              return `<i class="fa fa-circle" style="color: green; font-size: 8px;" title="User Accepted changed amount" aria-hidden="true"></i> ` + params.data.smeSelected;
            }
            return ` <i class="fa fa-circle" style="color: red; font-size: 8px;" title="User has not accepted plan change request yet." aria-hidden="true"></i> ` + params.data.smeSelected;
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
      // {
      //   headerName: 'Invoice Details',
      //   field: 'invoiceDetails',
      //   width: 100,
      //   suppressMovable: true,
      //   cellStyle: { textAlign: 'center' },
      //   filter: "agTextColumnFilter",
      //   filterParams: {
      //     filterOptions: ["contains", "notContains"],
      //     debounceMs: 0
      //   },
      //   cellRenderer: function (params) {
      //     console.log('paramsparams: ', params)
      //     if (params.value === 'All Paid') {
      //       return `
      //         <p style="color:green">${params.value}</p>
      //        `
      //     } else {
      //       return `<p style="color:red">${params.value} <button type="button" class="action_icon add_button" title="View Unpaid invoices"
      //     style="border: none;
      //       background: transparent; font-size: 14px; cursor:pointer">
      //       <i class="fa fa-eye" aria-hidden="true" data-action-type="view-invoice"></i>
      //      </button> </p>`;
      //     }
      //   },
      // },

      {
        headerName: 'Filer Name',
        field: 'filerName',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        hide: from === 'MY_SUB' ? true : false
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
      },
      {
        headerName: 'File',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Start Filing" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-files-o" aria-hidden="true" data-action-type="start-filing"></i>
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
        headerName: 'Calendar',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="View Filing Calendar" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-calendar" aria-hidden="true" data-action-type="view-filing-calendar"></i>
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
    ]
  }

  allSubscriptions = [];
  getUserSubscriptionInfo(pageNo) {
    console.log('this.queryParam:', this.queryParam);
    // alert(this.queryParam)
    let pagination = `?page=${pageNo}&pageSize=20`;
    if (this.utilsService.isNonEmpty(this.queryParam)) {
      pagination = `&page=${pageNo}&pageSize=20`;
    }
    var param = `/subscription${this.queryParam}${pagination}`;
    this.loading = true;
    this.itrService.getMethod(param).subscribe((response: any) => {
      console.log('SUBSCRIPTION RESPONSE:', response);
      this.allSubscriptions = response;
      this.loading = false;
      if (response.content instanceof Array && response.content.length > 0) {
        this.subscriptionListGridOptions.api.setRowData(this.createRowData(response.content));
        this.config.totalItems = response.totalElements;
      } else {
        this.subscriptionListGridOptions.api.setRowData(this.createRowData([]));
        this.config.totalItems = 0;
        let msg = 'There is no records of subscription against this user';
        if (this.from === 'MY_SUB') {
          msg = 'You dont have any assigned subscriptions';
        }
        this.utilsService.showSnackBar(msg)
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
      // let invoiceDetails = 'All Paid'
      // if (subscriptionData[i].invoiceData instanceof Array && subscriptionData[i].invoiceData.length > 0) {
      //   let count = 0;
      //   for (let j = 0; j < subscriptionData[i].invoiceData.length; j++) {
      //     if (subscriptionData[i].invoiceData[j].paymentStatus.toString().toUpperCase() !== 'PAID') {
      //       count = count + 1;
      //     }
      //   }
      //   if (count > 0)
      //     invoiceDetails = count + ' Unpaid';
      // }
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
        filerName: subscriptionData[i].subscriptionAssigneeId !== 0 ? (subscriptionData[i].smeDetails.length > 0 ? subscriptionData[i].smeDetails[0]['first_name'] : 'NA') : 'NA',
        userName: subscriptionData[i].userId !== 0 ? (subscriptionData[i].userData.length > 0 ? subscriptionData[i].userData[0]['first_name'] + ' ' + subscriptionData[i].userData[0]['last_name'] : '') : 'NA',
        isActive: subscriptionData[i].isActive,
        served: subscriptionData[i].served,
        promoCode: this.utilsService.isNonEmpty(subscriptionData[i].promoCode) ? subscriptionData[i].promoCode : '-',
        invoiceAmount: this.utilsService.isNonEmpty(subscriptionData[i].promoApplied) ? subscriptionData[i].promoApplied.totalAmount : (this.utilsService.isNonEmpty(subscriptionData[i].smeSelectedPlan) ? subscriptionData[i].smeSelectedPlan.totalAmount : (this.utilsService.isNonEmpty(subscriptionData[i].userSelectedPlan) ? subscriptionData[i].userSelectedPlan.totalAmount : '0')),
        // invoiceDetails: invoiceDetails,
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
          // if (params.data.isActive) {
          this.router.navigate(['/pages/subscription/add-invoice'], { queryParams: { subscriptionId: params.data.subscriptionId } });
          // } else {
          //   this.utilsService.showSnackBar('Please activate the subscription first.')
          // }
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
          // this.deleteInvoice(params.data);
          this.updateInvoice('Reason For Invoice Deletion', 'Delete', params.data, 'DELETE');
          break;
        }
        case 'start-filing': {
          this.startFiling(params.data);
          break;
        }
        case 'view-filing-calendar': {
          this.viewFilingCalendar(params.data);
          break;
        }
        case 'view-invoice': {
          this.router.navigate(['/pages/subscription/invoices'], { queryParams: { userId: params.data.userId } });
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
    this.router.navigate(['/pages/subscription/sub/' + plan.subscriptionId]);
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
      this.getUserSubscriptionInfo(this.config.currentPage - 1); // TODO we may need current page
      this.loading = false;
    }, error => {
      this.getUserSubscriptionInfo(this.config.currentPage - 1);
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
        this.getUserSubscriptionInfo(this.config.currentPage - 1);
    }, error => {
      this.loading = false;
      this._toastMessageService.alert("error", "Faild to delete invoice.");
    })
  }

  async getUserProfile(userId) {
    const param = `/profile/${userId}`;
    return await this.userMsService.getMethod(param).toPromise();
  }

  async startFiling(subscription) {
    console.log('subscription: ', subscription);
    if (subscription.servicesType === 'ITR') {
      this.loading = true;
      let profile = await this.getUserProfile(subscription.userId).catch(error => {
        this.loading = false;
        console.log(error);
        this.utilsService.showSnackBar(error.error.detail);
        return;
      });
      this.loading = false;
      this.utilsService.getITRByUserIdAndAssesmentYear(profile, '', subscription.subscriptionAssigneeId);
    } else if (subscription.servicesType === 'GST') {
      this.router.navigate(['/pages/gst-filing/cloud'], { queryParams: { userId: subscription.userId } })
    } else {
      this.utilsService.showSnackBar('Filing Path Yet to decide');
    }
  }

  async viewFilingCalendar(subscription) {
    console.log('subscription: ', subscription);
    this.loading = true;
    const param = `/subscription/filings-calender?subscriptionId=${subscription.subscriptionId}`;
    this.itrService.getMethod(param).subscribe((res: any) => {
      this.loading = false;
      console.log('Subscription Filings Calender: ', res);
      if (res['filingCalendar'] instanceof Array) {
        let disposable = this.dialog.open(FilingCalendarComponent, {
          width: '80%',
          height: 'auto',
          data: {
            startMonth: null,
            startYear: null,
            serviceType: res.serviceType,
            gstType: '',
            frequency: '',
            noOfMonths: null,
            userId: res.userId,
            subscriptionId: res.subscriptionId,
            smeAssigneeId: null,
            filingCalendar: res['filingCalendar'],
            mode: 'UPDATE'
          }
        })

        disposable.afterClosed().subscribe(res => {
          console.log('The dialog was closed');
          if (res && this.utilsService.isNonEmpty(res) && res.result === 'SUCCESS') {
            console.log(res.data);
            this.utilsService.showSnackBar('Filing Calendar updated successfully.')
          }
        });
      }
    }, error => {
      this.loading = false;
      console.log('Subscription Filings Calender Error: ', error);
      this.utilsService.showSnackBar('Calendar is not created.')
    })
  }

  updateInvoice(windowTitle: string, windowBtn: string, data: any, mode: string) {
    let disposable = this.dialog.open(InvoiceDialogComponent, {
      width: '60%',
      height: 'auto',
      data: {
        title: windowTitle,
        submitBtn: windowBtn,
        txbdyInvoiceId: data.txbdyInvoiceId,
        mode: mode,
        callerObj: this
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result && this.utilsService.isNonEmpty(result) && result.msg === 'success') {
        this.getUserSubscriptionInfo(this.config.currentPage - 1);
      }
    });
  }

  pageChanged(event) {
    this.config.currentPage = event;
    this.getUserSubscriptionInfo(event - 1);
  }
}
