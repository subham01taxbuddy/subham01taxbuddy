import { ApiEndpoints } from 'src/app/modules/shared/api-endpoint';
import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { UtilsService } from 'src/app/services/utils.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

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
  selector: 'app-update-manual-filing-dialog',
  templateUrl: './update-manual-filing-dialog.component.html',
  styleUrls: ['./update-manual-filing-dialog.component.css'],
  providers: [{ provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class UpdateManualFilingDialogComponent implements OnInit {
  ackNumber = new FormControl('', [Validators.required, Validators.pattern(AppConstants.numericRegex), Validators.maxLength(15), Validators.minLength(15)]);
  eFillingDate = new FormControl('', Validators.required);
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
      this.data.eFillingDate = this.eFillingDate.value;
      this.data.ackNumber = this.ackNumber.value;
      this.data.eFillingCompleted = true;
      console.log('Updated Data:', this.data)
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
      })
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

