import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-re-assign-action-dialog',
  templateUrl: './re-assign-action-dialog.component.html',
  styleUrls: ['./re-assign-action-dialog.component.scss']
})
export class ReAssignActionDialogComponent implements OnInit {
  agentId: number;
  loading: boolean;
  ownerId: number;
  filerId: number;
  leaderId: number;
  searchAsPrinciple: boolean = false;
  ownerDropDownType = 'ASSIGNED';
  loggedInUserRoles: any;
  showErrorTable: boolean = false;
  errorData: any;
  @ViewChild('errorTableTemplate') errorTableTemplate: TemplateRef<any>;
  constructor(
    public dialogRef: MatDialogRef<ReAssignActionDialogComponent>,
    private dialogRef1: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userMsService: UserMsService,
    private utilsService: UtilsService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    console.log('data from selected rows', this.data)
    this.loggedInUserRoles = this.utilsService.getUserRoles();
  }

  checkPermission() {
    let loggedInSmeUserId = this.utilsService.getLoggedInUserID();
    let param = `/sme-details-new/${loggedInSmeUserId}?ownersByLeader=true`;
    this.userMsService.getMethodNew(param).subscribe((result: any) => {
      console.log('owner list result -> ', result);
      let ownerList = result.data;
      let ownerIdList = [];
      this.data.data.forEach(item => {
        ownerIdList.push(item.ownerUserId);
      });
      let filteredList = ownerList.filter((item) => ownerIdList.includes(item.userId));
      if (!filteredList || filteredList.length <= 0) {
        this.utilsService.showSnackBar('You do not have permission to reassign this user.');
        this.dialogRef.close({ event: 'close', data: 'error' });
      }
    });

  }

  fromLeader(event) {
    if (event) {
      this.leaderId = event ? event.userId : null;
    }
  }
  fromPrinciple(event) {
    if (event) {
      if (event?.partnerType === 'PRINCIPAL') {
        this.filerId = event ? event.userId : null;

        this.searchAsPrinciple = true;
      } else {
        this.filerId = event ? event.userId : null;

        this.searchAsPrinciple = false;
      }
    }
  }

  fromChild(event) {
    if (event) {
      this.filerId = event ? event.userId : null;
    }
  }

  fromSme(event, isOwner) {
    if (isOwner) {
      this.ownerId = event ? event.userId : null;
    } else {
      this.filerId = event ? event.userId : null;
    }
    if (this.filerId) {
      this.agentId = this.filerId;
    } else if (this.ownerId) {
      this.agentId = this.ownerId;
    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }
  }

  reAssign() {
    if (this.filerId) {
      this.reAssignment();
    } else {
      this.leaderLevelReassignment();
    }
  }

  reAssignmentForFiler = (): Promise<any> => {
     //https://uat-api.taxbuddy.com/user/v2/bulk-reassignment-to-filer?userIdList=14157,14159&filerUserId=14129
    return new Promise((resolve, reject) => {
      this.loading = true;
      let userIdList = this.data.data.map(row => row.userId).join(',');

      this.utilsService.getUserCurrentStatus(userIdList).subscribe(
        (res: any) => {
          console.log(res);
          if (res.error) {
            this.utilsService.showSnackBar(res.error);
            this.dialogRef.close({ event: 'close', data: 'success' });
            this.loading = false;
            return reject(res.error);
          } else {
            if (this.filerId) {
              let userIdList = [];
              this.data.data.forEach(item => {
                userIdList.push(item.userId);
              });
              this.loading = true;
              let param = '/v2/bulk-reassignment-to-filer?userIdList=' + userIdList.toString() + '&filerUserId=' + this.filerId;

              this.userMsService.getMethod(param).toPromise().then(
                (result: any) => {
                  this.loading = false;
                  if (result.data && result.data.length === 0) {
                    this.utilsService.showSnackBar('User re-assignment completed successfully');
                    this.dialogRef.close({ event: 'close', data: 'success' });
                    resolve(result);
                  } else if (result.data && result.data.length > 0) {
                    this.showErrorTable = true;
                    this.errorData = result.data;
                    this.dialog.open(this.errorTableTemplate, {
                      width: '65%',
                      height: 'auto',
                      data: {
                        data: result.data
                      },
                      disableClose: true
                    });
                    resolve(result);
                  } else {
                    this.loading = false;
                    this.utilsService.showSnackBar(result.error);
                    this.dialogRef.close({ event: 'close', data: 'success' });
                    resolve(result);
                  }
                },
                error => {
                  this.loading = false;
                  this.utilsService.showSnackBar(error.error.error);
                  this.dialogRef.close({ event: 'close', data: 'success' });
                  reject(error);
                }
              ).catch(() => {
                this.loading = false;
                reject(new Error('An unexpected error occurred.'));
              });
            } else {
              this.loading = false;
              this.utilsService.showSnackBar('Please select Filer Name');
              reject(new Error('Please select Filer Name'));
            }
          }
        },
        error => {
          this.loading = false;
          if (error.error && error.error.error) {
            this.utilsService.showSnackBar(error.error.error);
            this.dialogRef.close({ event: 'close', data: 'success' });
          } else {
            this.utilsService.showSnackBar('An unexpected error occurred.');
          }
          reject(error);
        }
      );
    });
  };

