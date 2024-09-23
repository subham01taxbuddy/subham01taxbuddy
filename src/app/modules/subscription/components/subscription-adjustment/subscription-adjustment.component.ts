import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import * as moment from 'moment';
import { ConfirmDialogComponent } from 'src/app/modules/shared/components/confirm-dialog/confirm-dialog.component';
import { ServiceDropDownComponent } from 'src/app/modules/shared/components/service-drop-down/service-drop-down.component';
import { SmeListDropDownComponent } from 'src/app/modules/shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { CacheManager } from 'src/app/modules/shared/interfaces/cache-manager.interface';
import { ReportService } from 'src/app/services/report-service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-subscription-adjustment',
  templateUrl: './subscription-adjustment.component.html',
  styleUrls: ['./subscription-adjustment.component.scss'],
})
export class SubscriptionAdjustmentComponent implements OnInit {
  loading!: boolean;
  dataOnLoad = false;
  searchAsPrinciple: boolean = false;
  ogStatusList: any = [];
  itrStatus: any = [];
  financialYear = [
    {
      assessmentYear : "2024-2025",
      financialYear : "2023-2024"
    },
    {
      assessmentYear : "2023-2024",
      financialYear : "2022-2023"
    }];
  assessmentYear = new UntypedFormControl(this.financialYear[0]);
  clearUserFilter: number;
  roles: any;
  allSubAdjustData: any;
  allFilerList: any;
  userInfo: any = [];
  config = {
    itemsPerPage: 20,
    currentPage: 1,
    totalItems: null,
  };

  searchBy: any = {};
  sortBy: any = {};
  searchParam: any = {
    statusId: null,
    page: 0,
    pageSize: 20,
    serviceType: null,
    assessmentYear: null
  };
  searchMenus = [
    { value: 'name', name: 'User Name' },
    { value: 'email', name: 'Email' },
    { value: 'mobileNumber', name: 'Mobile No' },
  ];
  sortMenus = [
    { value: 'userName', name: 'Name' },
    { value: 'userSelectedPlan.name', name: 'User Selected Plan' },
    { value: 'invoiceDetail.invoiceNo', name: 'Invoice Number' },
    { value: 'promoCode', name: 'Promo code' },
    { value: 'createdDate', name: 'Created Date' },
  ];
  adjustmentListGridOptions: GridOptions;

