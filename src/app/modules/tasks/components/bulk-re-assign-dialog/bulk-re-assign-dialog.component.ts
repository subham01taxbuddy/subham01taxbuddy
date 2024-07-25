import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
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
  isServiceType = true;
  isReassignmentOutsideTeam = false;
  serviceType = new UntypedFormControl('', Validators.required);
  status = new UntypedFormControl('', Validators.required);

  ownerId1: any;
  ownerId2: any;
  filerId1: any;
  filerId2: any;
  loggedInUserRoles: any;
  ownerDropDownType = 'ASSIGNED';


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
    private userMsService: UserMsService,
    public utilsService: UtilsService
  ) { }

  ngOnInit() {

    this.getMasterStatusList();
    this.loggedInUserRoles = this.utilsService.getUserRoles();
    if (this.loggedInUserRoles.includes('ROLE_ADMIN') || this.loggedInUserRoles.includes('ROLE_LEADER')) {
      this.ownerDropDownType = 'ALL';
    } else {
      this.ownerDropDownType = 'ASSIGNED';
    }
  }
  async getMasterStatusList() {
    this.itrStatus = await this.utilsService.getStoredMasterStatusList();
    console.log('status dropdown list', this.itrStatus)
  }

  fromSme1(event, isOwner) {
    if (isOwner) {
      this.ownerId1 = event ? event.userId : null;
      console.log('ownerID1=', this.ownerId1)

    } else {
      this.filerId1 = event ? event.userId : null;
      console.log('filerId1=', this.filerId1)
    }
  }

  fromSme2(event, isOwner) {
    console.log('sme-drop-down 222', event, isOwner);
    if (isOwner) {
      this.ownerId2 = event ? event.userId : null;
      if (this.ownerId1 != this.ownerId2) {
        this.isServiceType = false;
        this.isReassignmentOutsideTeam = true;
      } else {
        this.serviceType.setValue(this.serviceType.value);
        this.isServiceType = true;
        this.isReassignmentOutsideTeam = false;
      }

      console.log('ownerID2=', this.ownerId2);

    } else {
      this.filerId2 = event ? event.join(',') : null;
      console.log('filerId2=', this.filerId2);
    }
  }

  reAssign() {
    // https://uat-api.taxbuddy.com/user/user-reassignment-bulk?fromFilerUserId=10341&serviceType=ITR&
    // statusId=18&isReassignmentOutsideTeam=false&filerUserIdList=3432,13431,1214,10431
    console.log('service Type', this.serviceType.value)
    console.log('status', this.status.value)
    console.log('isReassignmentOutsideTeam', this.isReassignmentOutsideTeam);
    console.log('filerUserIdList', this.filerId2)

    if (this.filerId1 && this.filerId2) {
      let paramValue = '';
      if (this.ownerId1 == this.ownerId2) {
        paramValue = `&serviceType=${this.serviceType.value}`
      }
      this.loading = true;
      let param = `/user-reassignment-bulk?fromFilerUserId=${this.filerId1}&statusId=${this.status.value}&isReassignmentOutsideTeam=${this.isReassignmentOutsideTeam}&filerUserIdList=${this.filerId2}` + paramValue;


      this.userMsService.getMethod(param).subscribe((res: any) => {
        this.loading = false;
        console.log(res);
        if (res.success) {
          this.utilsService.showSnackBar(' re assigned successfully.');
          this.dialogRef.close({ event: 'close', data: 'success' });
        }
        else {
          this.utilsService.showSnackBar('Failed to reassign as no data found for current selection');
        }
      }, error => {
        this.loading = false;
        this.utilsService.showSnackBar('Please select Both Owner And Filer Name');
        console.log(error);
      })

    } else {
      this.utilsService.showSnackBar('Please select Owner And Filer Names');
    }



  }
}
