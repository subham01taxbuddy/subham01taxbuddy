import { UtilsService } from 'src/app/services/utils.service';
import { UserMsService } from './../../../../services/user-ms.service';
import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
declare function we_track(key: string, value: any);
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
  serviceType: any;
  reAssignedOwnerName: any;
  reAssignedFilerName: any;
  showOnlyLeader: boolean = false;
  showLeaderFiler: boolean = false;
  isServiceGst: boolean = false;
  roles: any;
  parentId: any;

  constructor(public dialogRef: MatDialogRef<ReAssignDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userMsService: UserMsService,
    public utilsService: UtilsService
  ) {
    if (this.data.serviceType === 'GST') {
      this.isServiceGst = true;
    } else {
      this.serviceType = false;
    }
    console.log('Selected UserID for reassignment',
      this.data.userId);
  }

  ngOnInit() {
    let loginSmeDetails = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    this.parentId = loginSmeDetails[0].parentId
    this.roles = this.utilsService.getUserRoles();
    console.log('data from more opt', this.data)
    console.log('Selected User Service ', this.data.serviceType)
    this.serviceType = this.data.serviceType;
    if (this.serviceType != 'ITR') {
      this.showOnlyLeader = true;
    } else {
      this.showOnlyLeader = false;
    }

    if (this.data.filerUserId === '-' || this.data.filerUserId === null) {
      this.showOnlyLeader = true;
      this.showLeaderFiler = false;
    } else {
      this.showLeaderFiler = true;
      this.showOnlyLeader = false;
    }

  }

  checkPermission() {
    let loggedInSmeUserId = this.utilsService.getLoggedInUserID();
    let param = `/sme-details-new/${loggedInSmeUserId}?ownersByLeader=true`;
    this.userMsService.getMethodNew(param).subscribe((result: any) => {
      console.log('owner list result -> ', result);
      let ownerList = result.data;
      let filteredList = ownerList.filter((item) => item.userId === this.data.userInfo.ownerUserId);
      if (!filteredList || filteredList.length <= 0) {
        this.utilsService.showSnackBar('You do not have permission to reassign this user.');
        this.dialogRef.close({ event: 'close', data: 'error' });
      }
    });

  }

  leaderId: number;
  agentId: number;
  searchAsPrinciple: boolean = false;

  fromOnlyLeader(event) {
    console.log('sme-drop-down', event);
    if (event) {
      this.leaderId = event ? event.userId : null;
    }
    if (this.leaderId) {
      this.agentId = this.leaderId;
    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }
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

    console.log('sme-drop-down', event, isOwner);

    if (isOwner) {
      this.ownerId = event ? event.userId : null;
      this.reAssignedOwnerName = event ? event.name : '';
      if (this?.data?.ownerName != event?.name) {
        if (this.data.serviceType == 'GST') {
          this.serviceType = 'GST';
        } else {
          this.serviceType = 'ALL';
        }
      } else {
        this.serviceType = this.data.serviceType;
      }
      console.log('ownerID=', this.ownerId)

    } else {
      this.reAssignedFilerName = event ? event.name : '';
      this.filerId = event ? event.userId : null;
      console.log('filerId=', this.filerId)
    }
  }

  reAssign() {
    // 'https://uat-api.taxbuddy.com/user/v2/user-reassignment?userId=13621&serviceType=ITR&filerUserId=14198'
    this.utilsService.getUserCurrentStatus(this.data.userId).subscribe((res: any) => {
      console.log(res);
      if (res.error) {
        this.utilsService.showSnackBar(res.error);
        this.dialogRef.close({ event: 'close', data: 'success' });
        return;
      } else {
        if (this.leaderId || this.filerId) {
          this.loading = true;
          let leaderFilter = '';
          if (this.leaderId) {
            leaderFilter += `&leaderUserId=${this.leaderId}`
          }
          let filerFilter = '';
          if (this.filerId) {
            leaderFilter = '';
            filerFilter += `&filerUserId=${this.filerId}`
          }
          const param = `/v2/user-reassignment?userId=${this.data.userId}&serviceType=${this.serviceType}${leaderFilter}${filerFilter}`
          this.userMsService.getMethod(param).subscribe((res: any) => {
            console.log(res);
            we_track('Re-assign', {
              'User Name': this.data?.userInfo?.name,
              'User Number': this.data?.userInfo?.mobileNumber,
              'From filer ': this.data?.userInfo?.filerName,
              'From Owner': this.data?.userInfo?.ownerName,
              'To filer ': this.reAssignedFilerName,
              'To Owner': this.reAssignedOwnerName
            });
            this.utilsService.showSnackBar('User re assigned successfully.');
            this.loading = false;
            this.dialogRef.close({ event: 'close', data: 'success' });
            if (res.success == false) {
              this.utilsService.showSnackBar(res.error)
              console.log(res.message)
            }
          }, error => {
            this.loading = false;
            this.utilsService.showSnackBar('Filer not found active, please try another.');
            console.log(error);
            this.dialogRef.close({ event: 'close', data: 'success' });
          })
        } else {
          this.utilsService.showSnackBar('Please select leader/Filer Name');
        }
      }
    }, error => {
      this.loading = false;
      if (error.error && error.error.error) {
        this.utilsService.showSnackBar(error.error.error);
        this.dialogRef.close({ event: 'close', data: 'success' });
      } else {
        this.utilsService.showSnackBar("An unexpected error occurred.");
      }
    });
  }

}
