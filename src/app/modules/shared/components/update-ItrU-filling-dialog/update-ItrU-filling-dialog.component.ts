/* eslint-disable @angular-eslint/component-selector */
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AppConstants } from '../../constants';
import { ApiEndpoints } from '../../api-endpoint';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { Location } from '@angular/common';


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
  selector: 'app-update-ItrU-filling-dialog',
  templateUrl: './update-ItrU-filling-dialog.component.html',
  styleUrls: ['./update-ItrU-filling-dialog.component.scss'],
  providers: [{ provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class UpdateItrUFillingDialogComponent implements OnInit {
  ackNumber = new FormControl('', [Validators.required, Validators.pattern(AppConstants.numericRegex), Validators.maxLength(16), Validators.minLength(15)]);
  eFillingDate = new FormControl('', Validators.required);
  itrType = new FormControl('', Validators.required);
  fy = new FormControl('');
  ay = new FormControl('');
  maxDate = new Date();
  loading = false;
  userProfile: any;
  showDetails = false;
  hideYears = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private itrMsService: ItrMsService,
    private userMsService: UserMsService,
    public utilsService: UtilsService,
    private router: Router,
    public location: Location,
    private dialogRef: MatDialogRef<UpdateItrUFillingDialogComponent>
  ) { }

  ngOnInit() {
    console.log(this.data);
    const param = `/profile/${this.data.userId}`;
    this.userMsService.getMethod(param).subscribe((res: any) => {
      this.userProfile = res;
    });
  }

  selectedFy(year: any) {
    if (year) {
      this.fy.setValue(year);
      this.checkPaymentStatus()
      if (year === "2020-2021") {
        this.ay.setValue('2021-2022');
      } else if (year === "2021-2022") {
        this.ay.setValue('2022-2023');
      }
      else if (year === "2022-2023") {
        this.ay.setValue('2023-2024');
      }
    }
    else {
      this.showDetails = false;
      this.fy.setValue(null);
    }

  }

  checkPaymentStatus() {
    this.loading = true;
    const param1 = `/subscription-payment-status?userId=${this.data.userId}&serviceType=ITRU&financialYear=${this.fy.value}`;
    this.itrMsService.getMethod(param1).subscribe(
      (res: any) => {
        this.loading = false;
        if (res?.data?.itrInvoicepaymentStatus === 'Paid') {
          this.loading = false;
          this.hideYears = false;
          this.showDetails = true;
          // this.updateItrUDetails();
        } else if (res?.data?.itrInvoicepaymentStatus === 'SubscriptionDeletionPending') {
          this.loading = false;
          this.hideYears = true;
          this.showDetails = false;
          this.utilsService.showSnackBar(
            'ITR-U' + this.fy.value + 'Subscription is deleted which is pending for Approval / Reject, please ask Leader to reject so that we can proceed further'
          );
        }
        else {
          this.loading = false;
          this.hideYears = true;
          this.showDetails = false;
          this.utilsService.showSnackBar(
            'Please make sure that the payment has been made by the user to proceed ahead'
          );
        }
      }, error => {
        this.hideYears = true;
        this.showDetails = false;
        this.utilsService.showSnackBar('Error while checking payment status, Please try again.');
        this.loading = false;
      })

  }

  updateItrUDetails() {
    this.utilsService.getUserCurrentStatus(this.data.userId).subscribe(
      (res: any) => {
        console.log(res);
        if (res.error) {
          this.utilsService.showSnackBar(res.error);
          this.dialogRef.close(true);
          return;
        } else {
          const assessmentYearLastTwoDigits = this.data.assessmentYear.substr(
            2,
            2
          ); //2023-2024 //23
          const ackNumberLastTwoDigits = this.ackNumber.value.substr(-2); //23 or 24
          if (
            ackNumberLastTwoDigits !== '24' &&
            ackNumberLastTwoDigits !== '23'
          ) {
            this.utilsService.showSnackBar(
              `Ack Number must end with '23' or '24' for the Year ${this.data.assessmentYear}`
            );
            return;
          }
          if (this.eFillingDate.valid && this.ackNumber.valid) {
            this.loading = true;
            let itrType = `ITRU-${this.itrType.value}`;
            let req = {
              userId: this.data.userId,
              email: this.data.email,
              contactNumber: this.data.mobileNumber,
              panNumber: this.userProfile.panNumber,
              assesseeType: 'INDIVIDUAL',
              assessmentYear: this.data.assessmentYear,
              financialYear: this.fy.value,
              isRevised: 'N',
              eFillingCompleted: true,
              eFillingDate: this.eFillingDate.value,
              ackNumber: this.ackNumber.value,
              itrType: `${itrType}`,
              itrTokenNumber: '',
              filingTeamMemberId: this.data.callerAgentUserId,
              filingSource: 'MANUALLY',
              isITRU: true,
            };
            console.log('Updated Data:', req);
            const param = `${ApiEndpoints.itrMs.itrManuallyData}`;
            this.itrMsService.putMethod(param, req).subscribe(
              (res: any) => {
                console.log(res);
                this.loading = false;
                if (res.success) {
                  this.utilsService.showSnackBar(
                    'ITR-U Filing Details updated successfully'
                  );
                  this.dialogRef.close(true);
                  // this.location.back();
                } else {
                  this.utilsService.showSnackBar(res.message);
                  this.dialogRef.close(true);
                }
              },
              (error) => {
                this.utilsService.showSnackBar(
                  'Failed to update ITR-U Filing Details'
                );
                this.dialogRef.close(true);
                this.loading = false;
              }
            );
          } else {
            this.utilsService.showSnackBar(
              'Please give E-Filling-Date and Acknowledgment Number'
            );
          }
        }
      },
      (error) => {
        this.loading = false;
        this.utilsService.showSnackBar(
          'error in api of user-reassignment-status'
        );
        this.loading=false;
        if (error.error && error.error.error) {
          this.utilsService.showSnackBar( error.error.error);
          this.dialogRef.close(true);
        } else {
          this.utilsService.showSnackBar( "An unexpected error occurred.");
        }
      }
    );
  }

  setFilingDate() {
    let today = moment().startOf('day').valueOf();
    var id = this.ackNumber.value;
    var lastSix = id.substr(id.length - 6);
    var day = lastSix.slice(0, 2);
    var month = lastSix.slice(2, 4);
    var year = lastSix.slice(4, 6);
    let dateString = `20${year}-${month}-${day}`;
    console.log(dateString, year, month, day)
    let efillingDateTime = moment(dateString, "YYYY-MM-DD").startOf('day').valueOf();
    if (efillingDateTime > today) {
      this.eFillingDate.setValue(null);
      this.utilsService.showSnackBar('Please enter the valid acknowledgement number. Last 6 digit of acknowledgement number should not be after todays date in (dd/mm/yy) format');
      return
    } {
      this.eFillingDate.setValue(dateString);
      if (this.eFillingDate.status != 'VALID') {
        this.utilsService.showSnackBar('Please enter the valid acknowledgement number. Last 6 digit of acknowledgement number should not be after todays date in (dd/mm/yy) format');
      }
    }

  }
}
