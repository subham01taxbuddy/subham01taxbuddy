import { UtilsService } from './../../../services/utils.service';
import { ApiEndpoints } from 'app/shared/api-endpoint';
import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material';
import { ItrMsService } from 'app/services/itr-ms.service';
import { UserMsService } from 'app/services/user-ms.service';

@Component({
  selector: 'app-update-manual-filing',
  templateUrl: './update-manual-filing.component.html',
  styleUrls: ['./update-manual-filing.component.css']
})
export class UpdateManualFilingComponent implements OnInit {
  ackNumber = new FormControl('', Validators.required);
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
    const currentFyDetails = fyList.filter(item => item.isFilingActive);
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

