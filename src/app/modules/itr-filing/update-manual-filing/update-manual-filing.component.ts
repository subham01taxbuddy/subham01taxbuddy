import { UtilsService } from './../../../services/utils.service';
import { ApiEndpoints } from 'src/app/modules/shared/api-endpoint';
import { Component, OnInit, Inject } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { AppConstants } from 'src/app/modules/shared/constants';

@Component({
  selector: 'app-update-manual-filing',
  templateUrl: './update-manual-filing.component.html',
  styleUrls: ['./update-manual-filing.component.css']
})
export class UpdateManualFilingComponent implements OnInit {
  ackNumber = new UntypedFormControl('', [Validators.required, Validators.pattern(AppConstants.numericRegex), Validators.maxLength(16), Validators.minLength(15)]);
  eFillingDate = new UntypedFormControl('', Validators.required);
  maxDate = new Date();
  loading = false;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private itrMsService: ItrMsService,
    private userMsService: UserMsService,
    public location: Location,
    public utilsService: UtilsService) {
  }

  ngOnInit() {
    console.log(this.data);
  }

  updateManualDetails() {
    if (this.eFillingDate.valid && this.ackNumber.valid) {
      this.loading = true;
      // const param1 = `/subscription-payment-status?userId=${this.data.userId}&serviceType=ITR`;
      // this.itrMsService.getMethod(param1).subscribe(
      //   (res: any) => {
      //     if (res?.data?.itrInvoicepaymentStatus === 'Paid') {
      let param = '/eligible-to-file-itr?userId=' + this.data.userId + '&&assessmentYear=' + this.data.assessmentYear;
      this.itrMsService.getMethod(param).subscribe(
        (response: any) => {
          if (!(response.success && response?.data?.eligibleToFileItr)) {
            this.utilsService.showSnackBar(
              'You can only update the ITR file record when your status is "ITR confirmation received"'
            );
          } else {
            this.data.eFillingDate = this.eFillingDate.value;
            this.data.ackNumber = this.ackNumber.value;
            console.log('Updated Data:', this.data)
            setTimeout(() => {
              const param = `${ApiEndpoints.itrMs.itrManuallyData}`
              this.itrMsService.putMethod(param, this.data).subscribe((res: any) => {
                console.log(res);
                this.updateStatus();
                this.loading = false;
                this.utilsService.showSnackBar('Manual Filing Details updated successfully')
                this.location.back();
              }, error => {
                this.utilsService.showSnackBar('Failed to update Manual Filing Details')
                this.loading = false;
              });
            }, 7000)
          }
        });
      //   } else {
      //     this.loading = false;
      //     this.utilsService.showSnackBar(
      //       'Please make sure that the payment has been made by the user to proceed ahead'
      //     );
      //   }
      // });

    }
  }

  async updateStatus() {
    const fyList = await this.utilsService.getStoredFyList();
    const currentFyDetails = fyList.filter((item: any) => item.isFilingActive);
    if (!(currentFyDetails instanceof Array && currentFyDetails.length > 0)) {
      // this.utilsService.showSnackBar('There is no any active filing year available')
      return;
    }
    const param = '/itr-status'
    const request = {
      "statusId": 11, // ITR FILED
      "userId": this.data.userId,
      "assessmentYear": currentFyDetails[0].assessmentYear,
      "completed": true,
      "serviceType": "ITR"
    }

    // this.loading = true;
    this.userMsService.postMethod(param, request).subscribe(result => {
      console.log('##########################', result['statusId']);
      // this.utilsService.showSnackBar('Filing status updated successfully.')
      // this.sendValue.emit(result['statusId']);
      // this.loading = false;
    }, err => {
      // this.loading = false;
      // this.utilsService.showSnackBar('Failed to update Filing status.')
    })
  }

  setFilingDate() {
    var id = this.ackNumber.value;
    var lastSix = id.substr(id.length - 6);
    var day = lastSix.slice(0, 2);
    var month = lastSix.slice(2, 4);
    var year = lastSix.slice(4, 6);
    let dateString = `20${year}-${month}-${day}`;
    console.log(dateString, year, month, day)
    this.eFillingDate.setValue(dateString);
  }
}

