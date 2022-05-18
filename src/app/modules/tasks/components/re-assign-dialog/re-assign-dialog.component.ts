import { UtilsService } from 'src/app/services/utils.service';
import { UserMsService } from './../../../../services/user-ms.service';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-re-assign-dialog',
  templateUrl: './re-assign-dialog.component.html',
  styleUrls: ['./re-assign-dialog.component.scss']
})
export class ReAssignDialogComponent implements OnInit {
  selectedAgentId: any;
  loading = false;

  constructor(public dialogRef: MatDialogRef<ReAssignDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userMsService: UserMsService,
    public utilsService: UtilsService
  ) {
    console.log('Selected UserID for notes',
      this.data.userId);
  }


  ngOnInit() {
  }

  reAssign() {
    if (this.utilsService.isNonEmpty(this.selectedAgentId)) {
      this.loading = true;
      const param = `/sme/user-agent-update?userId=${this.data.userId}&agentUserId=${this.selectedAgentId}&serviceType=${this.data.serviceType}&subscriptionId=0`
      this.userMsService.getMethod(param).subscribe((res: any) => {
        console.log(res);
        this.utilsService.showSnackBar('User re assigned successfully.');
        this.loading = false;
        this.dialogRef.close({ event: 'close', data: 'success' });
      }, error => {
        this.loading = false;
        this.utilsService.showSnackBar('Failed to re-assign the user, please try again');
        console.log(error);
      })
    }
  }

  fromSme(event) {
    this.selectedAgentId = event;
    console.log('this.selectedAgentId', this.selectedAgentId)
  }
}
