/* eslint-disable @angular-eslint/component-selector */
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
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
import { ReportService } from 'src/app/services/report-service';


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
  ackNumber = new UntypedFormControl('', [Validators.required, Validators.pattern(AppConstants.numericRegex), Validators.maxLength(16), Validators.minLength(15)]);
  eFillingDate = new UntypedFormControl('', Validators.required);
  itrType = new UntypedFormControl('', Validators.required);
  fy = new UntypedFormControl('');
  ay = new UntypedFormControl('');
  maxDate = new Date();
  loading = false;
  userProfile: any;
  showDetails = false;
  hideYears = true;
  allYears = ['2021-2022', '2022-2023'];
  enabledYears:any =[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private itrMsService: ItrMsService,
    private reportService: ReportService,
    private userMsService: UserMsService,
    public utilsService: UtilsService,
    private router: Router,
    public location: Location,
    private dialogRef: MatDialogRef<UpdateItrUFillingDialogComponent>
  ) {
    this.checkIsFillingDone()
   }

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
      // this.checkPaymentStatus()
      this.hideYears = false;
      this.showDetails = true;
      // if (year === "2020-2021") {
      //   this.ay.setValue('2021-2022');
      // } else
      this.checkSubscriptionForSelectedFinancialYear(year);
      if (year === "2021-2022") {
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

  checkIsFillingDone(){
   //https://uat-api.taxbuddy.com/itr/filed-itru-financial-years?userId=20569'
    this.loading = true;
    const param1 = `/filed-itru-financial-years?userId=${this.data.userId}`;
    this.itrMsService.getMethod(param1).subscribe(
      (res: any) => {
        this.loading = false;
        const filingNotDoneYears = res;
        this.enabledYears = this.allYears.map(year => filingNotDoneYears.includes(year) ? year : null);
      }, error => {
        this.hideYears = true;
        this.showDetails = false;
        this.utilsService.showSnackBar('Error while checking ITRU filing status, Please try again.');
        this.loading = false;
      })
  }

  checkSubscriptionForSelectedFinancialYear(financialYear:string) {
    this.loading = true;
    const query = {
      "and": {
        "is": {
          "userId": this.data.userId,
          "serviceType": "ITRU",
          "item.financialYear":financialYear
         }
      },
      "collectionName":"subscription",
      "queryType": "EXISTS"
    }

    this.reportService.query(query).subscribe(
      (res: any) => {
        this.loading = false;
        if (res?.data) {
          this.loading = false;
          this.hideYears = false;
          this.showDetails = true;
        } else {
          this.loading = false;
          this.hideYears = true;
          this.showDetails = false;
          this.utilsService.showSnackBar(
            'Please make sure the subscription is created for user.'
          );
          this.dialogRef.close(true);
        }
      }, error => {
        this.hideYears = true;
        this.showDetails = false;
        this.utilsService.showSnackBar('Error while checking subscription, Please try again.');
        this.loading = false;
      })

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

  updateItrUDetails = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      this.utilsService.getUserCurrentStatus(this.data.userId).subscribe(
        (res: any) => {
          console.log(res);
          if (res.error) {
            this.utilsService.showSnackBar(res.error);
            this.dialogRef.close(true);
            reject(res.error);
          } else {
            const ackNumberLastTwoDigits = this.ackNumber.value.substr(-2); //23 or 24
            if (ackNumberLastTwoDigits !== '24' && ackNumberLastTwoDigits !== '23') {
              this.utilsService.showSnackBar(
                `Ack Number must end with '23' or '24' for the Year ${this.data.assessmentYear}`
              );
              reject("Invalid Ack Number");
            } else if (this.eFillingDate.valid && this.ackNumber.valid) {
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

              setTimeout(() => {
                const param = `${ApiEndpoints.itrMs.itrManuallyData}`;
                this.itrMsService.putMethod(param, req).toPromise().then(
                  (res: any) => {
                    this.loading = false;
                    if (res.success) {
                      this.utilsService.showSnackBar('ITR-U Filing Details updated successfully');
                      this.dialogRef.close(true);
                      resolve('resolved');
                    } else {
                      this.utilsService.showSnackBar(res.message);
                      this.dialogRef.close(true);
                      reject(res.message);
                    }
                  },
                  (error) => {
                    this.loading = false;
                    this.utilsService.showSnackBar('Failed to update ITR-U Filing Details');
                    this.dialogRef.close(true);
                    reject(error);
                  }
                ).catch((error) => {
                  this.loading = false;
                  reject(error);
                });
              }, 10000);
            } else {
              this.utilsService.showSnackBar('Please give E-Filling-Date and Acknowledgment Number');
              reject("Invalid input");
            }
          }
        },
        (error) => {
          this.loading = false;
          this.utilsService.showSnackBar('error in api of user-reassignment-status');
          if (error.error && error.error.error) {
            this.utilsService.showSnackBar(error.error.error);
            this.dialogRef.close(true);
          } else {
            this.utilsService.showSnackBar("An unexpected error occurred.");
          }
          reject(error);
        }
      );
    });
  }

  setFilingDate() {
    let today = moment().startOf('day').valueOf();
    let id = this.ackNumber.value;
    let lastSix = id.substr(id.length - 6);
    let day = lastSix.slice(0, 2);
    let month = lastSix.slice(2, 4);
    let year = lastSix.slice(4, 6);
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
