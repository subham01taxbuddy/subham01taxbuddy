import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ItrMsService } from 'src/app/services/itr-ms.service';
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
  ownerDropDownType = 'ASSIGNED';
  loggedInUserRoles:any;
  constructor(
    public dialogRef: MatDialogRef<ReAssignActionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userMsService: UserMsService,
    private utilsService: UtilsService,
  ) { }

  ngOnInit(): void {
    console.log('data from selected rows',this.data)
    this.loggedInUserRoles = this.utilsService.getUserRoles();

     if(this.loggedInUserRoles.includes('ROLE_LEADER')) {
      this.checkPermission();
    }
  }

  checkPermission(){
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
      // let filteredList = ownerList.filter((item) => item.userId === this.data?.data?.ownerUserId);
      if(!filteredList || filteredList.length <= 0){
        this.utilsService.showSnackBar('You do not have permission to reassign this user.');
        this.dialogRef.close({ event: 'close', data: 'error' });
      }
    });

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

  reAssign(){
    if(this.filerId){
      this.reAssignment();
    }else{
      this.leaderLevelReassignment();
    }
  }

  reAssignment() {
    if (this.filerId) {
      let userIdList = [];
      this.data.data.forEach(item => {
        userIdList.push(item.userId);
      });
      // https://uat-api.taxbuddy.com/user/user-action-with-assignment?toFilerUserId=6999&userIdList=1312,23231,4321
      let param = '/user-action-with-assignment?toFilerUserId=' + this.filerId + '&userIdList=' + userIdList.toString();
      this.userMsService.getMethod(param).subscribe((result: any) => {
        this.loading = false;
        if (result.success) {
          this.utilsService.showSnackBar(result.message);
          this.dialogRef.close({ event: 'close', data: 'success' });
        } else {
          this.utilsService.showSnackBar(result.message);
        }
      }, error => {
        this.loading = false;
        this.utilsService.showSnackBar(error.error.error);
      });
    } else {
      this.utilsService.showSnackBar('Please select Filer Name');
    }
  }

  leaderLevelReassignment(){
    // this.utilsService.showSnackBar("into leader assig");
    //https://uat-api.taxbuddy.com/user/user-reassignment-new?userId=10604&serviceTypes=ALL&ownerUserId=7522&filerUserId=7522'
    if(this.ownerId){
      let userIdList = [];
      this.data.data.forEach(item => {
        userIdList.push(item.userId);
      });
      userIdList.forEach(userId => {
        let param = `/user-reassignment-new?userId=${userId}&serviceTypes=ALL&ownerUserId=${this.ownerId}&filerUserId=${this.ownerId}`
        this.userMsService.getMethod(param).subscribe((result: any) => {
          this.loading = false;
          if (result.success) {
            this.utilsService.showSnackBar('User re assigned successfully.');
            this.dialogRef.close({ event: 'close', data: 'success' });
          } else {
            this.utilsService.showSnackBar(result.message);
          }
        },
        error => {
          this.loading = false;
          this.utilsService.showSnackBar(error.error.error);
        });
      })
    }else {
      this.utilsService.showSnackBar('Please select Owner Name');
    }
  }
}
