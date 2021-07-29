import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { UserMsService } from 'app/services/user-ms.service';
import { ITR_JSON } from 'app/shared/interfaces/itr-input.interface';
import { AppConstants } from 'app/shared/constants';
import { UtilsService } from 'app/services/utils.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { WhatsAppDialogComponent } from '../whats-app-dialog/whats-app-dialog.component';
import { KommunicateDialogComponent } from '../kommunicate-dialog/kommunicate-dialog.component';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserNotesComponent } from 'app/shared/components/user-notes/user-notes.component';

@Component({
  selector: 'app-update-status',
  templateUrl: './update-status.component.html',
  styleUrls: ['./update-status.component.css']
})
export class UpdateStatusComponent implements OnInit {
  fillingStatus = new FormControl('', Validators.required);
  currentUrl: any = '';
  // ITR_JSON: ITR_JSON;
  @Input('userId') userId: any;
  @Output() sendValue = new EventEmitter<any>();
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
    /* {
      "createdDate": "2020-05-19T09:29:22.881Z",
      "id": "5ec3a6f2d5220f375473036d",
      "statusId": 3,
      "statusName": "Document Received",
      "sequence": 3,
      "source": "BACK_OFFICE",
      "active": true,
      "message": "",
      "channel": ""
    }, */
    /*  {
       "createdDate": "2020-05-19T09:29:37.125Z",
       "id": "5ec3a701d5220f375473036e",
       "statusId": 4,
       "statusName": "Document Reviewed",
       "sequence": 4,
       "source": "BACK_OFFICE",
       "active": true,
       "message": "",
       "channel": ""
     }, */
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
      "statusName": "ITR Confirmation Received",
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
      "statusName": "Invoice Sent",
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
    },
    {
      "id": "5f968b119c06cc000101b9a8",
      "statusId": 14,
      "statusName": "Backed Out",
      "sequence": 14,
      "source": "BACK_OFFICE",
      "active": true,
      "message": "",
      "channel": "",
    }
  ]

  constructor(private userMsService: UserMsService, public utilsService: UtilsService, private route: Router, private dialog: MatDialog,
    private _toastMessageService: ToastMessageService, private router: Router) {
    // this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
  }

  ngOnInit() {
    if (this.currentUrl === '/pages/itr-filing/customer-profile') {
      this.getFilingStatus();
    }
    this.getUserName();
  }
  ngAfterContentChecked() {
    this.currentUrl = this.router.url;
  }
  async getFilingStatus() {
    const fyList = await this.utilsService.getStoredFyList();
    const currentFyDetails = fyList.filter(item => item.isFilingActive);
    if (!(currentFyDetails instanceof Array && currentFyDetails.length > 0)) {
      this.utilsService.showSnackBar('There is no any active filing year available')
      return;
    }
    const param = `/itr-status?userId=${this.userId}&assessmentYear=${currentFyDetails[0].assessmentYear}`;
    this.userMsService.getMethod(param).subscribe(result => {
      console.log('Filing status for drop down:', result);
      if (result instanceof Array) {
        const completedStatus = result.filter(item => item.completed === 'true' || item.completed === true)
        const ids = completedStatus.map(status => status.statusId);
        const sorted = ids.sort((a, b) => a - b);
        this.fillingStatus.setValue(sorted[sorted.length - 1])
        this.sendValue.emit(sorted[sorted.length - 1]);
      }

    })
  }

  getUserKommunicateChat(kommunicateGroupId) {
    let param = `/gateway/kommunicate/chat/user/${kommunicateGroupId}`;
    this.userMsService.getMethodInfo(param).subscribe(result => {
      console.log('User kommunicate chat data: ', result);
      if (this.utilsService.isNonEmpty(result)) {
        let disposable = this.dialog.open(KommunicateDialogComponent, {
          width: '50%',
          height: 'auto',
          data: {
            chatData: result,
            kommunicateGroupId: kommunicateGroupId
          }
        })

        disposable.afterClosed().subscribe(result => {
          console.log('The dialog was closed');
        });
      }
    },
      error => {

      })
  }

  async updateStatus() {
    const fyList = await this.utilsService.getStoredFyList();
    const currentFyDetails = fyList.filter(item => item.isFilingActive);
    if (!(currentFyDetails instanceof Array && currentFyDetails.length > 0)) {
      this.utilsService.showSnackBar('There is no any active filing year available')
      return;
    }
    const param = '/itr-status'
    const request = {
      "statusId": Number(this.fillingStatus.value),
      "userId": this.userId,
      "assessmentYear": currentFyDetails[0].assessmentYear,
      "completed": true,
      "serviceType":"ITR"
    }

    // this.loading = true;
    this.userMsService.postMethod(param, request).subscribe(result => {
      console.log('##########################', result['statusId']);
      this.utilsService.showSnackBar('Filing status updated successfully.')
      this.sendValue.emit(result['statusId']);
      // this.loading = false;
    }, err => {
      // this.loading = false;
      this.utilsService.showSnackBar('Failed to update Filing status.')
    })
  }

  openUserChat() {
    let param = `/profile/${this.userId}`;
    this.userMsService.getMethod(param).subscribe((result: any) => {
      console.log('User profile data: ', result);
      let disposable = this.dialog.open(WhatsAppDialogComponent, {
        width: '50%',
        height: 'auto',
        data: {
          mobileNum: result.mobileNumber
        }
      })
      disposable.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
      });
    }, error => { })



  }

  kommunicateChat() {
    let param = `/profile/${this.userId}`;
    this.userMsService.getMethod(param).subscribe((result: any) => {
      console.log('User profile data: ', result);
      if (this.utilsService.isNonEmpty(result['kommunicateGroupId'])) {
        this.getUserKommunicateChat(result['kommunicateGroupId']);
      } else {
        this._toastMessageService.alert('error', 'User not initialted with Kommunicate chat')
      }
    }, error => { })


  }

  userName: any;
  getUserName(){
    let param = `/search/userprofile/query?userId=${this.userId}`;
    this.userMsService.getMethod(param).subscribe((result: any) => {
      console.log('User data: ', result);
      if (Array.isArray(result.records)) {
        var userInfo = result.records;
        this.userName = userInfo[0].fName+' '+userInfo[0].lName;
      }
      else{
        this.userName = '';
      }

      console.log('this.userName : ',this.userName)
    }, error => {
      console.log(error, 'There is issue during fetching user info.')
     })

  }

  showNotes() {
    let disposable = this.dialog.open(UserNotesComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: this.userId,
        clientName: this.utilsService.isNonEmpty(this.userName) ? this.userName : 'Dummy'
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
