import { ItrMsService } from './../../../services/itr-ms.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { AppConstants } from 'app/shared/constants';

@Component({
  selector: 'app-email-reports',
  templateUrl: './email-reports.component.html',
  styleUrls: ['./email-reports.component.css']
})
export class EmailReportsComponent implements OnInit {
  emailAddress = new FormControl('', Validators.compose([Validators.required, Validators.pattern(AppConstants.emailRegex)]))
  constructor(private itrMsService: ItrMsService) { }

  ngOnInit() {
    const userObj = JSON.parse(localStorage.getItem('UMD'));
    this.emailAddress.setValue(userObj['USER_EMAIL']);
  }

  sendReport(endPoint) {
    if (this.emailAddress.valid) {
      const param = `/${endPoint}?emails=${this.emailAddress.value}`;
      this.itrMsService.getMethod(param).subscribe(res => {
        console.log('Email response', res)
      })
    }
  }
}
