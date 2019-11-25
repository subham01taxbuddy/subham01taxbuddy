import { Component, OnInit } from '@angular/core';
import { UserMsService } from 'app/services/user-ms.service';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-update-email-dialog',
  templateUrl: './update-email-dialog.component.html',
  styleUrls: ['./update-email-dialog.component.css'],
  providers: [UserMsService]
})
export class UpdateEmailDialogComponent implements OnInit {
  isUpdated: boolean;
  confirmation_text = "NA";
  confirmation_popup_type = "";
  userData: any;
  emailAddress: string = "";
  loading: boolean = false;
  constructor(public modalRef: BsModalRef, private userMsService: UserMsService) { }

  ngOnInit() { }

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
      }, error => {
        this.loading = false;
        console.log('Email update failure:', error);
      })
    }
  }
}

