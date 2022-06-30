import { UtilsService } from 'src/app/services/utils.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { Router } from '@angular/router';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-more-options-dialog',
  templateUrl: './more-options-dialog.component.html',
  styleUrls: ['./more-options-dialog.component.scss']
})
export class MoreOptionsDialogComponent implements OnInit {
  isOptingOtherService = false;
  services = ['ITR', 'TPA', 'NOTICE', 'GST'];
  selectedService = '';
  optedServicesData = [];
  loading = false;

  constructor(public dialogRef: MatDialogRef<MoreOptionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private userMsService: UserMsService,
    public utilsService: UtilsService) { }

  ngOnInit() {
    console.log(this.data)
  }
  goToInvoice() {
    this.router.navigate(['/pages/subscription/invoices'], { queryParams: { userId: this.data.userId } });
    this.dialogRef.close();
  }

  goToSubscription() {
    this.router.navigate(['/pages/subscription/sub'], { queryParams: { userMobNo: this.data.mobileNumber } });
    this.dialogRef.close();
  }
  goToCloud() {
    this.router.navigate(['/pages/itr-filing/user-docs/' + this.data.userId]);
    this.dialogRef.close();
  }
  goToProfile() {
    this.router.navigate(['pages/user-management/profile/' + this.data.userId]);
    this.dialogRef.close();
  }

  optedServices() {
    this.loading = false;
    this.isOptingOtherService = true;
    const param = `/sme/assignee-details?userId=${this.data.userId}`;
    this.userMsService.getMethod(param).subscribe((res: any) => {
      console.log(res);
      if (res.success)
        this.optedServicesData = res.data
      this.loading = false;
    }, () => {
      this.loading = false;
    })
  }
  isDisabled(service) {
    return this.optedServicesData.filter(item => item.serviceType === service).length > 0 ? true : false
  }

  optService() {
    if (this.utilsService.isNonEmpty(this.selectedService)) {
      this.loading = true;
      const param = `/sme/agent-assignment?userId=${this.data.userId}&assessmentYear=2022-2023&serviceType=${this.selectedService}`;
      this.userMsService.getMethod(param).subscribe(res => {
        this.optedServices();
        this.utilsService.showSnackBar('Successfully opted the service type ' + this.selectedService);
      }, () => {
        this.loading = false;
      });
    }
  }
}
