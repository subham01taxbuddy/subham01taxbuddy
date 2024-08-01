import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-ack-success',
  templateUrl: './ack-success.component.html',
  styleUrls: ['./ack-success.component.scss']
})
export class AckSuccessComponent implements OnInit, OnDestroy {
  ITR_JSON: ITR_JSON;
  emailString: string = '';
  userName: string = '';
  DIRECT_UPLOAD_RES: any;
  loggedInUserRoles: any;
  constructor(public utilsService: UtilsService, private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel,
    private dialogRef: MatDialogRef<AckSuccessComponent>,
  ) {
    this.loggedInUserRoles = this.utilsService.getUserRoles();
  }

  ngOnInit() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.DIRECT_UPLOAD_RES = JSON.parse(sessionStorage.getItem('DIRECT_UPLOAD_RES'));
    console.log('DIRECT_UPLOAD_RES: ', this.DIRECT_UPLOAD_RES);
    this.emailString = 'mailto:' + this.ITR_JSON.email;
    const self = this.ITR_JSON.family.filter((item: any) => item.relationShipCode === 'SELF');
    if (self.length > 0) {
      this.userName = self[0].fName + " " + self[0].lName;
    }

  }
  ngOnDestroy() {
    sessionStorage.removeItem('DIRECT_UPLOAD_RES');
  }
  getAckNumber() {
    if (this.utilsService.isNonEmpty(this.ITR_JSON.ackNumber)) {
      return this.ITR_JSON.ackNumber;
    } else if (this.utilsService.isNonEmpty(this.DIRECT_UPLOAD_RES)) {
      return this.DIRECT_UPLOAD_RES['ackNo'];
    } else {
      return this.ITR_JSON.ackNumber;
    }
  }
  previousRoute() {
    this.router.navigate(['/pages/itr-filing/users']);
  }


  closeDialog() {
    this.dialogRef.close();
    this.router.navigate(['/tasks/filings']);
  }
}

export interface ConfirmModel {
  acknowledgementNo: any;
}