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
  constructor(
    public dialogRef: MatDialogRef<ReAssignActionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userMsService: UserMsService,
    private utilsService: UtilsService,
  ) { }

  ngOnInit(): void {
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
}
