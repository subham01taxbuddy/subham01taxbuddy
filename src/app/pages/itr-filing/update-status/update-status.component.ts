import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { UserMsService } from 'app/services/user-ms.service';
import { ITR_JSON } from 'app/shared/interfaces/itr-input.interface';
import { AppConstants } from 'app/shared/constants';
import { UtilsService } from 'app/services/utils.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { WhatsAppDialogComponent } from '../whats-app-dialog/whats-app-dialog.component';
import { KommunicateDialogComponent } from '../kommunicate-dialog/kommunicate-dialog.component';

@Component({
  selector: 'app-update-status',
  templateUrl: './update-status.component.html',
  styleUrls: ['./update-status.component.css']
})
export class UpdateStatusComponent implements OnInit {
  fillingStatus = new FormControl('', Validators.required);
  ITR_JSON: ITR_JSON;
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

  constructor(private userMsService: UserMsService, public utilsService: UtilsService, private route: Router, private dialog: MatDialog) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
  }

  ngOnInit() {
    this.getFilingStatus();
  }

  getFilingStatus() {
    const param = `/itr-status?userId=${this.ITR_JSON.userId}&assessmentYear=${AppConstants.ayYear}`;
    this.userMsService.getMethod(param).subscribe(result => {
      if (result instanceof Array) {
        const completedStatus = result.filter(item => item.completed === 'true' || item.completed === true)
        const ids = completedStatus.map(status => status.statusId);
        const sorted = ids.sort((a, b) => a - b);
        this.fillingStatus.setValue(sorted[sorted.length - 1])
      }

    })
  }

  updateStatus() {
    const param = '/itr-status'
    const request = {
      "statusId": Number(this.fillingStatus.value),
      "userId": this.ITR_JSON.userId,
      "assessmentYear": AppConstants.ayYear,
      "completed": true
    }

    // this.loading = true;
    this.userMsService.postMethod(param, request).subscribe(result => {
      console.log(result);
      this.utilsService.showSnackBar('Filing status updated successfully.')
      // this.loading = false;
    }, err => {
      // this.loading = false;
      this.utilsService.showSnackBar('Failed to update Filing status.')
    })
  }

  openUserChat(){
    let disposable = this.dialog.open(WhatsAppDialogComponent, {
      width:  '50%',
      height: 'auto',
      data: {
       mobileNum: this.ITR_JSON.contactNumber
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  kommunicateChat(){
    let disposable = this.dialog.open(KommunicateDialogComponent, {
      width:  '50%',
      height: 'auto'
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
