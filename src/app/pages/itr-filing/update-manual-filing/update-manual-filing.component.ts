import { UtilsService } from './../../../services/utils.service';
import { ApiEndpoints } from 'app/shared/api-endpoint';
import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material';
import { ItrMsService } from 'app/services/itr-ms.service';

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
        this.loading = false;
        this.utilsService.showSnackBar('Manual Filing Details updated successfully')
        this.location.back();
      }, error => {
        this.utilsService.showSnackBar('Failed to update Manual Filing Details')
        this.loading = false;
      })
    }
  }
}

