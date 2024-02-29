import { ApiEndpoints } from 'src/app/modules/shared/api-endpoint';
import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { UtilsService } from 'src/app/services/utils.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ITR_JSON } from "../../interfaces/itr-input.interface";
import { Router } from "@angular/router";
import * as moment from 'moment';

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
  selector: 'app-update-no-json-filing-dialog',
  templateUrl: './update-no-json-filing-dialog.component.html',
  styleUrls: ['./update-no-json-filing-dialog.component.css'],
  providers: [{ provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class UpdateNoJsonFilingDialogComponent implements OnInit {
  ackNumber = new FormControl('', [Validators.required, Validators.pattern(AppConstants.numericRegex), Validators.maxLength(16), Validators.minLength(15)]);
  eFillingDate = new FormControl('', Validators.required);
  itrType = new FormControl('', Validators.required);
  returnType = new FormControl('', Validators.required);
  maxDate = new Date();
  loading = false;
  userProfile: any;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private itrMsService: ItrMsService,
    private userMsService: UserMsService,
    public location: Location,
    public utilsService: UtilsService,
    private router: Router,
    private dialogRef: MatDialogRef<UpdateNoJsonFilingDialogComponent>) {
  }

  ngOnInit() {
    console.log(this.data);
    const param = `/profile/${this.data.userId}`;
    this.userMsService.getMethod(param).subscribe((res: any) => {
      this.userProfile = res;
    });
  }

  updateManualDetails() {
    const assessmentYearLastTwoDigits = this.data.assessmentYear.substr(2, 2);
    const ackNumberLastTwoDigits = this.ackNumber.value.substr(-2);
    if (ackNumberLastTwoDigits !== assessmentYearLastTwoDigits) {
      this.utilsService.showSnackBar(`Ack Number must end with "${assessmentYearLastTwoDigits}" for the Assessment Year ${this.data.assessmentYear}`);
      return;
    }
    if (this.eFillingDate.valid && this.ackNumber.valid) {
      this.loading = true;

      let itrType = `ITR${this.itrType.value}`;

      const param1 = `/subscription-payment-status?userId=${this.data.userId}&serviceType=ITR`;
      this.itrMsService.getMethod(param1).subscribe(
        (res: any) => {
          if (res?.data?.itrInvoicepaymentStatus === 'Paid') {
            if (this.data.itrObjectStatus === 'CREATE') {
              //no ITR object found, create a new ITR object
              this.loading = true;
              let objITR = this.utilsService.createEmptyJson(
                this.userProfile,
                this.data?.assessmentYear,
                '2022-2023'
              );
              objITR.filingTeamMemberId = this.data.callerAgentUserId;
              objITR.userId = this.data.userId;
              objITR.assessmentYear = this.data.assessmentYear;
              objITR.isRevised = this.returnType.value;
              console.log('obj:', objITR);

              const param = '/itr';
              this.itrMsService.postMethod(param, objITR).subscribe(
                (result: any) => {
                  console.log('My iTR Json successfully created-==', result);
                  this.loading = false;
                  objITR = result;
                  this.serviceCall(objITR);
                },
                (error) => {
                  this.loading = false;
                }
              );
              this.loading = false;
              console.log('end');
            } else {
              //one more ITR objects in place, use existing ITR object
              let itrFilter =
                this.data.itrObjectStatus !== 'MULTIPLE_ITR'
                  ? `&itrId=${this.data.openItrId}`
                  : '';
              const param =
                `/itr?userId=${this.data.userId}&assessmentYear=${this.data.assessmentYear}` +
                itrFilter;
              this.itrMsService.getMethod(param).subscribe(
                async (result: any) => {
                  console.log(`My ITR by ${param}`, result);
                  if (result == null || result.length == 0) {
                    //no ITR found, error case
                    this.loading = false;
                    this.utilsService.showErrorMsg(
                      'Something went wrong. Please try again'
                    );
                  } else if (result.length == 1) {

                    let workingItr = result[0];
                    let obj = this.utilsService.createEmptyJson(
                      null,
                      this.data.assessmentYear,
                      '2022-2023'
                    );
                    Object.assign(obj, workingItr);
                    workingItr.filingTeamMemberId = this.data.callerAgentUserId;
                    console.log('obj:', obj);
                    workingItr = JSON.parse(JSON.stringify(obj));
                    this.serviceCall(workingItr);
                  } else {
                    //multiple ITRs found, navigate to ITR tab with the results
                    this.router.navigateByUrl('/tasks/filings', {
                      state: { mobileNumber: this.data?.mobileNumber },
                    });
                  }
                },
                async (error: any) => {
                  console.log('Error:', error);
                  this.utilsService.showErrorMsg(
                    'Something went wrong. Please try again'
                  );
                }
              );
            }
          } else {
            this.loading = false;
            this.utilsService.showSnackBar(
              'Please make sure all the invoices are paid before updating the filing status.'
            );
          }
        });
    }
  }

  serviceCall(itrObj: ITR_JSON) {
    this.utilsService.getUserCurrentStatus(this.data.userId).subscribe(
      (res: any) => {
        console.log(res);
        if (res.error) {
          this.utilsService.showSnackBar(res.error);
          this.dialogRef.close(true);
          return;
        } else {
          let req = {
            userId: this.data.userId,
            itrId: itrObj.itrId,
            email: this.data.email,
            contactNumber: this.data.mobileNumber,
            panNumber: this.userProfile.panNumber,
            "aadharNumber": "",
            "assesseeType": "INDIVIDUAL",
            assessmentYear: this.data.assessmentYear,
            financialYear: "2022-2023",
            isRevised: this.returnType.value,
            "eFillingCompleted": true,
            eFillingDate: this.eFillingDate.value,
            ackNumber: this.ackNumber.value,
            itrType: `${this.itrType.value}`,
            itrTokenNumber: '',
            "filingTeamMemberId": this.data.callerAgentUserId,
            filingSource: "MANUALLY"
          }
          console.log('Updated Data:', req)
          const param = `${ApiEndpoints.itrMs.itrManuallyData}`
          this.itrMsService.putMethod(param, req).subscribe((res: any) => {
            console.log(res);
            this.loading = false;
            if (res.success) {
              this.updateStatus();
              this.utilsService.showSnackBar('Manual Filing Details updated successfully');
              this.location.back();
            } else {
              this.utilsService.showSnackBar(res.message);
            }
          }, error => {
            this.utilsService.showSnackBar('Failed to update Manual Filing Details')
            this.loading = false;
          })
        }
      },error => {
        this.loading=false;
        if (error.error && error.error.error) {
          this.utilsService.showSnackBar( error.error.error);
        } else {
          this.utilsService.showSnackBar( "An unexpected error occurred.");
        }
      });

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
    }, err => {
    })
  }

  setFilingDate() {
    // let today = moment().format("YYYY-MM-DD");
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

