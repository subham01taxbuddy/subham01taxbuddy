import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { UserMsService } from 'src/app/services/user-ms.service';

@Component({
  selector: 'app-update-email-dialog',
  templateUrl: './update-email-dialog.component.html',
  styleUrls: ['./update-email-dialog.component.css'],
  providers: [UserMsService]
})
export class UpdateEmailDialogComponent  {
  isUpdated!: boolean;
  confirmation_text = "NA";
  confirmation_popup_type = "";
  userData: any;
  emailAddress: string = "";
  loading: boolean = false;
  constructor(public modalRef: BsModalRef, private userMsService: UserMsService) { }


  onClosePopup() {
    this.isUpdated = false;
    this.modalRef.hide();
  }

  updateEmailPopUp() {
    this.loading = false;
    const userParam = `/profile/${this.userData.userId}`;
    if (this.emailAddress) {
      this.loading = true;
      this.userData.emailAddress = this.emailAddress
      this.userMsService.putMethod(userParam, this.userData).subscribe((res: any) => {
        this.loading = false;
        this.isUpdated = true;
        this.modalRef.hide();
        console.log('Email update success:', res);
      }, (error:any) => {
        this.loading = false;
        console.log('Email update failure:', error);
      })
    }
  }
}

