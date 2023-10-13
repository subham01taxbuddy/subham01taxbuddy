import { DatePipe, formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GridOptions, ICellRendererParams } from 'ag-grid-community';
import { AgTooltipComponent } from 'src/app/modules/shared/components/ag-tooltip/ag-tooltip.component';
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
  loading:boolean =false;
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
  toDateMin: any =this.minDate;
  startDate= new FormControl();
  endDate= new FormControl();
  toStatusValue = new FormControl();
  fromStatusValue = new FormControl();
  showBulkUpdateBtn: any;
  userInfo: any = [];
  usersGridOptions: GridOptions;
  dialogRef: MatDialogRef<any>;
  selectedStatus :any;
  itrToStatus :any =[
    { label: ' Not Interested', value: '15' },
    // { label: 'open', value: 'Unpaid' },
    // { label: 'Failed', value: 'Failed' },
  ];
  newStatusName:any;


  constructor(
    private dialog: MatDialog,
    private utilsService: UtilsService,
    private userMsService: UserMsService,
    @Inject(LOCALE_ID) private locale: string,
    public datePipe: DatePipe,
  ) {
    this.startDate.setValue('2023-04-01');
    this.endDate.setValue(new Date());
   }

  ngOnInit() {
    const userId = this.utilsService.getLoggedInUserID();
    this.getMasterStatusList();
  }


  async getMasterStatusList() {
    this.itrStatus = await this.utilsService.getStoredMasterStatusList();
    console.log('status arr',this.itrStatus);
    this.ogStatusList = await this.utilsService.getStoredMasterStatusList();
  }

  fromServiceType(event) {
    this.searchParam.serviceType = event;
    // this.search('serviceType', 'isAgent');

    if (this.searchParam.serviceType) {
      setTimeout(() => {
        this.itrStatus = this.ogStatusList.filter(item => item.applicableServices.includes(this.searchParam.serviceType));
      }, 100);
    }
  }

  setToDateValidation(FromDate) {
    console.log('FromDate: ', FromDate);
    this.toDateMin = FromDate;
  }

  onStatusChange( statusIds) {
    const selectedStatusObject = this.itrStatus.find((status) => status.statusId === this.searchParam.statusId);
    this.selectedStatus = selectedStatusObject ? selectedStatusObject.statusName : '';
    const selectedStatusIds = this.fromStatusValue.value;
  }

  onToStatusChange(data){
    console.log('data form to status change',data);
    this.newStatusName =data.label ;
  }


  update(){
    //https://uat-api.taxbuddy.com/gateway/itr-status-bulk-request
    if(this.fromStatusValue.value && this.searchParam.serviceType && this.toStatusValue.value){
    this.loading = true;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd');
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd');
    let selectedStatus = this.fromStatusValue.value;
    let param = '/gateway/itr-status-bulk-request'
    let data ={
      statusIdList : selectedStatus,
      newStatusId : this.toStatusValue.value,
      fromDate : fromDate,
      toDate : toDate,
      serviceType : this.searchParam.serviceType,
      newStatusName : this.newStatusName
    }

    this.userMsService.postMethodInfo(param, data).subscribe((res: any) => {
      this.loading = false;
      if(res){
        this.utilsService.showSnackBar(res.response);

      }else{
        this.utilsService.showSnackBar('there is problem while updating the status');
      }
    },

    error => {
      this.loading = false;
      this.utilsService.showSnackBar(
        'error in the api of bulk status update'
      );
    })

    }this.utilsService.showSnackBar(
        'Please select the service and current status of users & to status which need to update   '
    );

  }
}
