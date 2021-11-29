import { environment } from 'environments/environment';
import { UserMsService } from 'app/services/user-ms.service';
import { ItrMsService } from './../../../services/itr-ms.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AppConstants } from 'app/shared/constants';
import { UtilsService } from 'app/services/utils.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-email-reports',
  templateUrl: './email-reports.component.html',
  styleUrls: ['./email-reports.component.css'],
  providers: [DatePipe]
})
export class EmailReportsComponent implements OnInit {
  emailAddress = new FormControl('', Validators.compose([Validators.required, Validators.pattern(AppConstants.emailRegex)]))
  itrStatus: any = [];
  dateSearchForm: FormGroup;
  minToDate: any;

  constructor(private itrMsService: ItrMsService, public utilsService: UtilsService, private fb: FormBuilder,
    private userMsService: UserMsService,
    private datePipe: DatePipe,) { }

  ngOnInit() {
    const userObj = JSON.parse(localStorage.getItem('UMD'));
    this.emailAddress.setValue(userObj['USER_EMAIL']);
    this.getMasterStatusList();
    this.dateSearchForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required],
      statusId: [null],
    });
  }
  async getMasterStatusList() {
    this.itrStatus = await this.utilsService.getStoredMasterStatusList();
  }
  sendReport(endPoint) {
    if (this.emailAddress.valid) {
      const param = `/${endPoint}?emails=${this.emailAddress.value}`;
      this.itrMsService.getMethod(param).subscribe(res => {
        console.log('Email response', res)
      })
    }
  }
  setToDateValidation(fromDate) {
    this.minToDate = fromDate;
  }
  downloadDateWiseReport() {
    if (this.dateSearchForm.valid) {
      let fromDate = this.datePipe.transform(this.dateSearchForm.value.fromDate, 'yyyy-MM-dd');
      let toDate = this.datePipe.transform(this.dateSearchForm.value.toDate, 'yyyy-MM-dd');
      const param = `${environment.url}/user/status-wise-user-data-es?from=${fromDate}T00:00:00.000Z&to=${toDate}T23:59:00.000Z&statusId=${this.dateSearchForm.value.statusId}`
      console.log(param);
      window.open(param)
      // this.userMsService.getMethod(param).subscribe(res => {
      //   console.log(res)
      // }, error => {
      //   console.log(error)
      // })
    }
  }
}
