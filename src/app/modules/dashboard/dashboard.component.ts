import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loading = false;
  loggedInSmeUserId:any;
  roles:any;
  constructor(
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loggedInSmeUserId = this.utilsService.getLoggedInUserID();
    this.roles = this.utilsService.getUserRoles();
    // this.getInvoiceReports();
  }


//   getInvoiceReports(){
//   // https://uat-api.taxbuddy.com/user/dashboard/invoice-report?filerUserId=2132&fromDate=2023-05-05&toDate=2023-05-05&serviceType=ITR
//   this.loading = true;

//   let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
//   let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
//   let filerUserId = this.loggedInSmeUserId;


//   let param = `/dashboard/invoice-report?filerUserId=${this.loggedInSmeUserId}&fromDate=${}&toDate=${}&serviceType=${}`

//   this.userMsService.getMethod(param).subscribe((result: any) => {

//   })
// }

}
