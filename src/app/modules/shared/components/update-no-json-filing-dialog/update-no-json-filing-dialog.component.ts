import { ApiEndpoints } from 'src/app/modules/shared/api-endpoint';
import { Component, OnInit, Inject } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
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
  ackNumber = new UntypedFormControl('', [Validators.required, Validators.pattern(AppConstants.numericRegex), Validators.maxLength(16), Validators.minLength(15)]);
  eFillingDate = new UntypedFormControl('', Validators.required);
  itrType = new UntypedFormControl('', Validators.required);
  returnType = new UntypedFormControl('', Validators.required);
  manualUpdateReason = new UntypedFormControl('', Validators.required);
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

  updateManualDetails=():Promise<any> =>{
    const assessmentYearLastTwoDigits = this.data.assessmentYear.substr(2, 2);
    const ackNumberLastTwoDigits = this.ackNumber.value.substr(-2);
    if (ackNumberLastTwoDigits !== assessmentYearLastTwoDigits) {
      this.utilsService.showSnackBar(`Ack Number must end with "${assessmentYearLastTwoDigits}" for the Assessment Year ${this.data.assessmentYear}`);
      return;
    }

    if (this.data.statusId !== 8 && this.data.statusId !== 47) {
      this.utilsService.showSnackBar('You can only update the ITR file record when your status is "ITR confirmation received"');
      return;
    }

    if (this.eFillingDate.valid && this.ackNumber.valid) {
      this.loading = true;

      if (this.data.itrObjectStatus === 'CREATE') {
        //no ITR object found, create a new ITR object
        this.loading = true;
        let objITR = this.utilsService.createEmptyJson(
          this.userProfile, this.data.serviceType,
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
        return this.itrMsService.getMethod(param).toPromise().then(
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
              let serviceType = workingItr.isITRU ? 'ITRU' : 'ITR';
              let obj = this.utilsService.createEmptyJson(
                null, serviceType,
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
            financialYear: this.utilsService.getFYFromAY(this.data.assessmentYear),
            isRevised: this.returnType.value,
            "eFillingCompleted": true,
            eFillingDate: this.eFillingDate.value,
            ackNumber: this.ackNumber.value,
            itrType: `${this.itrType.value}`,
            itrTokenNumber: '',
            "filingTeamMemberId": this.data.callerAgentUserId,
            filingSource: "MANUALLY",
            manualUpdateReason: this.manualUpdateReason.value
          }
          console.log('Updated Data:', req)
          setTimeout(() => {
            const param = `${ApiEndpoints.itrMs.itrManuallyData}`
            this.itrMsService.putMethod(param, req).subscribe((res: any) => {
              console.log(res);
              this.loading = false;
              if (res.success) {
                this.utilsService.showSnackBar('Manual Filing Details updated successfully');
                this.dialogRef.close(true);
              } else {
                this.utilsService.showSnackBar(res.message);
                this.dialogRef.close(true);
              }
            }, error => {
              this.utilsService.showSnackBar('Failed to update Manual Filing Details')
              this.loading = false;
              this.dialogRef.close(true);
            })
          }, 10000)
        }
      }, error => {
        this.loading = false;
        if (error.error && error.error.error) {
          this.utilsService.showSnackBar(error.error.error);
          this.dialogRef.close(true);
        } else {
          this.utilsService.showSnackBar("An unexpected error occurred.");
        }
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