  reAssignmentForLeader = (): Promise<any> => {
     //https://uat-api.taxbuddy.com/user/v2/bulk-reassignment-to-leader?userIdList=14157,14159
    //&serviceType=ITR&leaderUserId=14129&filerUserId=1234
    return new Promise((resolve, reject) => {
      this.loading = true;
      let userIdList = this.data.data.map(row => row.userId).join(',');

      this.utilsService.getUserCurrentStatus(userIdList).subscribe(
        (res: any) => {
          console.log(res);
          if (res.error) {
            this.utilsService.showSnackBar(res.error);
            this.dialogRef.close({ event: 'close', data: 'success' });
            this.loading = false;
            return reject(res.error);
          } else {
            if (this.leaderId) {
              let userIdList = [];
              this.data.data.forEach(item => {
                userIdList.push(item.userId);
              });

              this.loading = true;
              let serviceType = this.data.data[0].serviceType;
              let userFilter = '';
              if (this.leaderId) {
                userFilter += `&leaderUserId=${this.leaderId}`;
              }
              if (this.filerId) {
                userFilter += `&filerUserId=${this.filerId}`;
              }
              let param =
                '/v2/bulk-reassignment-to-leader?userIdList=' +
                userIdList.toString() +
                `&serviceType=${serviceType}${userFilter}`;

              this.userMsService.getMethod(param).toPromise().then(
                (result: any) => {
                  this.loading = false;
                  if (result.data && result.data.length === 0) {
                    this.utilsService.showSnackBar('User re-assignment completed successfully');
                    this.dialogRef.close({ event: 'close', data: 'success' });
                    resolve(result);
                  } else if (result.data && result.data.length > 0) {
                    this.showErrorTable = true;
                    this.errorData = result.data;
                    this.dialog.open(this.errorTableTemplate, {
                      width: '65%',
                      height: 'auto',
                      data: {
                        data: result.data
                      },
                      disableClose: true
                    });
                    resolve(result);
                  } else {
                    this.loading = false;
                    this.utilsService.showSnackBar(result.error);
                    this.dialogRef.close({ event: 'close', data: 'success' });
                    resolve(result);
                  }
                },
                error => {
                  this.loading = false;
                  this.utilsService.showSnackBar(error.error.error);
                  this.dialogRef.close({ event: 'close', data: 'success' });
                  reject(error);
                }
              ).catch(() => {
                this.loading = false;
                reject(new Error('An unexpected error occurred.'));
              });
            } else {
              this.loading = false;
              this.utilsService.showSnackBar('Please select leader Name to reassign');
              reject(new Error('Please select leader Name to reassign'));
            }
          }
        },
        error => {
          this.loading = false;
          if (error.error && error.error.error) {
            this.utilsService.showSnackBar(error.error.error);
            this.dialogRef.close({ event: 'close', data: 'success' });
          } else {
            this.utilsService.showSnackBar('An unexpected error occurred.');
          }
          reject(error);
        }
      );
    });
  };


  closeErrorTable() {
    this.dialogRef.close({ event: 'close', data: 'success' });
    this.dialogRef1.close();
    this.dialog.closeAll();
  }

  progressMessage: string = '';

  async reAssignment() {
    //https://uat-api.taxbuddy.com/user/user-reassignment-new?userId=10604&serviceTypes=ALL&ownerUserId=7522&filerUserId=7522'
    if (this.filerId) {
      this.loading = true;
      const userIdList = this.data.data.map(item => item.userId);
      const totalUsers = userIdList.length;
      let completedUsers = 0;

      for (let i = 0; i < totalUsers; i++) {
        const userId = userIdList[i];
        let param = `/user-reassignment-new?userId=${userId}&serviceTypes=ITR&ownerUserId=${this.ownerId}&filerUserId=${this.filerId}`
        try {
          const result: any = await this.userMsService.getMethod(param).toPromise();
          completedUsers++;
          this.updateProgress(completedUsers, totalUsers);
          this.loading = false;
        } catch (error) {
          this.loading = false;
          this.utilsService.showSnackBar(error.error.error);
        }
      }
      this.utilsService.showSnackBar('User re-assignment Completed.');
      this.loading = false;
      this.dialogRef.close({ event: 'close', data: 'success' });
    } else {
      this.utilsService.showSnackBar('Please select Filer Name');
    }
  }

  updateProgress(completedUsers: number, totalUsers: number) {
    this.progressMessage = `${completedUsers} out of ${totalUsers} re-assignment completed`;

  }

  async leaderLevelReassignment() {
    // this.utilsService.showSnackBar("into leader assig");
    //https://uat-api.taxbuddy.com/user/user-reassignment-new?userId=10604&serviceTypes=ALL&ownerUserId=7522&filerUserId=7522'
    if (this.ownerId) {
      this.loading = true;
      const userIdList = this.data.data.map(item => item.userId);
      const totalUsers = userIdList.length;
      let completedUsers = 0;

      for (let i = 0; i < totalUsers; i++) {
        const userId = userIdList[i];
        const param = `/user-reassignment-new?userId=${userId}&serviceTypes=ALL&ownerUserId=${this.ownerId}&filerUserId=${this.ownerId}`;
        try {
          const result: any = await this.userMsService.getMethod(param).toPromise();
          completedUsers++;
          this.updateProgress(completedUsers, totalUsers);
          this.loading = false;
        } catch (error) {
          this.loading = false;
          this.utilsService.showSnackBar(error.error.error);
        }
      }
      this.utilsService.showSnackBar('User re-assignment Completed.');
      this.loading = false;
      this.dialogRef.close({ event: 'close', data: 'success' });
    } else {
      this.utilsService.showSnackBar('Please select Owner Name');
    }
  }

}
