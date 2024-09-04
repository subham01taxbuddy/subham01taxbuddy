import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-change-status',
  templateUrl: './change-status.component.html',
  styleUrls: ['./change-status.component.css'],
})
export class ChangeStatusComponent implements OnInit {
  loading!: boolean;
  itrStatus: any = [];
  callers: any = [];
  changeStatus!: UntypedFormGroup;
  hideUndoButton: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ChangeStatusComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel,
    private userService: UserMsService,
    private fb: UntypedFormBuilder,
    private utilsService: UtilsService,
    private _toastMessageService: ToastMessageService
  ) { }

  ngOnInit() {

    if ((this.data.serviceType === 'ITRU' || this.data.serviceType === 'ITR') && this.data.userInfo?.statusId === 14) {
      this.hideUndoButton = true;
    } else {
      this.hideUndoButton = false;
    }
    this.changeStatus = this.fb.group({
      selectStatus: [this.data?.userInfo?.statusId || null],
      callerAgentUserId: [''],
    });

    if (this.data.mode === 'Update Status') {
      this.changeStatus.controls['selectStatus'].setValidators([
        Validators.required,
      ]);
      this.changeStatus.controls['callerAgentUserId'].setValidators(null);
      this.changeStatus.controls['selectStatus'].updateValueAndValidity();
      this.changeStatus.controls['callerAgentUserId'].updateValueAndValidity();
      this.getStatus();
    } else if (this.data.mode === 'Update Caller') {
      this.changeStatus.controls['selectStatus'].setValidators(null);
      this.changeStatus.controls['callerAgentUserId'].setValidators([
        Validators.required,
      ]);
      this.changeStatus.controls['selectStatus'].updateValueAndValidity();
      this.changeStatus.controls['callerAgentUserId'].updateValueAndValidity();
      this.getCallers();
    }

    if (
      this.data.serviceType === '-' ||
      this.data.serviceType === null ||
      this.data.serviceType === undefined
    ) {
      this.data.serviceType = 'ITR';
    }
    console.log('this.data.userInfo : ', this.data.userInfo);
  }

  getStatus() {
    // 'https://dev-api.taxbuddy.com/user/itr-status-master/source/BACK_OFFICE?userId=8664&serviceType=ITR'
    let param = '/itr-status-master/source/BACK_OFFICE?userId=' + this.data.userId + '&serviceType=' + this.data.serviceType + '&itrChatInitiated=' + this.data.itrChatInitiated;
    this.userService.getMethod(param).subscribe(
      (response) => {
        console.log('status response: ', response);
        if (response instanceof Array && response.length > 0) {
          console.log('data: ', this.data);
          console.log(
            'sorted itr status array: ',
            response.filter((item: any) =>
              item.applicableServices.includes(this.data.serviceType)
            )
          );
          this.itrStatus = response;
        } else {
          this.itrStatus = [];
        }
      },
      (error) => {
        console.log('Error during fetching status info.');
      }
    );
  }

  getCallers() {
    let param = `/call-management/caller-agents`;
    this.userService.getMethod(param).subscribe(
      (response) => {
        console.log('status response: ', response);
        if (response instanceof Array && response.length > 0) {
          this.callers = response;
          this.callers.sort((a: any, b: any) => (a.name > b.name ? 1 : -1));
          this.callers = this.callers.filter(
            (item: any) =>
              item.callerAgentUserId !== this.data.userInfo.callerAgentUserId
          );
        } else {
          this.callers = [];
        }
      },
      (error) => {
        console.log('Error during fetching status info.');
      }
    );
  }

  setCallerName() {
    console.log(this.changeStatus.value.callerAgentUserId);
    let callerName = this.callers.filter(
      (item: any) =>
        item.callerAgentUserId === this.changeStatus.value.callerAgentUserId
    )[0].name;
    let callerNumber = this.callers.filter(
      (item: any) =>
        item.callerAgentUserId === this.changeStatus.value.callerAgentUserId
    )[0].mobileNumber;
    this.data.userInfo.callerAgentName = callerName;
    this.data.userInfo.callerAgentNumber = callerNumber;
  }

  addStatus = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      this.utilsService.getUserCurrentStatus(this.data.userInfo.userId).subscribe(
        (res: any) => {
          console.log(res);
          if (res.error) {
            this.utilsService.showSnackBar(res.error);
            this.dialogRef.close({ event: 'close', data: 'statusChanged' });
            return reject(res.error);
          } else {
            if (this.changeStatus.valid) {
              this.loading = true;
              if (this.data.mode === 'Update Status') {
                let param = '/itr-status';
                let sType = this.data.serviceType;
                if (
                  this.data.serviceType === '-' ||
                  this.data.serviceType === null ||
                  this.data.serviceType === undefined
                ) {
                  sType = 'ITR';
                }
                let param2 = {
                  statusId: this.changeStatus.controls['selectStatus'].value,
                  userId: this.data.userId,
                  assessmentYear: this.data.userInfo.assessmentYear,
                  completed: true,
                  serviceType: sType,
                };
                console.log('param2: ', param2);
                this.userService.postMethod(param, param2).toPromise().then(
                  (res) => {
                    console.log('Status update response: ', res);
                    this.loading = false;
                    this._toastMessageService.alert(
                      'success',
                      'Status update successfully.'
                    );
                    setTimeout(() => {
                      this.dialogRef.close({
                        event: 'close',
                        data: 'statusChanged',
                        response: res,
                      });
                    }, 4000);
                    resolve(res);
                  },
                  (error) => {
                    this.loading = false;
                    this._toastMessageService.alert(
                      'error',
                      'There is some issue to Update Status information.'
                    );
                    this.dialogRef.close({
                      event: 'close',
                      data: 'statusChanged',
                      response: error,
                    });
                    reject(error);
                  }
                ).catch((error) => {
                  this.loading = false;
                  reject(error);
                });
              } else if (this.data.mode === 'Update Caller') {
                let param = `/call-management/customers`;
                let reqBody = Object.assign(
                  this.data.userInfo,
                  this.changeStatus.getRawValue()
                );
                console.log('reqBody: ', reqBody);
                this.userService.putMethod(param, reqBody).toPromise().then(
                  (res) => {
                    console.log('Status update response: ', res);
                    this.loading = false;
                    this._toastMessageService.alert(
                      'success',
                      'Caller Agent update successfully.'
                    );
                    setTimeout(() => {
                      this.dialogRef.close({
                        event: 'close',
                        data: 'statusChanged',
                        response: res,
                      });
                    }, 4000);
                    resolve(res);
                  },
                  (error) => {
                    this.loading = false;
                    this._toastMessageService.alert(
                      'error',
                      'There is some issue to Update Caller Agent.'
                    );
                    this.dialogRef.close({
                      event: 'close',
                      data: 'statusChanged',
                      response: error,
                    });
                    reject(error);
                  }
                ).catch((error) => {
                  this.loading = false;
                  reject(error);
                });
              }
            }
          }
        },
        (error) => {
          this.loading = false;
          if (error.error && error.error.error) {
            this._toastMessageService.alert("error", error.error.error);
            this.dialogRef.close({ event: 'close', data: 'statusChanged' });
          } else {
            this._toastMessageService.alert("error", "An unexpected error occurred.");
          }
          reject(error);
        }
      );
    });
  }

  undoStatus = (): Promise<any> => {
    // 'https://uat-api.taxbuddy.com/user/previous-status' \
    return new Promise((resolve, reject) => {
      this.utilsService.getUserCurrentStatus(this.data.userInfo.userId).subscribe(
        (res: any) => {
          console.log(res);
          if (res.error) {
            this._toastMessageService.alert('error', res.error);
            this.dialogRef.close({ event: 'close', data: 'statusChanged' });
            return reject(res.error);
          } else {
            this.loading = true;
            let param = '/previous-status';
            let reqBody:any = {
              userId: this.data.userInfo.userId,
              serviceType: this.data.userInfo.serviceType,
            };
            if (this.data.userInfo.serviceType !== 'ITRU') {
              reqBody.assessmentYear = this.data.userInfo.assessmentYear;
            }
            this.userService.postMethod(param, reqBody).toPromise().then(
              (response: any) => {
                console.log('undo Status response: ', response);
                this.loading = false;
                if (response.success) {
                  this._toastMessageService.alert('success', response.message);
                } else {
                  this._toastMessageService.alert(
                    'error',
                    'There is some issue to Update Status information.'
                  );
                }

                setTimeout(() => {
                  this.dialogRef.close({
                    event: 'close',
                    data: 'statusChanged',
                    response: response,
                  });
                }, 3000);
                resolve(response);
              },
              (error) => {
                this.loading = false;
                if (error.error && error.error.error) {
                  this._toastMessageService.alert("error", error.error.error);
                  this.dialogRef.close({ event: 'close', data: 'statusChanged' });
                } else {
                  this._toastMessageService.alert("error", "An unexpected error occurred.");
                }
                reject(error);
              }
            ).catch((error) => {
              this.loading = false;
              reject(error);
            });
          }
        },
        (error) => {
          this.loading = false;
          if (error.error && error.error.error) {
            this._toastMessageService.alert("error", error.error.error);
            this.dialogRef.close({ event: 'close', data: 'statusChanged' });
          } else {
            this._toastMessageService.alert("error", "An unexpected error occurred.");
          }
          reject(error);
        }
      );
    });
  }
}

export interface ConfirmModel {
  userId: any;
  userName: string;
  clientName: string;
  serviceType: any;
  mode: any;
  userInfo: any;
  itrChatInitiated?: boolean;
  selectedStatus: any;
}
