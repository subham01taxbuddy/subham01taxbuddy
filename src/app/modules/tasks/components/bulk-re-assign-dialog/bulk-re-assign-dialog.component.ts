import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-bulk-re-assign-dialog',
  templateUrl: './bulk-re-assign-dialog.component.html',
  styleUrls: ['./bulk-re-assign-dialog.component.scss']
})
export class BulkReAssignDialogComponent implements OnInit {
  loading = false;
  itrStatus: any = [];
  isServiceType= true;
  isReassignmentOutsideTeam=false;
  serviceType = new FormControl('', Validators.required);
  status = new FormControl('', Validators.required);

  ownerId1:any;
  ownerId2:any;
  filerId1:any;
  filerId2:any;


  serviceTypes = [
    {
      label: 'ITR',
      value: 'ITR',
    },
    {
      label: 'GST',
      value: 'GST',
    },
    {
      label: 'NOTICE',
      value: 'NOTICE',
    },
    {
      label: 'TPA',
      value: 'TPA',
    },
  ];

  constructor(
    public dialogRef: MatDialogRef<BulkReAssignDialogComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: any,
    private userMsService: UserMsService,
    public utilsService: UtilsService
  ) { }

  ngOnInit() {

    this.getMasterStatusList();
  }
  async getMasterStatusList() {
    this.itrStatus = await this.utilsService.getStoredMasterStatusList();
    console.log('status dropdown list',this.itrStatus)
  }

  fromSme1(event, isOwner) {
    if(isOwner){
      this.ownerId1 = event? event.userId : null;
     console.log('ownerID1=',this.ownerId1 )

   } else {
     this.filerId1 = event? event.userId : null;
     console.log('filerId1=',this.filerId1)
   }
  }

  // fromSme3(event, isOwner) {
  //   console.log('sme-drop-down 3333', event, isOwner);
  //   let commaSeparatedString = event.join(',');
  //   console.log('sme-drop-down 3333',commaSeparatedString)
  // }

  fromSme2(event, isOwner) {
    console.log('sme-drop-down 222', event, isOwner);
    if(isOwner){
      this.ownerId2 = event? event.userId : null;
      if(this.ownerId1 != this.ownerId2){
        // this.serviceType.setValue('ALL');
        this.isServiceType=false;
        this.isReassignmentOutsideTeam=true;
      }else{
        this.serviceType.setValue(this.serviceType.value);
        this.isServiceType=true;
        this.isReassignmentOutsideTeam=false;
      }

     console.log('ownerID2=',this.ownerId2);

   } else {
     this.filerId2 = event? event.join(',') : null;
     console.log('filerId2=',this.filerId2);
   }
  }

  reAssign() {
    // https://uat-api.taxbuddy.com/user/user-reassignment-bulk?fromFilerUserId=10341&serviceType=ITR&
    // statusId=18&isReassignmentOutsideTeam=false&filerUserIdList=3432,13431,1214,10431
    console.log('service Type',this.serviceType.value)
    console.log('status',this.status.value)
    console.log('isReassignmentOutsideTeam',this.isReassignmentOutsideTeam);
    console.log('filerUserIdList',this.filerId2)
      let paramValue = '';

      if(this.ownerId1 == this.ownerId2){
        paramValue =`&serviceType=${this.serviceType.value}`
       }
      this.loading = true;
      let  param = `/user-reassignment-bulk?fromFilerUserId=${this.filerId1}&statusId=${this.status.value}&isReassignmentOutsideTeam=${this.isReassignmentOutsideTeam}&filerUserIdList=${this.filerId2}`+ paramValue;


      this.userMsService.getMethod(param).subscribe((res: any) => {
        this.loading = false;
        console.log(res);
        if(res.success == true){
          this.utilsService.showSnackBar(' re assigned successfully.');
          this.dialogRef.close({ event: 'close', data: 'success' });
        }
        else{
          this.utilsService.showSnackBar('Failed to re-assign the users, please try again');
        }
      }, error => {
        this.loading = false;
        this.utilsService.showSnackBar('Failed to re-assign the users, please try again');
        console.log(error);
      })


  }
}