  constructor(
    private utilsService: UtilsService,
    private dialog: MatDialog,
    private cacheManager: CacheManager,
    private reportService: ReportService,
    private _toastMessageService: ToastMessageService,
    private userMsService: UserMsService,
    @Inject(LOCALE_ID) private locale: string
  ) {
    this.allFilerList = JSON.parse(sessionStorage.getItem('ALL_FILERS_LIST'));
    this.adjustmentListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.adjustmentCreateColumnDef(this.allFilerList),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => {},

      sortable: true,
    };

  }

  ngOnInit() {
    this.roles = this.utilsService.getUserRoles();
  }

  filerId: number;
  agentId: number;
  leaderId: number;
  fromSme(event, isOwner, fromPrinciple?) {
    console.log('sme-drop-down', event, isOwner);
    if (isOwner) {
      this.leaderId = event ? event.userId : null;
    } else {
      if (fromPrinciple) {
        if (event?.partnerType === 'PRINCIPAL') {
          this.filerId = event ? event.userId : null;
          this.searchAsPrinciple = true;
        } else {
          this.filerId = event ? event.userId : null;
          this.searchAsPrinciple = false;
        }
      } else {
        if (event) {
          this.filerId = event ? event.userId : null;
          this.searchAsPrinciple = false;
        }
      }
    }
    if (this.filerId) {
      this.agentId = this.filerId;
    } else if (this.leaderId) {
      this.agentId = this.leaderId;
    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }
  }

  sortByObject(object) {
    this.sortBy = object;
  }
  searchByObject(object) {
    this.searchBy = object;
  }

  fromServiceType(event) {
    this.searchParam.serviceType = event;

    if (this.searchParam.serviceType) {
      setTimeout(() => {
        this.itrStatus = this.ogStatusList.filter((item) =>
          item.applicableServices.includes(this.searchParam.serviceType)
        );
      }, 100);
    }
  }

  async getMasterStatusList() {
    this.ogStatusList = await this.utilsService.getStoredMasterStatusList();
  }

  search=(fromPageChange?):Promise<any> => {
    //'https://uat-api.taxbuddy.com/report/bo/subscription-adjustment?page=0&pageSize=20' \
    if (!fromPageChange) {
      this.cacheManager.clearCache();
      console.log('in clear cache');
    }
    const loggedInSmeUserId = this.utilsService.getLoggedInUserID();
    if (this.roles.includes('ROLE_LEADER')) {
      this.leaderId = loggedInSmeUserId;
    }

    let userFilter = '';
    if (this.leaderId && !this.filerId) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }
    if (this.filerId && this.searchAsPrinciple === true) {
      userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
    }
    if (this.filerId && this.searchAsPrinciple === false) {
      userFilter += `&filerUserId=${this.filerId}`;
    }

    this.searchParam.assessmentYear = this.assessmentYear.value.assessmentYear;
    let data = this.utilsService.createUrlParams(this.searchParam);

    let param = `/bo/subscription-adjustment?${data}${userFilter}`;
    let sortByJson = '&sortBy=' + encodeURI(JSON.stringify(this.sortBy));
    if (Object.keys(this.sortBy).length) {
      param = param + sortByJson;
    }
    if (Object.keys(this.searchBy).length) {
      Object.keys(this.searchBy).forEach((key) => {
        param = param + '&' + key + '=' + this.searchBy[key];
      });
    }
    this.loading = true;
    return this.reportService.getMethod(param).toPromise().then(
      (response: any) => {
        console.log('SUBSCRIPTION Abutment RESPONSE:', response);
        this.allSubAdjustData = response;
        this.loading = false;
        if (
          response?.data?.content instanceof Array &&
          response?.data?.content?.length > 0
        ) {
          this.adjustmentListGridOptions.api?.setRowData(
            this.createRowData(response.data.content)
          );
          this.config.totalItems = response.data.totalElements;
          this.cacheManager.initializeCache(response.data.content);

          const currentPageNumber = response?.data?.number + 1;
          this.cacheManager.cachePageContent(
            currentPageNumber,
            response.data.content
          );
          this.config.currentPage = currentPageNumber;
        } else {
          this._toastMessageService.alert('error', (response.message || 'data not found'));
          this.adjustmentListGridOptions.api?.setRowData(
            this.createRowData([])
          );
          this.config.totalItems = 0;
        }
      },
      (error) => {
        this.loading = false;
        console.log('error during getting subscription info: ', error);
      }
    );
  }

  createRowData(subscriptionData) {
    console.log('SUBSCRIPTIONDATA:', subscriptionData);

    const newData = [];
    for (let i = 0; i < subscriptionData.length; i++) {
      const invoiceNumber = [];
      const paymentStatuses = [];
      for (let x = 0; x < subscriptionData[i].invoiceDetail?.length; x++) {
        invoiceNumber.push(subscriptionData[i].invoiceDetail[x].invoiceNo);
        paymentStatuses.push(
          subscriptionData[i].invoiceDetail[x].paymentStatus
        );
      }
      newData.push({
        subscriptionId: subscriptionData[i].subscriptionId,
        userId: subscriptionData[i].userId,
        userSelected: this.utilsService.isNonEmpty(
          subscriptionData[i].userSelectedPlan
        )
          ? subscriptionData[i].userSelectedPlan.name
          : 'NA',
        smeSelected: this.utilsService.isNonEmpty(
          subscriptionData[i].smeSelectedPlan
        )
          ? subscriptionData[i].smeSelectedPlan.name
          : 'NA',
        planAgreedByUserOn: subscriptionData[i].planAgreedByUserOn,
        servicesType: this.utilsService.isNonEmpty(
          subscriptionData[i].userSelectedPlan
        )
          ? subscriptionData[i].userSelectedPlan.servicesType
          : this.utilsService.isNonEmpty(subscriptionData[i].smeSelectedPlan)
          ? subscriptionData[i].smeSelectedPlan.servicesType
          : '-',
        startDate: subscriptionData[i].startDate,
        endDate: subscriptionData[i].endDate,
        invoiceNo: invoiceNumber.toString(),
        subscriptionAssigneeId:
          subscriptionData[i].subscriptionAssigneeId !== 0
            ? subscriptionData[i].subscriptionAssigneeId
            : 'NA',
        assigneeName:
          subscriptionData[i].subscriptionAssigneeId !== 0
            ? subscriptionData[i].assigneeName
            : 'NA',
        userName: subscriptionData[i].userName,
        isActive: subscriptionData[i].isActive,
        served: subscriptionData[i].served,
        promoCode: this.utilsService.isNonEmpty(subscriptionData[i].promoCode)
          ? subscriptionData[i].promoCode
          : '-',
        invoiceAmount: subscriptionData[i].promoApplied
          ? this.utilsService.isNonEmpty(subscriptionData[i].smeSelectedPlan)
            ? subscriptionData[i].smeSelectedPlan.totalAmount -
              subscriptionData[i].promoApplied.discountedAmount
            : this.utilsService.isNonEmpty(subscriptionData[i].userSelectedPlan)
            ? subscriptionData[i].userSelectedPlan.totalAmount -
              subscriptionData[i].promoApplied.discountedAmount
            : '-'
          : this.utilsService.isNonEmpty(subscriptionData[i].smeSelectedPlan)
          ? subscriptionData[i].smeSelectedPlan.totalAmount
          : this.utilsService.isNonEmpty(subscriptionData[i].userSelectedPlan)
          ? subscriptionData[i].userSelectedPlan.totalAmount
          : '-',
        subscriptionCreatedBy: subscriptionData[i].subscriptionCreatedBy,
        cancellationStatus: subscriptionData[i].cancellationStatus,
        leaderName: subscriptionData[i].leaderName,
        createdDate: subscriptionData[i].createdDate,
        paymentStatus: paymentStatuses.toString(),
        couponCodeClaimedServiceType:subscriptionData[i].couponCodeClaimedServiceType,
        isCouponCodeAvailable:subscriptionData[i].isCouponCodeAvailable,
        couponCodeCreatedDate:subscriptionData[i].couponCodeCreatedDate,
      });
    }
    return newData;
  }

  adjustmentCreateColumnDef(List) {
    return [
      {
        headerName: 'User Id',
        field: 'userId',
        width: 100,
        cellStyle: { textAlign: 'center' },
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
        // hide: from === 'MY_SUB' ? false : true
      },
      {
        headerName: 'User Selected',
        field: 'userSelected',
        width: 220,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'SME Selected',
        field: 'smeSelected',
        width: 140,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        cellRenderer: function (params: any) {
          if (params.data.smeSelected !== 'NA') {
            if (
              params.data.planAgreedByUserOn !== null &&
              params.data.planAgreedByUserOn !== ''
            ) {
              return (
                `<i class="fa fa-circle" style="color: green; font-size: 8px;" title="User Accepted changed amount" aria-hidden="true"></i> ` +
                params.data.smeSelected
              );
            }
            return (
              ` <i class="fa fa-circle" style="color: red; font-size: 8px;" title="User has not accepted plan change request yet." aria-hidden="true"></i> ` +
              params.data.smeSelected
            );
          }
          return params.data.smeSelected;
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
        headerName: 'Coupon Created Date',
        field: 'couponCodeCreatedDate',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data: any) => {
          if (data.value) {
            return formatDate(data.value, 'dd/MM/yyyy', this.locale);
          } else {
            return '-';
          }
        },

      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data: any) => {
          if (data.value) {
            return formatDate(data.value, 'dd/MM/yyyy', this.locale);
          } else {
            return '-';
          }
        },

      },
      {
        headerName: 'Promo Code',
        field: 'promoCode',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Subscription Amount',
        field: 'invoiceAmount',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Invoice No',
        field: 'invoiceNo',
        width: 140,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Leader Name',
        field: 'leaderName',
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
        headerName: 'Whether claimed',
        field: 'couponCodeClaimedServiceType',
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
        headerName: 'Revert Coupon',
        field: '',
        width: 120,
         pinned: 'right',
        lockPosition: true,
        suppressMovable: false,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        cellRenderer: function (params: any) {
          if(params.data.isCouponCodeAvailable){
            return `<button type="button" class="action_icon add_button" title="Click to revert Subscription Adjustment Coupon" data-action-type="revert-Coupon"
            style="border: none; background: transparent; font-size: 14px; cursor:pointer; color:#04a4bc; ">
            <i class="fa fa-undo fa-xs" aria-hidden="true" data-action-type="revert-Coupon"> Restore </i>
             </button>`;
          }else{
            return'-';
          }
        },
      },
    ];
  }

  showCsvMessage: boolean;
  async downloadReport() {

  }

  onSubscriptionRowClicked(params: any) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'revert-Coupon': {
          this.revertCoupon(params.data);
          break;
        }
      }
    }
  }
  dialogRef: any;
  revertCoupon(data){
    this.utilsService.getUserCurrentStatus(data.userId).subscribe((res: any) => {
      console.log(res);
      if (res.error) {
        this.utilsService.showSnackBar(res.error);
        this.search(this.config.currentPage);
        this.loading =false;
        return;
      } else {
        this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
          data: {
            title: 'Revert Coupon Code!',
            message: 'Are you sure?',
          },
        });

        this.dialogRef.afterClosed().subscribe(result => {
          if (result === 'YES') {
            this.loading = true;
            let param = `/itr/subscription`;
            let reqBody = {
              "subscriptionId": data.subscriptionId,
              "isCouponCode": false
            };
            this.userMsService.spamPutMethod(param, reqBody).subscribe(
              (res: any) => {
                this.loading = false;
                this._toastMessageService.alert('success', 'adjustment changes updated successfully');
                this.search(this.config.currentPage);
              },
              (error) => {
                this.loading = false;
                if (error.error.error === 'BAD_REQUEST') {
                  this._toastMessageService.alert('error', error.error.message);
                } else {
                  this._toastMessageService.alert('error', 'failed to update.');
                }
                this.search(this.config.currentPage);
              }
            );
          }
        })
      }
    },(error) => {
      this.loading=false;
      if (error.error && error.error.error) {
        this.utilsService.showSnackBar(error.error.error);
        this.search(this.config.currentPage);
      } else {
        this.utilsService.showSnackBar("An unexpected error occurred.");
      }
    });
  }


  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.adjustmentListGridOptions.api?.setRowData(
        this.createRowData(pageContent)
      );
      this.config.currentPage = event;
      this.searchParam.page = event - 1;
    } else {
      this.searchParam.page = event - 1;
      this.config.currentPage = event;
      this.search('fromPageChange');
    }
  }

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  @ViewChild('serviceDropDown') serviceDropDown: ServiceDropDownComponent;
  resetFilters() {
    this.cacheManager.clearCache();
    this.clearUserFilter = moment.now().valueOf();
    this.searchParam.statusId = null;
    this.searchParam.serviceType = null;
    this.searchParam.page = 0;
    this.searchParam.pageSize = 20;
    this.config.totalItems = 0;
    this?.smeDropDown?.resetDropdown();
    this?.serviceDropDown?.resetService();
    this.adjustmentListGridOptions.api?.setRowData(this.createRowData([]));
  }
}
