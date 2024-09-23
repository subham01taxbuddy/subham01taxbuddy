import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReportService } from 'src/app/services/report-service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
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
  selector: 'app-view-chat-links',
  templateUrl: './view-chat-links.component.html',
  styleUrls: ['./view-chat-links.component.css'],
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
export class ViewChatLinksComponent {
  loading!: boolean;
  searchParam: any = {
    page: 0,
    pageSize: 20,
  };
  childConfig: any;
  chatData:any;

  loggedInSme: any;
  roles: any;
  totalPages: number;

  constructor(
    public dialogRef: MatDialogRef<ViewChatLinksComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    private reportService: ReportService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    public datePipe: DatePipe,
  ) {
    this.childConfig = {
      itemsPerPage: 15,
      currentPage: 1,
      totalItems: 0,
    };
    this.getChatLinks()
  }

  getChatLinks(){
    //http://localhost:9055/report/bo/calling-report/missed-chat-report?
    //fromDate=2024-06-05&toDate=2024-06-05&page=0&pageSize=20&chatLink=true&leaderUserId=1064
    this.loading = true;
    let fromDate = this.datePipe.transform(this.data.startDate, 'yyyy-MM-dd') || this.data.startDate;
    let toDate = this.datePipe.transform(this.data.endDate, 'yyyy-MM-dd') || this.data.endDate;

    let userFilter = '';
    let param = '';


    if (this.data.data.role.includes('Leader- Internal')) {
      userFilter += `&leaderUserId=${this.data.data.smeUserId}`;
    }else{
      userFilter += `&filerUserId=${this.data.data.smeUserId}`;
    }

    let data = this.utilsService.createUrlParams(this.searchParam);

    param = `/bo/calling-report/missed-chat-report?fromDate=${fromDate}&toDate=${toDate}&${data}&chatLink=true${userFilter}`;

    this.reportService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
        if (Array.isArray(response?.data?.content) && response?.data?.content?.length > 0) {
          this.chatData = response?.data?.content;
          this.childConfig.totalItems = response?.data?.totalElements;
          this.totalPages = response?.data?.totalPages;
        }else{
          this.childConfig.totalItems = 0;
          this._toastMessageService.alert('error', 'Data Not Found')
        }

      }else {
        this.loading = false;
        this._toastMessageService.alert("error", response.message);
      }
    },(error) => {
      this.loading = false;
      this._toastMessageService.alert("error", "Error");
    });


  }

  changePage(page: number) {
    this.childConfig.currentPage = page;
    this.searchParam.page = page - 1;
    this.getChatLinks();
  }

  close(){
    this.dialogRef.close();
  }
}
