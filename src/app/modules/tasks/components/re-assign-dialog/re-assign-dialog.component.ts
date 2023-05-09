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
  ownerId: number;
  filerId: number;
  serviceType:any;

  constructor(public dialogRef: MatDialogRef<ReAssignDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userMsService: UserMsService,
    public utilsService: UtilsService
  ) {
    console.log('Selected UserID for reassignment',
      this.data.userId);
  }

  ngOnInit() {
    console.log('data from more opt',this.data)
    console.log('Selected User Service ',this.data.serviceType)
    // this.ownerId=this.data.ownerId;
    // this.filerId=this.data.filerId;
    // this.serviceType=this.data.serviceType;
  }

  fromSme(event, isOwner) {

    console.log('sme-drop-down', event, isOwner);

    if(isOwner){
       this.ownerId = event? event.userId : null;
      if(this.data.ownerName != event.name){
        if(this.data.serviceType == 'GST'){
          this.serviceType='GST';
        }else{
          this.serviceType='ALL';
        }
      }else{
        this.serviceType=this.data.serviceType;
      }
      console.log('ownerID=',this.ownerId )

    } else {
      this.filerId = event? event.userId : null;
      console.log('filerId=',this.filerId)
    }

    //  if( !this.ownerId && this.filerId) {
    //   this.ownerId = this.filerId;
    //   console.log('owner2',this.ownerId)
    //  }

  }

  reAssign() {
    // https://uat-api.taxbuddy.com/user/user-reassignment-new?userId=10363&serviceTypes=ITR&ownerUserId=7526&filerUserId=10341
    if(this.ownerId && this.filerId){
      this.loading = true;
      const param = `/user-reassignment-new?userId=${this.data.userId}&serviceTypes=${this.serviceType}&ownerUserId=${this.ownerId}&filerUserId=${this.filerId}`
      this.userMsService.getMethod(param).subscribe((res: any) => {
        console.log(res);
        this.utilsService.showSnackBar('User re assigned successfully.');
        this.loading = false;
        this.dialogRef.close({ event: 'close', data: 'success' });
        if(res.success== false){
          this.utilsService.showSnackBar(res.message)
          console.log(res.message)
        }
      }, error => {
        this.loading = false;
        this.utilsService.showSnackBar('Filer not found active, please try another.');
        console.log(error);
      })
    }else {
      this.utilsService.showSnackBar('Please select Both Owner And Filer Name');
    }

  }

  // fromSme(event) {
  //   this.selectedAgentId = event;
  //   console.log('this.selectedAgentId', this.selectedAgentId)
  // }
}
