import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatStepper } from '@angular/material';
import { environment } from 'environments/environment';
import { UserMsService } from 'app/services/user-ms.service';
import { AppConstants } from 'app/shared/constants';
import { UtilsService } from 'app/services/utils.service';

@Component({
  templateUrl: './filing-status-dialog.component.html',
  styleUrls: ['./filing-status-dialog.component.css']
})
export class FilingStatusDialogComponent implements OnInit {
  userId: any;
  @ViewChild('stepper', { static: true }) private stepper: MatStepper;
  fillingMasterStatus = [
    // {
    //   "createdDate": "2020-05-19T09:19:51.335Z",
    //   "id": "5ec3a4b7d5220f2e3cd22bd3",
    //   "statusId": 1,
    //   "statusName": "Assisted Mode",
    //   "sequence": 1,
    //   "source": "BOTH",
    //   "active": true,
    //   "message": "",
    //   "channel": ""
    // },
    {
      "createdDate": "2020-05-19T09:29:06.095Z",
      "id": "5ec3a6e2d5220f375473036c",
      "statusId": 2,
      "statusName": "Documents Uploaded",
      "sequence": 2,
      "source": "USER",
      "active": true,
      "message": "",
      "channel": ""
    },
    {
      "createdDate": "2020-05-19T09:29:22.881Z",
      "id": "5ec3a6f2d5220f375473036d",
      "statusId": 3,
      "statusName": "Document Received",
      "sequence": 3,
      "source": "BACK_OFFICE",
      "active": true,
      "message": "",
      "channel": ""
    },
    {
      "createdDate": "2020-05-19T09:29:37.125Z",
      "id": "5ec3a701d5220f375473036e",
      "statusId": 4,
      "statusName": "Document Reviewed",
      "sequence": 4,
      "source": "BACK_OFFICE",
      "active": true,
      "message": "",
      "channel": ""
    },
    {
      "createdDate": "2020-05-19T09:29:46.983Z",
      "id": "5ec3a70ad5220f375473036f",
      "statusId": 5,
      "statusName": "Preparing ITR",
      "sequence": 5,
      "source": "USER",
      "active": true,
      "message": "",
      "channel": ""
    },
    // {
    //   "createdDate": "2020-05-19T09:30:11.260Z",
    //   "id": "5ec3a723d5220f3754730370",
    //   "statusId": 6,
    //   "statusName": "ITR Work In Progress",
    //   "sequence": 6,
    //   "source": "BACK_OFFICE",
    //   "active": true,
    //   "message": "",
    //   "channel": ""
    // },
    {
      "createdDate": "2020-05-19T09:30:39.172Z",
      "id": "5ec3a73fd5220f3754730371",
      "statusId": 7,
      "statusName": "Waiting for Confirmation",
      "sequence": 7,
      "source": "BACK_OFFICE",
      "active": true,
      "message": "",
      "channel": ""
    },
    {
      "createdDate": "2020-05-19T10:38:41.191Z",
      "id": "5ec3b731d5220f0aa8ef4bda",
      "statusId": 8,
      "statusName": "ITR Confirmation",
      "sequence": 8,
      "source": "USER",
      "active": true,
      "message": "",
      "channel": ""
    },
    // {
    //   "createdDate": "2020-05-19T10:39:34.199Z",
    //   "id": "5ec3b766d5220f0aa8ef4bdb",
    //   "statusId": 9,
    //   "statusName": "Confirmation Received",
    //   "sequence": 9,
    //   "source": "BACK_OFFICE",
    //   "active": true,
    //   "message": "",
    //   "channel": ""
    // },
    // {
    //   "createdDate": "2020-05-19T10:41:51.436Z",
    //   "id": "5ec3b7efd5220f0aa8ef4bdc",
    //   "statusId": 10,
    //   "statusName": "Return Filed",
    //   "sequence": 10,
    //   "source": "BACK_OFFICE",
    //   "active": true,
    //   "message": "",
    //   "channel": ""
    // },
    {
      "createdDate": "2020-05-19T10:42:12.278Z",
      "id": "5ec3b804d5220f0aa8ef4bdd",
      "statusId": 11,
      "statusName": "ITR Filed",
      "sequence": 11,
      "source": "USER",
      "active": true,
      "message": "",
      "channel": ""
    },
    {
      "createdDate": "2020-05-19T10:42:28.023Z",
      "id": "5ec3b814d5220f0aa8ef4bde",
      "statusId": 12,
      "statusName": "Payment Status",
      "sequence": 12,
      "source": "BACK_OFFICE",
      "active": true,
      "message": "",
      "channel": ""
    },
    {
      "createdDate": "2020-05-19T10:42:42.368Z",
      "id": "5ec3b822d5220f0aa8ef4bdf",
      "statusId": 13,
      "statusName": "Payment Received",
      "sequence": 13,
      "source": "USER",
      "active": true,
      "message": "",
      "channel": ""
    }
  ]

  latestCompiltedStatus: any = [];
  constructor(public dialogRef: MatDialogRef<FilingStatusDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
    private userMsService: UserMsService, public utilsService: UtilsService) { }

  ngOnInit() {
    this.userId = this.data['userId'];
    console.log('this.data: ', this.data);
    // this.getLatestComplitedStatus();
  }

  // TODO
  async getLatestComplitedStatus() {
    const fyList = await this.utilsService.getStoredFyList();
    const currentFyDetails = fyList.filter(item => item.isFilingActive);
    if (!(currentFyDetails instanceof Array && currentFyDetails.length > 0)) {
      this.utilsService.showSnackBar('There is no any active filing year available')
      return;
    }
    const param = `/itr-status?userId=${this.userId}&assessmentYear=${currentFyDetails[0].assessmentYear}`;
    this.userMsService.getMethod(param).subscribe(compliteStatus => {
      this.latestCompiltedStatus = compliteStatus;
      console.log('Get all latest complited status: ', compliteStatus);
      // if (key === 'fromgetAllStatus') {
      this.stepper.reset();
      if (compliteStatus instanceof Array && compliteStatus.length > 0) {
        for (let i = 0; i < compliteStatus.length; i++) {
          if (compliteStatus[i].completed) {
            this.stepper.next();
          }
          console.log("selectedIndex " + i + ' ' + this.stepper.selectedIndex)
        }
      }
    },
      error => {

      });
  }
}
