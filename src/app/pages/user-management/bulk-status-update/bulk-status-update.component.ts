import { DatePipe } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import {  MatDialogRef } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import * as moment from 'moment';
import { lastValueFrom } from 'rxjs';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

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

@Component({
  selector: 'app-bulk-status-update',
  templateUrl: './bulk-status-update.component.html',
  styleUrls: ['./bulk-status-update.component.scss'],
  providers: [
    DatePipe,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class BulkStatusUpdateComponent implements OnInit {
  loading: boolean = false;
  dataOnLoad = true;
  itrStatus: any = [];
  ogStatusList: any = [];
  config: any;
  searchParam: any = {
    serviceType: null,
    statusId: null,
    page: 0,
    pageSize: 20,

  };
  maxDate = new Date(2024, 2, 31);
  minDate = new Date(2023, 3, 1);
  minStartDate = moment.min(moment(), moment('2024-04-01')).toDate();
  maxStartDate = moment().toDate();
  maxEndDate = moment().toDate();
  minEndDate = new Date().toISOString().slice(0, 10);

  toDateMin: any = this.minDate;
  startDate = new UntypedFormControl();
  endDate = new UntypedFormControl();
  toStatusValue = new UntypedFormControl();
  fromStatusValue = new UntypedFormControl();
  showBulkUpdateBtn: any;
  userInfo: any = [];
  usersGridOptions: GridOptions;
  dialogRef: MatDialogRef<any>;
  selectedStatus: any;
  itrToStatus: any = [
    { label: ' Not Interested', value: '15' },
    // { label: 'open', value: 'Unpaid' },
    // { label: 'Failed', value: 'Failed' },
  ];
  newStatusName: any;


  constructor(
    private utilsService: UtilsService,
    private userMsService: UserMsService,
    @Inject(LOCALE_ID) private locale: string,
    public datePipe: DatePipe,
  ) {
    this.startDate.setValue(this.minStartDate);
    this.endDate.setValue(new Date());
    this.setToDateValidation();
  }

  ngOnInit() {
    this.getMasterStatusList();
  }


  async getMasterStatusList() {
    this.itrStatus = await this.utilsService.getStoredMasterStatusList();
    console.log('status arr', this.itrStatus);
    this.ogStatusList = await this.utilsService.getStoredMasterStatusList();
  }

  fromServiceType(event) {
    this.searchParam.serviceType = event;
    if (this.searchParam.serviceType) {
      setTimeout(() => {
        this.itrStatus = this.ogStatusList.filter(item => item.applicableServices.includes(this.searchParam.serviceType));
      }, 100);
    }
  }

  setToDateValidation() {
    this.minEndDate = this.startDate.value;
    this.maxStartDate = this.endDate.value;
  }

  onStatusChange() {
    const selectedStatusObject = this.itrStatus.find((status) => status.statusId === this.searchParam.statusId);
    this.selectedStatus = selectedStatusObject ? selectedStatusObject.statusName : '';
  }

  onToStatusChange(data) {
    console.log('data form to status change', data);
    this.newStatusName = data.label;
  }


  update=async ():Promise<any> => {
    //https://uat-api.taxbuddy.com/gateway/itr-status-bulk-request
    if (this.fromStatusValue.value && this.searchParam.serviceType && this.toStatusValue.value) {
      this.loading = true;
      let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd');
      let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd');
      let selectedStatus = this.fromStatusValue.value;
      let param = '/gateway/itr-status-bulk-request';
      let data = {
        statusIdList: selectedStatus,
        newStatusId: this.toStatusValue.value,
        fromDate: fromDate,
        toDate: toDate,
        serviceType: this.searchParam.serviceType,
        newStatusName: this.newStatusName
      };

      try {
        const res: any = await lastValueFrom(this.userMsService.postMethodInfo(param, data));
        this.loading = false;
        if (res) {
          this.utilsService.showSnackBar(res.response);
          this.searchParam.serviceType = null;
          this.searchParam.statusId = null;
          this.fromStatusValue.setValue(null);
          this.startDate.setValue(this.minStartDate);
          this.endDate.setValue(new Date());
          this.toStatusValue.setValue(null);
        } else {
          this.utilsService.showSnackBar('There is a problem while updating the status');
        }
      } catch (error) {
        this.loading = false;
        this.utilsService.showSnackBar('Error in the API of bulk status update');
      }
    } else {
      this.utilsService.showSnackBar('Please select the service and current status of users & to status which need to update');
    }

  }
}
